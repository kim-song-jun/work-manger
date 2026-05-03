"""Notification provider stubs (FCM/APNs/SES/in-app).

The outbox worker calls :func:`send` with a channel name; this dispatches to the
appropriate provider stub. Each provider returns a :class:`ProviderResult`.

For Phase 0 the providers are STUBS — the queue / retry / outbox semantics are
the asset under test, not real network calls. A payload may carry the magic
key ``_force_fail: true`` to deterministically force a transient failure
(used in tests).
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from apps.identity.models import Membership

from . import email as _email
from . import inapp as _inapp
from . import push as _push


@dataclass(frozen=True)
class ProviderResult:
    """Outcome of a provider send attempt."""

    success: bool
    error: str | None = None
    provider_message_id: str | None = None


_DISPATCH = {
    "PUSH": _push.send,
    "EMAIL": _email.send,
    "INAPP": _inapp.send,
}


def send(channel: str, payload: dict[str, Any], membership: Membership) -> ProviderResult:
    """Route to the per-channel provider stub.

    Unknown channels raise ValueError (caller treats as terminal — config bug).
    """
    fn = _DISPATCH.get(channel)
    if fn is None:
        raise ValueError(f"Unknown notification channel: {channel}")
    return fn(payload=payload, membership=membership)


__all__ = ["ProviderResult", "send"]
