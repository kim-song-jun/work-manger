"""Real push provider — APNs HTTP/2 direct (iOS native).

Selected by the per-platform router in :mod:`apps.notification.providers` for
:class:`DeviceToken` rows whose ``platform`` is ``IOS``. We talk to Apple's
push gateway directly with a JWT signed by the team's APNs auth key — no FCM
intermediary (see ADR-006: zero Google dependency for push).

Required env-vars (see ``docs/operations/operations-guide.md §5.4``):

* ``APNS_KEY_ID`` — 10-character key identifier from App Store Connect.
* ``APNS_TEAM_ID`` — 10-character team identifier.
* ``APNS_BUNDLE_ID`` — bundle ID matching the iOS app (apns-topic header).
* ``APNS_KEY_PEM`` — the ``.p8`` private key (PEM body, ECDSA P-256).
* ``APNS_USE_SANDBOX`` — ``True`` for TestFlight / dev builds, ``False`` for prod.

When ``APNS_KEY_PEM`` is empty we return ``success=False`` with the marker
``apns_not_configured`` (NOT terminal) so the router can fall back to other
channels without DEADing the outbox.

Failure taxonomy:

* HTTP 200 → success.
* HTTP 410 BadDeviceToken / HTTP 400 DeviceTokenNotForTopic → ``terminal:``
  prefix + delete the offending DeviceToken row (ops guide §5.1).
* HTTP 403 (TLS / auth) → ``terminal:``.
* HTTP 429 / 5xx / network errors → transient (retry with backoff).
"""
from __future__ import annotations

import json
import logging
import time
from typing import TYPE_CHECKING, Any

from django.conf import settings

if TYPE_CHECKING:
    from apps.identity.models import Membership

    from . import ProviderResult

logger = logging.getLogger(__name__)

TERMINAL_PREFIX = "terminal:"
JWT_TTL_SECONDS = 50 * 60  # APNs requires <60min; refresh under that.
HTTPX_TIMEOUT_SECONDS = 10

# Module-level JWT cache so we don't re-sign on every send call.
_jwt_cache: dict[str, Any] = {"token": None, "issued_at": 0.0, "key_id": None}


def _terminal(reason: str) -> "ProviderResult":
    from . import ProviderResult

    return ProviderResult(success=False, error=f"{TERMINAL_PREFIX} {reason}")


def _transient(reason: str) -> "ProviderResult":
    from . import ProviderResult

    return ProviderResult(success=False, error=reason)


def _delete_device_token(token_row_id: str) -> None:
    from apps.notification.models import DeviceToken

    DeviceToken.objects.filter(id=token_row_id).delete()


def _build_jwt(key_id: str, team_id: str, key_pem: str) -> str | None:
    """Sign an ES256 JWT for the APNs provider authentication channel."""
    try:
        import jwt  # PyJWT (already a runtime dep for SimpleJWT)
    except ImportError:  # pragma: no cover — PyJWT is in requirements.txt
        logger.error("apns.jwt: PyJWT not installed")
        return None

    now = int(time.time())
    if (
        _jwt_cache["token"]
        and _jwt_cache["key_id"] == key_id
        and now - float(_jwt_cache["issued_at"]) < JWT_TTL_SECONDS
    ):
        return str(_jwt_cache["token"])

    try:
        token = jwt.encode(
            {"iss": team_id, "iat": now},
            key_pem,
            algorithm="ES256",
            headers={"kid": key_id, "alg": "ES256"},
        )
    except Exception as exc:  # noqa: BLE001 — bad PEM, missing crypto backend
        logger.warning("apns.jwt-sign-failed err=%s", type(exc).__name__)
        return None

    _jwt_cache["token"] = token
    _jwt_cache["issued_at"] = now
    _jwt_cache["key_id"] = key_id
    return str(token)


def _build_payload(payload: dict[str, Any]) -> dict[str, Any]:
    title = str(payload.get("title", "")) if isinstance(payload, dict) else ""
    body = str(payload.get("body", "")) if isinstance(payload, dict) else ""
    aps: dict[str, Any] = {"alert": {"title": title, "body": body}, "sound": "default"}
    extra = payload.get("data") if isinstance(payload, dict) else None
    out: dict[str, Any] = {"aps": aps}
    if isinstance(extra, dict):
        for key, value in extra.items():
            if key == "aps":
                continue
            out[str(key)] = value
    return out


