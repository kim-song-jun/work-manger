"""Email provider stub (AWS SES placeholder).

Reads ``EMAIL_BACKEND`` from Django settings purely for parity with the eventual
real integration; the stub itself never sends a network packet — instead it
``logger.info``s the rendered email so dev/CI runs are observable. The real SES
integration is owned by another agent — keep the function signature stable so
the swap is trivial (replace this module's body, leave callers untouched).

Recognised payload keys (all optional unless noted):
    - ``_to_email`` (required): recipient address. Falls back to
      ``membership.user.email`` when present.
    - ``subject``: subject line.
    - ``text``: plain-text body.
    - ``html``: HTML body.
    - ``_force_fail``: test hook — forces ``ProviderResult(success=False)``.
"""
from __future__ import annotations

import logging
import uuid
from typing import TYPE_CHECKING, Any

from django.conf import settings

if TYPE_CHECKING:
    from apps.identity.models import Membership

    from . import ProviderResult

logger = logging.getLogger(__name__)


def _resolve_recipient(payload: dict[str, Any], membership: "Membership | None") -> str | None:
    explicit = payload.get("_to_email") if isinstance(payload, dict) else None
    if explicit:
        return str(explicit)
    if membership is not None and getattr(membership, "user", None) is not None:
        return getattr(membership.user, "email", None)
    return None


def send(*, payload: dict[str, Any], membership: "Membership | None") -> "ProviderResult":
    from . import ProviderResult

    # parity with real integration: read configured backend even though unused here
    _backend = getattr(settings, "EMAIL_BACKEND", "django.core.mail.backends.locmem.EmailBackend")

    if isinstance(payload, dict) and payload.get("_force_fail"):
        return ProviderResult(success=False, error="ses-stub: forced failure")

    to_email = _resolve_recipient(payload, membership)
    if not to_email:
        return ProviderResult(success=False, error="ses-stub: missing recipient")

    subject = payload.get("subject", "") if isinstance(payload, dict) else ""
    text_preview = (payload.get("text") if isinstance(payload, dict) else "") or ""
    has_html = bool(isinstance(payload, dict) and payload.get("html"))

    # Observability: log the dispatch so dev/CI flows are visible without
    # actually sending a packet. The body is intentionally truncated to keep
    # log volume bounded.
    logger.info(
        "ses-stub.send to=%s subject=%r html=%s text_preview=%r",
        to_email,
        subject,
        has_html,
        text_preview[:160],
    )

    return ProviderResult(
        success=True,
        provider_message_id=f"ses-stub-{uuid.uuid4().hex[:12]}",
    )
