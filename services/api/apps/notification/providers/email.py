"""Email provider stub (AWS SES placeholder).

Reads ``EMAIL_BACKEND`` from Django settings purely for parity with the eventual
real integration; the stub itself never sends a network packet.
"""
from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any

from django.conf import settings

if TYPE_CHECKING:
    from apps.identity.models import Membership

    from . import ProviderResult


def send(*, payload: dict[str, Any], membership: "Membership") -> "ProviderResult":
    from . import ProviderResult

    # parity with real integration: read configured backend even though unused here
    _backend = getattr(settings, "EMAIL_BACKEND", "django.core.mail.backends.locmem.EmailBackend")

    if payload.get("_force_fail"):
        return ProviderResult(success=False, error="ses-stub: forced failure")

    if not getattr(membership.user, "email", None):
        return ProviderResult(success=False, error="ses-stub: missing recipient")

    return ProviderResult(
        success=True,
        provider_message_id=f"ses-stub-{uuid.uuid4().hex[:12]}",
    )