def _post_apns(
    *, host: str, device_token: str, jwt_token: str, bundle_id: str, body: bytes
) -> tuple[int, str, str]:
    """POST one notification to APNs HTTP/2. Returns (status, apns-id, body)."""
    import httpx

    url = f"https://{host}/3/device/{device_token}"
    headers = {
        "authorization": f"bearer {jwt_token}",
        "apns-topic": bundle_id,
        "apns-push-type": "alert",
        "content-type": "application/json",
    }
    with httpx.Client(http2=True, timeout=HTTPX_TIMEOUT_SECONDS) as client:
        resp = client.post(url, headers=headers, content=body)
        return resp.status_code, resp.headers.get("apns-id", ""), resp.text


def send(*, payload: dict[str, Any], membership: "Membership") -> "ProviderResult":
    """Send to all of ``membership``'s iOS devices via APNs HTTP/2 direct.

    Aggregates per-device outcomes: success when at least one device accepts,
    terminal when every device returned a terminal error, transient otherwise.
    """
    from apps.notification.models import DeviceToken

    from . import ProviderResult

    key_pem = (getattr(settings, "APNS_KEY_PEM", "") or "").strip()
    if not key_pem:
        # Soft fail — router can fan out to other channels (ntfy / web-push).
        return ProviderResult(success=False, error="apns_not_configured")

    key_id = getattr(settings, "APNS_KEY_ID", "") or ""
    team_id = getattr(settings, "APNS_TEAM_ID", "") or ""
    bundle_id = getattr(settings, "APNS_BUNDLE_ID", "") or ""
    if not (key_id and team_id and bundle_id):
        return _terminal("APNS_KEY_ID/_TEAM_ID/_BUNDLE_ID missing")

    devices = list(
        DeviceToken.objects.filter(membership=membership, platform="IOS").order_by(
            "-last_seen_at"
        )
    )
    if not devices:
        return _transient("no iOS device token registered")

    jwt_token = _build_jwt(key_id, team_id, key_pem)
    if not jwt_token:
        return _terminal("apns-jwt-sign-failed")

    sandbox = bool(getattr(settings, "APNS_USE_SANDBOX", True))
    host = "api.sandbox.push.apple.com" if sandbox else "api.push.apple.com"

    body = json.dumps(_build_payload(payload or {})).encode("utf-8")

    successes = 0
    terminal_count = 0
    last_status: int | None = None
    last_apns_id = ""
    errors: list[str] = []
    for device in devices:
        try:
            status, apns_id, resp_body = _post_apns(
                host=host,
                device_token=device.token,
                jwt_token=jwt_token,
                bundle_id=bundle_id,
                body=body,
            )
        except Exception as exc:  # noqa: BLE001 — httpx network errors → transient
            errors.append(f"{device.id}:{type(exc).__name__}")
            continue

        last_status = status
        last_apns_id = apns_id or last_apns_id

        if 200 <= status < 300:
            successes += 1
            continue

        # Apple returns reason in JSON: {"reason":"BadDeviceToken"}
        reason = ""
        try:
            reason = (json.loads(resp_body) or {}).get("reason", "") if resp_body else ""
        except json.JSONDecodeError:
            reason = ""

        if status == 410 or reason == "BadDeviceToken":
            _delete_device_token(str(device.id))
            errors.append(f"{device.id}:bad-token({status})")
            terminal_count += 1
            continue
        if status == 400 and reason in ("DeviceTokenNotForTopic", "BadDeviceToken"):
            _delete_device_token(str(device.id))
            errors.append(f"{device.id}:topic-mismatch")
            terminal_count += 1
            continue
        if status == 403:
            errors.append(f"{device.id}:tls/auth({status})")
            return _terminal(f"apns-auth: HTTP {status}")
        if status == 429 or status >= 500:
            errors.append(f"{device.id}:transient({status})")
            continue
        errors.append(f"{device.id}:http({status}/{reason})")

    if successes > 0:
        return ProviderResult(
            success=True,
            provider_message_id=last_apns_id or f"apns:{successes}/{len(devices)}",
        )
    if terminal_count == len(devices):
        return _terminal(
            f"apns-all-terminal: HTTP {last_status} {'; '.join(errors[:5])}"
        )
    return _transient(f"apns-transient: {'; '.join(errors[:5])}")


__all__ = ["send", "TERMINAL_PREFIX"]
