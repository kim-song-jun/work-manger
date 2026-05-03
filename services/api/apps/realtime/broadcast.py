"""Server-side helpers to push WebSocket events to channel groups.

These are safe to call from synchronous Django views/services (clock-in,
approval decisions, notification dispatch). They wrap
``channel_layer.group_send`` with ``async_to_sync`` and never raise — broadcast
failure must not break the originating DB write or HTTP response.

Envelope (matches ``_BaseConsumer.wm_event`` in consumers.py):

    {
        "type":    "wm.event",  # routes to consumer.wm_event handler
        "event":   "<dotted.event.name>",
        "payload": { ... },
        "ts":      "<iso-utc-or-None>",
    }
"""
from __future__ import annotations

import logging
from typing import Any

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils import timezone as django_tz

logger = logging.getLogger(__name__)


def broadcast_to_group(group: str, event: str, payload: dict[str, Any]) -> bool:
    """Send `wm.event` to `group`. Returns True on success, False on any failure."""
    try:
        layer = get_channel_layer()
        if layer is None:
            return False
        async_to_sync(layer.group_send)(
            group,
            {
                "type": "wm.event",
                "event": event,
                "payload": payload,
                "ts": django_tz.now().isoformat(),
            },
        )
        return True
    except Exception:  # noqa: BLE001 — broadcast must never break callers
        logger.exception("ws.broadcast.failed group=%s event=%s", group, event)
        return False


def notify_inbox(membership, event: str, payload: dict[str, Any]) -> bool:
    """Push to ``inbox:{membership_id}`` (personal feed)."""
    if membership is None:
        return False
    return broadcast_to_group(f"inbox.{membership.id}", event, payload)


def notify_team(company, event: str, payload: dict[str, Any]) -> bool:
    """Push to ``team:{company_id}`` (everyone in the company)."""
    if company is None:
        return False
    company_id = getattr(company, "id", company)
    return broadcast_to_group(f"team.{company_id}", event, payload)


def notify_admin(company, event: str, payload: dict[str, Any]) -> bool:
    """Push to ``admin:{company_id}`` (ADMIN/OWNER live board)."""
    if company is None:
        return False
    company_id = getattr(company, "id", company)
    return broadcast_to_group(f"admin.{company_id}", event, payload)
