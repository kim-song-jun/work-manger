"""Audit recording service.

Single entry point: ``record(...)``. Never raises into the request — failures are
logged so logging breakage cannot break user-facing flows (constraint per task spec).
"""
from __future__ import annotations

import logging
from typing import Any
from uuid import UUID

from .models import AuditLog

logger = logging.getLogger(__name__)

# Keys/values containing PII (operations-guide §8.4) must never be persisted in
# raw form. Callers should pre-strip; this list is a defensive backup.
_PII_KEYS = {"email", "name", "phone", "password", "latitude", "longitude"}


def _client_ip(request) -> str | None:
    if request is None:
        return None
    fwd = request.META.get("HTTP_X_FORWARDED_FOR")
    if fwd:
        # may be "client, proxy1, proxy2" — take the first
        return fwd.split(",")[0].strip() or None
    return request.META.get("REMOTE_ADDR") or None


def _user_agent(request) -> str:
    if request is None:
        return ""
    return (request.META.get("HTTP_USER_AGENT") or "")[:256]


def _scrub_payload(payload: dict[str, Any] | None) -> dict[str, Any]:
    if not payload:
        return {}
    out: dict[str, Any] = {}
    for k, v in payload.items():
        if k.lower() in _PII_KEYS:
            out[k] = "***"
        else:
            out[k] = v
    return out


def record(
    actor,
    action: str,
    *,
    company=None,
    target=None,
    request=None,
    payload: dict[str, Any] | None = None,
) -> AuditLog | None:
    """Persist a single audit row.

    - actor: User instance or None (anonymous / failed-login attempts).
    - action: dotted name like ``auth.login.success``.
    - company: Company FK (defaults to actor's active membership.company).
    - target: any model instance with ``.id`` + ``.__class__.__name__``.
    - request: DRF/Django request used to extract IP and UA.
    - payload: extra dict (PII keys auto-masked).
    """
    try:
        target_type = ""
        target_id: UUID | None = None
        if target is not None:
            target_type = target.__class__.__name__
            target_id = getattr(target, "id", None)

        if company is None and actor is not None and getattr(actor, "is_authenticated", False):
            m = actor.memberships.filter(is_active=True).first()
            if m is not None:
                company = m.company

        return AuditLog.objects.create(
            company=company,
            actor=actor if (actor is not None and getattr(actor, "is_authenticated", False)) else None,
            action=action,
            target_type=target_type,
            target_id=target_id,
            ip=_client_ip(request),
            user_agent=_user_agent(request),
            payload_json=_scrub_payload(payload),
        )
    except Exception:  # noqa: BLE001 — logging must never break the request
        logger.exception("audit.record_failed", extra={"action": action})
        return None
