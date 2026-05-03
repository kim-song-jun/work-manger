r"""Reliable outbox + Celery dispatch worker for notifications.

Why an outbox? Provider sends are network calls and must NOT happen inside the
business transaction that produced the notification. The outbox row is written
in the same atomic block as the :class:`NotificationLog` row; the Celery worker
picks it up after commit, calls the provider STUB, and updates both rows.

Status machine (see :class:`apps.notification.models.NotificationOutbox`)::

    PENDING --enqueue--> SENDING --provider ok-->  SENT
                                  \--provider fail--> FAILED (re-scheduled)
                                                  \--max retries--> DEAD

Backoff is fixed (no jitter for v1) per requirement: 30s, 1m, 5m, 15m, 60m.
"""
from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any
from uuid import UUID

from celery import shared_task
from django.db import transaction
from django.utils import timezone as django_tz

from apps.identity.models import Membership

from .models import NotificationLog, NotificationOutbox
from .providers import send as provider_send

logger = logging.getLogger(__name__)

# Fixed backoff schedule applied AFTER an attempt (attempt index = attempts after increment).
# attempts=1 -> wait BACKOFF_SECONDS[0] before next try, etc.
BACKOFF_SECONDS: tuple[int, ...] = (30, 60, 5 * 60, 15 * 60, 60 * 60)

LOG_LINK_KEY = "_log_id"
LAST_ERROR_MAX_LEN = 256


def _next_attempt_after(attempts: int) -> django_tz.datetime:
    """Return now() + backoff for an attempt count (1-indexed)."""
    idx = max(0, min(attempts - 1, len(BACKOFF_SECONDS) - 1))
    return django_tz.now() + timedelta(seconds=BACKOFF_SECONDS[idx])


def enqueue(
    membership: Membership,
    *,
    channel: str,
    event_kind: str,
    payload: dict[str, Any],
) -> NotificationOutbox:
    """Create an outbox row.

    Intended to be called inside a ``transaction.atomic()`` block (e.g.
    :func:`apps.notification.services.dispatch`) so the Outbox row commits in
    the same transaction as the corresponding :class:`NotificationLog` row.

    NOTE: This function does NOT enqueue the Celery task itself — that happens
    via :func:`schedule_pending_after_commit`, which the caller invokes after
    the outer atomic block exits. Splitting the two steps avoids relying on
    ``transaction.on_commit`` (whose semantics differ between
    ``TestCase`` and ``TransactionTestCase`` in pytest-django) and keeps the
    provider network call strictly outside the DB transaction window.
    """
    return NotificationOutbox.objects.create(
        membership=membership,
        channel=channel,
        event_kind=event_kind,
        payload_json=payload,
        status=NotificationOutbox.Status.PENDING,
        next_attempt_at=django_tz.now(),
    )


def schedule(outbox_id: str | UUID) -> None:
    """Hand the outbox row to Celery (inline under CELERY_TASK_ALWAYS_EAGER).

    Call this AFTER the atomic block that created the row commits, so the
    worker never sees a row that was rolled back.
    """
    process_one.delay(str(outbox_id))


def _truncate(s: str | None) -> str:
    if not s:
        return ""
    return s if len(s) <= LAST_ERROR_MAX_LEN else s[:LAST_ERROR_MAX_LEN]


def _link_log(payload: dict[str, Any]) -> NotificationLog | None:
    log_id = payload.get(LOG_LINK_KEY) if isinstance(payload, dict) else None
    if not log_id:
        return None
    try:
        return NotificationLog.objects.filter(id=log_id).first()
    except (ValueError, TypeError):
        return None


def _mark_log_delivered(payload: dict[str, Any], when: django_tz.datetime) -> None:
    log = _link_log(payload)
    if log is not None and log.delivered_at is None and log.failed_at is None:
        log.delivered_at = when
        log.save(update_fields=["delivered_at"])


def _mark_log_failed(payload: dict[str, Any], when: django_tz.datetime, err: str) -> None:
    log = _link_log(payload)
    if log is None:
        return
    log.failed_at = when
    # NotificationLog has no last_error column today; stash truncated reason in payload_json.
    payload_copy = dict(log.payload_json or {})
    payload_copy["_last_error"] = _truncate(err)
    log.payload_json = payload_copy
    log.save(update_fields=["failed_at", "payload_json"])


