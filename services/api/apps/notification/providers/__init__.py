"""Notification provider router (stub ↔ real).

The outbox worker calls :func:`send` with a channel name; this module dispatches
to the appropriate per-channel implementation. The implementation is selected at
call time from ``settings.NOTIFICATION_PROVIDER_MODE``:

* ``"stub"`` (default) — :mod:`.email`, :mod:`.push`, :mod:`.inapp`. No
  network packets. Drives the outbox / queue / retry tests deterministically.
* ``"real"`` — :mod:`.real_email`, :mod:`.real_push`, :mod:`.inapp` (in-app
  is the DB row itself, no transport). See
  ``docs/operations/operations-guide.md §5`` for env-var configuration.

Returning :class:`ProviderResult`:

* ``success=True`` → outbox marks SENT.
* ``success=False`` → outbox increments attempts and re-schedules with
  backoff (transient) UNLESS ``error`` starts with ``terminal:`` — the outbox
  treats that as a do-not-retry signal and DEADs immediately.

A payload may also carry ``_force_fail: true`` (stubs only) to force a
failure for tests.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable

from django.conf import settings

from apps.identity.models import Membership

from . import email as _email_stub
from . import inapp as _inapp
from . import push as _push_stub


@dataclass(frozen=True)
class ProviderResult:
    """Outcome of a provider send attempt."""

    success: bool
    error: str | None = None
    provider_message_id: str | None = None


# Sentinel prefix shared with real_email / real_push: when an error string
# starts with this token the outbox MUST NOT retry — go straight to DEAD.
TERMINAL_ERROR_PREFIX = "terminal:"


def is_terminal_error(error: str | None) -> bool:
    """Return True when an outbox failure should bypass the retry budget.

    Used by :mod:`apps.notification.outbox.process_one` to decide between
    FAILED (retry) and DEAD (give up) on the same attempt.
    """
    if not error:
        return False
    return error.lstrip().lower().startswith(TERMINAL_ERROR_PREFIX)


_STUB_DISPATCH: dict[str, Callable[..., ProviderResult]] = {
    "PUSH": _push_stub.send,
    "EMAIL": _email_stub.send,
    "INAPP": _inapp.send,
}


def _real_dispatch() -> dict[str, Callable[..., ProviderResult]]:
    # Lazy import — keeps boto3 / google-auth out of the import graph for
    # default (stub) test runs and dev environments without those deps.
    from . import real_email, real_push

    return {
        "PUSH": real_push.send,
        "EMAIL": real_email.send,
        "INAPP": _inapp.send,  # in-app has no real transport
    }


def _resolve_dispatch() -> dict[str, Callable[..., ProviderResult]]:
    mode = (getattr(settings, "NOTIFICATION_PROVIDER_MODE", "stub") or "stub").lower()
    if mode == "real":
        return _real_dispatch()
    return _STUB_DISPATCH


def send(channel: str, payload: dict[str, Any], membership: Membership) -> ProviderResult:
    """Route to the per-channel provider for the configured mode.

    Unknown channels raise :class:`ValueError` — caller treats as terminal
    config bug (the outbox catches and DEADs).
    """
    dispatch = _resolve_dispatch()
    fn = dispatch.get(channel)
    if fn is None:
        raise ValueError(f"Unknown notification channel: {channel}")
    return fn(payload=payload, membership=membership)


__all__ = [
    "ProviderResult",
    "TERMINAL_ERROR_PREFIX",
    "is_terminal_error",
    "send",
]
