"""Notification dispatch — Service layer.

Channels supported (v1):
- INAPP: always succeeds; user reads via /v1/notifications.
- EMAIL: stub — writes a log row marked 'delivered_at=now' so callers can ack.
- PUSH:  if any DeviceToken exists for membership → log delivered; else marks failed.

External provider integration (FCM/APNs/SES) lives in `tasks.py` so the service
stays synchronous and easy to test. The service is the single source of truth for
"did we honor the user's preference and produce a record?".
"""
from __future__ import annotations

from collections.abc import Iterable
from typing import Any
from uuid import UUID

from django.utils import timezone as django_tz

from apps.identity.models import Membership

from .models import DeviceToken, NotificationLog, NotificationPreference

DEFAULT_CHANNELS = ("INAPP",)
ALL_CHANNELS = ("PUSH", "EMAIL", "INAPP")


def _allowed(membership: Membership, channel: str, event_kind: str) -> bool:
    pref = NotificationPreference.objects.filter(
        membership=membership, channel=channel, event_kind=event_kind
    ).first()
    if pref is None:
        return True  # default opt-in
    return bool(pref.enabled)


def dispatch(
    membership: Membership,
    *,
    event_kind: str,
    payload: dict[str, Any],
    channels: Iterable[str] | None = None,
) -> list[NotificationLog]:
    chans = list(channels) if channels else list(DEFAULT_CHANNELS)
    out: list[NotificationLog] = []
    now = django_tz.now()
    for ch in chans:
        if ch not in ALL_CHANNELS:
            continue
        if not _allowed(membership, ch, event_kind):
            continue
        log = NotificationLog(
            membership=membership,
            event_kind=event_kind,
            channel=ch,
            payload_json=payload,
        )
        if ch == "INAPP":
            log.delivered_at = now
        elif ch == "EMAIL":
            # stub: pretend SES accepted
            log.delivered_at = now
        elif ch == "PUSH":
            has_token = DeviceToken.objects.filter(membership=membership).exists()
            if has_token:
                log.delivered_at = now
            else:
                log.failed_at = now
        log.save()
        out.append(log)
    return out


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