@shared_task(name="notification.outbox.process_one", bind=True)
def process_one(self, outbox_id: str) -> str:  # noqa: ARG001 (bind=True keeps celery happy)
    """Send one outbox row.

    Locks the row via SELECT ... FOR UPDATE SKIP LOCKED so concurrent workers
    cannot double-send. Provider call happens AFTER lock acquisition but the
    actual network IO is the stub — for the real impl move provider_send out
    of the transaction (we already commit the SENDING transition before calling
    so the lock window is short).
    """
    # Phase 1: claim the row by flipping PENDING/FAILED -> SENDING under SKIP LOCKED.
    with transaction.atomic():
        row = (
            NotificationOutbox.objects.select_for_update(skip_locked=True)
            .filter(
                id=outbox_id,
                status__in=(
                    NotificationOutbox.Status.PENDING,
                    NotificationOutbox.Status.FAILED,
                ),
            )
            .first()
        )
        if row is None:
            # Either a sibling worker grabbed it, or it's already SENT/DEAD.
            return "skipped"
        row.status = NotificationOutbox.Status.SENDING
        row.attempts = (row.attempts or 0) + 1
        row.updated_at = django_tz.now()
        row.save(update_fields=["status", "attempts", "updated_at"])
        membership = row.membership
        channel = row.channel
        payload = dict(row.payload_json or {})

    # Phase 2: provider call OUTSIDE the DB transaction (network IO antipattern guard).
    try:
        result = provider_send(channel, payload, membership)
    except Exception as exc:  # noqa: BLE001 — provider can raise anything
        result = None
        provider_error: str | None = f"{type(exc).__name__}: {exc}"
    else:
        provider_error = None if result.success else (result.error or "unknown provider error")

    now = django_tz.now()

    # Phase 3: persist the outcome.
    with transaction.atomic():
        row = NotificationOutbox.objects.select_for_update().get(id=outbox_id)
        if result is not None and result.success:
            row.status = NotificationOutbox.Status.SENT
            row.sent_at = now
            row.last_error = ""
            row.provider_message_id = result.provider_message_id or ""
            row.updated_at = now
            row.save(
                update_fields=[
                    "status",
                    "sent_at",
                    "last_error",
                    "provider_message_id",
                    "updated_at",
                ]
            )
            _mark_log_delivered(payload, now)
            return "sent"

        # Failure path
        row.last_error = _truncate(provider_error)
        if row.attempts >= row.max_attempts:
            row.status = NotificationOutbox.Status.DEAD
            row.updated_at = now
            row.save(update_fields=["status", "last_error", "updated_at"])
            _mark_log_failed(payload, now, row.last_error)
            logger.warning(
                "notification.outbox.dead id=%s channel=%s event=%s err=%s",
                row.id,
                row.channel,
                row.event_kind,
                row.last_error,
            )
            return "dead"

        row.status = NotificationOutbox.Status.FAILED
        row.next_attempt_at = _next_attempt_after(row.attempts)
        row.updated_at = now
        row.save(
            update_fields=[
                "status",
                "next_attempt_at",
                "last_error",
                "updated_at",
            ]
        )
        return "failed"


@shared_task(name="notification.outbox.dispatch_due")
def dispatch_due(limit: int = 200) -> int:
    """Beat-driven sweep: re-enqueue PENDING/FAILED rows whose next_attempt_at <= now.

    Returns the number of rows re-enqueued.
    """
    now = django_tz.now()
    ids = list(
        NotificationOutbox.objects.filter(
            status__in=(
                NotificationOutbox.Status.PENDING,
                NotificationOutbox.Status.FAILED,
            ),
            next_attempt_at__lte=now,
        )
        .order_by("next_attempt_at")
        .values_list("id", flat=True)[:limit]
    )
    for outbox_id in ids:
        process_one.delay(str(outbox_id))
    return len(ids)


__all__ = [
    "BACKOFF_SECONDS",
    "LOG_LINK_KEY",
    "dispatch_due",
    "enqueue",
    "process_one",
    "schedule",
]
