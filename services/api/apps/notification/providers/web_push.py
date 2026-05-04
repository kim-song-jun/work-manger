"""Web Push (VAPID) provider — browsers, Electron renderer, Flutter WebView.

Selected by the per-platform router in :mod:`apps.notification.providers` for
:class:`DeviceToken` rows whose ``platform`` is ``WEB`` or ``DESKTOP``. The
``token`` column stores the JSON serialisation of the W3C ``PushSubscription``
returned by ``pushManager.subscribe`` on the FE — i.e.::

    {"endpoint": "https://...", "keys": {"p256dh": "...", "auth": "..."}}

Failure taxonomy mirrors :mod:`real_email`/:mod:`real_push`:

* HTTP 410 Gone or 404 Not Found → the subscription is permanently dead.
  We delete the offending :class:`DeviceToken` row and return transient so the
  *next* attempt picks a different device. Rationale: ops guide §5.1.
* HTTP 401/403 → ``terminal:`` prefix. Misconfigured VAPID keys won't fix
  themselves between attempts; outbox DEADs immediately.
* HTTP 429/5xx, network errors → transient (retry with backoff).

VAPID keys are minted once per environment via the management command
``manage.py generate_vapid_keys`` and pasted into env-vars — see ADR-006.
"""
from __future__ import annotations

import json
import logging
from typing import TYPE_CHECKING, Any

from django.conf import settings

if TYPE_CHECKING:
    from apps.identity.models import Membership

    from . import ProviderResult

logger = logging.getLogger(__name__)

TERMINAL_PREFIX = "terminal:"
DEFAULT_TTL_SECONDS = 86400


def _terminal(reason: str) -> "ProviderResult":
    from . import ProviderResult

    return ProviderResult(success=False, error=f"{TERMINAL_PREFIX} {reason}")


def _transient(reason: str) -> "ProviderResult":
    from . import ProviderResult

    return ProviderResult(success=False, error=reason)


def _parse_subscription(raw: str) -> dict[str, Any] | None:
    """Decode the JSON PushSubscription stored in ``DeviceToken.token``."""
    if not raw:
        return None
    try:
        sub = json.loads(raw)
    except json.JSONDecodeError:
        return None
    if not isinstance(sub, dict):
        return None
    if "endpoint" not in sub or "keys" not in sub:
        return None
    return sub


def _delete_device_token(token_row_id: str) -> None:
    from apps.notification.models import DeviceToken

    DeviceToken.objects.filter(id=token_row_id).delete()


def send(*, payload: dict[str, Any], membership: "Membership") -> "ProviderResult":
    """Fan-out a single push to every WEB/DESKTOP device of ``membership``.

    Returns success when at least one device accepts (200/201/202/204). Per-device
    failures are aggregated into the error string for ops triage. Dead
    subscriptions (404/410) are deleted as a side-effect.
    """
    from apps.notification.models import DeviceToken

    from . import ProviderResult

    private_key = getattr(settings, "WEB_PUSH_VAPID_PRIVATE_KEY", "") or ""
    if not private_key:
        return _terminal("WEB_PUSH_VAPID_PRIVATE_KEY not configured")

    subject = getattr(
        settings, "WEB_PUSH_VAPID_SUBJECT", "mailto:ops@work-manager.molcube.com"
    )

    devices = list(
        DeviceToken.objects.filter(
            membership=membership, platform__in=("WEB", "DESKTOP")
        ).order_by("-last_seen_at")
    )
    if not devices:
        return _transient("no web/desktop subscription registered")

    # Lazy import — pywebpush is optional at install time and absent in stub mode.
    from pywebpush import WebPushException, webpush

    body = json.dumps(
        {
            "title": str(payload.get("title", "")) if isinstance(payload, dict) else "",
            "body": str(payload.get("body", "")) if isinstance(payload, dict) else "",
            "url": str(payload.get("url", "/")) if isinstance(payload, dict) else "/",
        }
    )

    successes = 0
    errors: list[str] = []
    for device in devices:
        sub = _parse_subscription(device.token)
        if sub is None:
            _delete_device_token(str(device.id))
            errors.append(f"{device.id}:malformed")
            continue
        try:
            webpush(
                subscription_info=sub,
                data=body,
                vapid_private_key=private_key,
                vapid_claims={"sub": subject},
                ttl=DEFAULT_TTL_SECONDS,
            )
            successes += 1
        except WebPushException as exc:  # pywebpush raises this for HTTP errors
            status = getattr(exc.response, "status_code", None) if exc.response else None
            if status in (404, 410):
                _delete_device_token(str(device.id))
                errors.append(f"{device.id}:gone({status})")
                continue
            if status in (401, 403):
                errors.append(f"{device.id}:auth({status})")
                # auth failure across the whole batch — same VAPID key drives all.
                return _terminal(f"web-push-auth: HTTP {status}")
            if status in (429,) or (status is not None and status >= 500):
                errors.append(f"{device.id}:transient({status})")
                continue
            errors.append(f"{device.id}:http({status})")
        except Exception as exc:  # noqa: BLE001 — surface unexpected as transient
            errors.append(f"{device.id}:{type(exc).__name__}")

    if successes > 0:
        return ProviderResult(
            success=True,
            provider_message_id=f"web-push:{successes}/{len(devices)}",
        )
    return _transient("web-push: all devices failed; " + "; ".join(errors[:5]))


__all__ = ["send", "TERMINAL_PREFIX", "DEFAULT_TTL_SECONDS"]
