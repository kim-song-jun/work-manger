"""Notification provider router (stub ↔ real, per-platform fan-out for PUSH).

The outbox worker calls :func:`send` with a channel name; this module dispatches
to the appropriate per-channel implementation. Mode is selected at call time
from ``settings.NOTIFICATION_PROVIDER_MODE``:

* ``"stub"`` (default) — :mod:`.email`, :mod:`.push`, :mod:`.inapp`. No
  network packets. Drives the outbox / queue / retry tests deterministically.
* ``"real"`` — :mod:`.real_email` for EMAIL, :mod:`.inapp` for INAPP, and a
  per-platform fan-out for PUSH:

    - ``WEB``      → :mod:`.web_push` (VAPID, browsers / Electron / WebView)
    - ``DESKTOP``  → :mod:`.web_push` (Electron renderer is just a browser)
    - ``IOS``      → :mod:`.real_push` (APNs HTTP/2 direct — no FCM)
    - ``ANDROID``  → :mod:`.ntfy` (self-hosted ntfy server on wm-net)

  See ADR-006 for the rationale (zero Google dependency for push).

Returning :class:`ProviderResult`:

* ``success=True`` — outbox marks SENT.
* ``success=False`` — outbox increments attempts and re-schedules with
  backoff (transient) UNLESS ``error`` starts with ``terminal:`` — the outbox
  treats that as a do-not-retry signal and DEADs immediately.

A payload may also carry ``_force_fail: true`` (stubs only) to force a
failure for tests.
"""
from __future__ import annotations

from dataclasses import dataclass, field
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
    # Per-device breakdown for PUSH fan-out (web-push / apns / ntfy). Empty
    # for single-call providers (EMAIL, INAPP). Lets ops correlate which
    # platform failed without parsing the error string.
    details: dict[str, Any] = field(default_factory=dict)


# Sentinel prefix shared with real_email / real_push / web_push / ntfy: when
# an error string starts with this token the outbox MUST NOT retry — go
# straight to DEAD.
TERMINAL_ERROR_PREFIX = "terminal:"


def is_terminal_error(error: str | None) -> bool:
    """Return True when an outbox failure should bypass the retry budget."""
    if not error:
        return False
    return error.lstrip().lower().startswith(TERMINAL_ERROR_PREFIX)


_STUB_DISPATCH: dict[str, Callable[..., ProviderResult]] = {
    "PUSH": _push_stub.send,
    "EMAIL": _email_stub.send,
    "INAPP": _inapp.send,
}


def _real_email_send(*, payload: dict[str, Any], membership: Membership) -> ProviderResult:
    from . import real_email

    return real_email.send(payload=payload, membership=membership)


# Map DeviceToken.platform → real provider module function. Keys MUST match
# the values in :class:`apps.notification.models.DeviceToken.Platform`.
_PUSH_PLATFORM_DISPATCH: dict[str, str] = {
    "WEB": "web_push",
    "DESKTOP": "web_push",
    "IOS": "real_push",
    "ANDROID": "ntfy",
}


def _real_push_fanout(
    *, payload: dict[str, Any], membership: Membership
) -> ProviderResult:
    """Fan PUSH out per DeviceToken platform; aggregate the result.

    Overall success: at least one device succeeded. If every platform returned
    a terminal error AND no device succeeded, propagate ``terminal:`` so the
    outbox DEADs without burning retries. Otherwise transient.
    """
    from apps.notification.models import DeviceToken

    # Group platforms once (avoid N module-imports inside the loop).
    platforms = sorted(
        DeviceToken.objects.filter(membership=membership)
        .values_list("platform", flat=True)
        .distinct()
    )
    if not platforms:
        return ProviderResult(success=False, error="no device token registered")

    seen_modules: set[str] = set()
    overall_success = False
    successes: dict[str, str | None] = {}
    failures: dict[str, str] = {}
    any_transient = False

    for platform in platforms:
        module_name = _PUSH_PLATFORM_DISPATCH.get(platform)
        if module_name is None or module_name in seen_modules:
            # WEB + DESKTOP both route to web_push — call once per module so
            # web_push iterates devices internally.
            continue
        seen_modules.add(module_name)
        if module_name == "web_push":
            from . import web_push as _mod

            sub_result = _mod.send(payload=payload, membership=membership)
        elif module_name == "real_push":
            from . import real_push as _mod_apns

            sub_result = _mod_apns.send(payload=payload, membership=membership)
        elif module_name == "ntfy":
            from . import ntfy as _mod_ntfy

            sub_result = _mod_ntfy.send(payload=payload, membership=membership)
        else:  # pragma: no cover — defensive
            continue

        if sub_result.success:
            overall_success = True
            successes[module_name] = sub_result.provider_message_id
            continue
        failures[module_name] = sub_result.error or "unknown"
        if not is_terminal_error(sub_result.error):
            any_transient = True

    details = {"successes": successes, "failures": failures}

    if overall_success:
        provider_id = ";".join(
            f"{k}={v or ''}" for k, v in successes.items() if v is not None
        )
        return ProviderResult(
            success=True,
            provider_message_id=provider_id or None,
            details=details,
        )

    # Everything failed. Decide between transient and terminal.
    if any_transient or not failures:
        err = "; ".join(f"{k}:{v}" for k, v in failures.items()) or "no devices"
        return ProviderResult(success=False, error=err, details=details)
    err = TERMINAL_ERROR_PREFIX + " " + "; ".join(
        f"{k}:{v}" for k, v in failures.items()
    )
    return ProviderResult(success=False, error=err, details=details)


def _real_dispatch() -> dict[str, Callable[..., ProviderResult]]:
    return {
        "PUSH": _real_push_fanout,
        "EMAIL": _real_email_send,
        "INAPP": _inapp.send,
    }


def _resolve_dispatch() -> dict[str, Callable[..., ProviderResult]]:
    mode = (getattr(settings, "NOTIFICATION_PROVIDER_MODE", "stub") or "stub").lower()
    if mode == "real":
        return _real_dispatch()
    return _STUB_DISPATCH


def send(channel: str, payload: dict[str, Any], membership: Membership) -> ProviderResult:
    """Route to the per-channel provider for the configured mode."""
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
