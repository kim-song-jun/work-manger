"""In-app provider stub.

The NotificationLog row is the in-app delivery surface — the user reads it via
``GET /v1/notifications``. So "send" here is always a success modulo the
``_force_fail`` test hook.
"""
from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from apps.identity.models import Membership

    from . import ProviderResult


def send(*, payload: dict[str, Any], membership: "Membership") -> "ProviderResult":
    from . import ProviderResult

    if payload.get("_force_fail"):
        return ProviderResult(success=False, error="inapp-stub: forced failure")

    return ProviderResult(
        success=True,
        provider_message_id=f"inapp-stub-{uuid.uuid4().hex[:12]}",
    )
