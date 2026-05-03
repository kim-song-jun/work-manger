"""Push provider stub (FCM/APNs/WebPush placeholder).

Picks the first registered :class:`DeviceToken` for the membership; if none
exists, the send is treated as a transient failure (token may be registered on
retry). When the payload contains ``_force_fail: true`` the stub forces a
failure regardless of token presence.
"""
from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from apps.identity.models import Membership

    from . import ProviderResult


def send(*, payload: dict[str, Any], membership: "Membership") -> "ProviderResult":
    from apps.notification.models import DeviceToken

    from . import ProviderResult

    if payload.get("_force_fail"):
        return ProviderResult(success=False, error="push-stub: forced failure")

    token = (
        DeviceToken.objects.filter(membership=membership)
        .order_by("-last_seen_at")
        .first()
    )
    if token is None:
        return ProviderResult(success=False, error="push-stub: no device token registered")

    return ProviderResult(
        success=True,
        provider_message_id=f"push-stub-{token.platform}-{uuid.uuid4().hex[:8]}",
    )
