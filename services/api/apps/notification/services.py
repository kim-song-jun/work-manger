"""Notification dispatch — Service layer.

Architecture (Phase 1):
    Caller -> services.dispatch()
                |
                v
    [transaction.atomic]
        write NotificationLog (delivered_at = NULL, pending)
        write NotificationOutbox via outbox.enqueue()
    [/transaction]
                |
                v (after commit)
    Celery worker (notification.outbox.process_one)
        -> providers.send(channel, payload, membership)
        -> on success: Outbox.SENT + Log.delivered_at = now
        -> on failure: increment attempts, reschedule with backoff,
           and on max_attempts: Outbox.DEAD + Log.failed_at + last_error.

Channels honored: PUSH, EMAIL, INAPP. Defaults to INAPP only when no channels
list is provided. ``NotificationPreference.enabled = False`` suppresses a
channel for the (membership, event_kind) tuple.
"""
from __future__ import annotations

from collections.abc import Iterable
from typing import Any
from uuid import UUID

from django.db import transaction
from django.utils import timezone as django_tz

from apps.identity.models import Membership

from . import outbox as _outbox
from .models import NotificationLog, NotificationPreference

DEFAULT_CHANNELS = ("INAPP",)
ALL_CHANNELS = ("PUSH", "EMAIL", "INAPP")


def _allowed(membership: Membership, channel: str, event_kind: str) -> bool:
    pref = NotificationPreference.objects.filter(
        membership=membership, channel=channel, event_kind=event_kind
    ).first()
    if pref is None:
        return True  # default opt-in
    return bool(pref.enabled)


def _broadcast_inapp(membership: Membership, log: NotificationLog, payload: dict[str, Any]) -> None:
    """Best-effort real-time inbox push. MUST never raise — additive only."""
    try:
        from apps.realtime import broadcast as _ws_broadcast

        _ws_broadcast.notify_inbox(
            membership,
            "notification.created",
            {
                "id": str(log.id),
                "event_kind": log.event_kind,
                "channel": log.channel,
                "payload": payload,
                "created_at": log.created_at.isoformat() if log.created_at else None,
            },
        )
    except Exception:  # noqa: BLE001
        pass


def dispatch(
    membership: Membership,
    *,
    event_kind: str,
    payload: dict[str, Any],
    channels: Iterable[str] | None = None,
) -> list[NotificationLog]:
    """Persist Log+Outbox rows per channel; provider sends happen via Celery.

    Returns the list of created :class:`NotificationLog` rows. Their
    ``delivered_at`` is initially NULL — the outbox worker fills it on success
    or sets ``failed_at`` on terminal failure.

    Both writes (Log + Outbox) execute in the SAME ``transaction.atomic`` block
    so we never publish a Celery task referencing a row that was rolled back
    (the ``transaction.on_commit`` hook in :func:`outbox.enqueue` enforces it).
    """
    chans = list(channels) if channels else list(DEFAULT_CHANNELS)
    created: list[NotificationLog] = []
    pending_outbox_ids: list[str] = []

    with transaction.atomic():
        for ch in chans:
            if ch not in ALL_CHANNELS:
                continue
            if not _allowed(membership, ch, event_kind):
                continue
            log = NotificationLog.objects.create(
                membership=membership,
                event_kind=event_kind,
                channel=ch,
                payload_json=payload,
            )
            outbox_payload = dict(payload)
            outbox_payload[_outbox.LOG_LINK_KEY] = str(log.id)
            row = _outbox.enqueue(
                membership,
                channel=ch,
                event_kind=event_kind,
                payload=outbox_payload,
            )
            created.append(log)
            pending_outbox_ids.append(str(row.id))

    # Provider call MUST happen outside the DB transaction (ops antipattern guard).
    # Atomic block above is closed; rows are committed; safe to dispatch.
    for outbox_id in pending_outbox_ids:
        _outbox.schedule(outbox_id)

    # Refresh to surface delivered_at / failed_at populated by the eager worker.
    for log in created:
        log.refresh_from_db()
        if log.channel == "INAPP":
            _broadcast_inapp(membership, log, payload)
    return created


def mark_read(membership: Membership, ids: Iterable[UUID]) -> int:
    """Set read_at=now for unread logs in `ids`. Returns count updated."""
    now = django_tz.now()
    qs = NotificationLog.objects.filter(
        membership=membership, id__in=list(ids), read_at__isnull=True
    )
    return qs.update(read_at=now)


def mark_all_read(membership: Membership) -> int:
    now = django_tz.now()
    return NotificationLog.objects.filter(
        membership=membership, read_at__isnull=True
    ).update(read_at=now)


def list_for(membership: Membership, limit: int = 100) -> list[NotificationLog]:
    from django.db.models import F

    return list(
        NotificationLog.objects.filter(membership=membership)
        .order_by(F("read_at").asc(nulls_first=True), "-created_at")[:limit]
    )
