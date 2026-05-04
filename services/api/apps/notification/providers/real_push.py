"""Real push provider — FCM HTTP v1 (covers Android + iOS via FCM).

Selected by ``settings.NOTIFICATION_PROVIDER_MODE == "real"``. Builds an OAuth2
access token from the configured service-account JSON via :mod:`google.auth`
and POSTs to ``https://fcm.googleapis.com/v1/projects/<id>/messages:send``
using the standard library only (``urllib.request``) — keeps the runtime
dependency surface minimal.

APNs HTTP/2 direct path is intentionally NOT wired here: when ``APNS_KEY_PEM``
is empty (the default) iOS tokens are routed through FCM, which itself fans
out to APNs given a configured iOS app in the Firebase project. This avoids
adding an httpx[http2] dependency. If the operator later configures
``APNS_KEY_PEM`` we still go through FCM — the spec note documents the
preference; an APNs-direct module can land in a follow-up without touching
this file.

Outbox-side semantics (mirrors ``real_email.py``):

* HTTP 401 / 403 from FCM → ``terminal:`` prefix → outbox DEADs (auth bug,
  retrying won't help).
* HTTP 404 / ``UNREGISTERED`` → ``ProviderResult(success=False)`` AND we
  delete the offending :class:`DeviceToken` row so future sends fall back to
  the next registered device. Returned as transient (the *next* attempt may
  pick a different token).
* HTTP 5xx / network errors → transient (retry with backoff).
"""
from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request
from typing import TYPE_CHECKING, Any

from django.conf import settings

if TYPE_CHECKING:
    from apps.identity.models import Membership

    from . import ProviderResult

logger = logging.getLogger(__name__)

FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging"
TERMINAL_PREFIX = "terminal:"


def _terminal(reason: str) -> "ProviderResult":
    from . import ProviderResult

    return ProviderResult(success=False, error=f"{TERMINAL_PREFIX} {reason}")


def _transient(reason: str) -> "ProviderResult":
    from . import ProviderResult

    return ProviderResult(success=False, error=reason)


def _load_service_account() -> dict[str, Any] | None:
    """Resolve service-account JSON from a path OR an inline JSON string."""
    raw = getattr(settings, "FCM_SERVICE_ACCOUNT_JSON", "") or ""
    if not raw:
        return None
    raw = raw.strip()
    if raw.startswith("{"):
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return None
    # treat as path
    try:
        with open(raw, encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, json.JSONDecodeError):
        return None


def _access_token(sa_info: dict[str, Any]) -> str | None:
    """Mint a short-lived OAuth2 token for the FCM messaging scope."""
    try:
        from google.oauth2 import service_account
        from google.auth.transport.requests import Request as _GAuthRequest

        creds = service_account.Credentials.from_service_account_info(
            sa_info, scopes=[FCM_SCOPE]
        )
        creds.refresh(_GAuthRequest())
        return creds.token
    except Exception as exc:  # noqa: BLE001 — bubble as transient
        logger.warning("fcm.token-refresh-failed err=%s", type(exc).__name__)
        return None


def _build_message(token: str, payload: dict[str, Any]) -> dict[str, Any]:
    title = str(payload.get("title", "")) if isinstance(payload, dict) else ""
    body_text = str(payload.get("body", "")) if isinstance(payload, dict) else ""
    data = payload.get("data") if isinstance(payload, dict) else None
    msg: dict[str, Any] = {
        "token": token,
        "notification": {"title": title, "body": body_text},
    }
    if isinstance(data, dict):
        # FCM data values must be strings.
        msg["data"] = {str(k): str(v) for k, v in data.items()}
    return {"message": msg}


def _post_fcm(project_id: str, access_token: str, body: dict[str, Any]) -> tuple[int, str]:
    url = f"https://fcm.googleapis.com/v1/projects/{project_id}/messages:send"
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Authorization", f"Bearer {access_token}")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        try:
            body_txt = exc.read().decode("utf-8", errors="replace")
        except Exception:  # noqa: BLE001
            body_txt = ""
        return exc.code, body_txt


def _delete_device_token(token_row_id: str) -> None:
    from apps.notification.models import DeviceToken

    DeviceToken.objects.filter(id=token_row_id).delete()


def send(*, payload: dict[str, Any], membership: "Membership") -> "ProviderResult":
    from apps.notification.models import DeviceToken

    from . import ProviderResult

    sa_info = _load_service_account()
    if sa_info is None:
        return _terminal("FCM_SERVICE_ACCOUNT_JSON not configured")

    project_id = sa_info.get("project_id")
    if not project_id:
        return _terminal("service account missing project_id")

    device = (
        DeviceToken.objects.filter(membership=membership)
        .order_by("-last_seen_at")
        .first()
    )
    if device is None:
        return _transient("no device token registered")

    access_token = _access_token(sa_info)
    if not access_token:
        return _transient("oauth token mint failed")

    body = _build_message(device.token, payload or {})
    status, resp_body = _post_fcm(project_id, access_token, body)

    if 200 <= status < 300:
        try:
            parsed = json.loads(resp_body) if resp_body else {}
        except json.JSONDecodeError:
            parsed = {}
        return ProviderResult(success=True, provider_message_id=parsed.get("name"))

    if status in (401, 403):
        logger.warning("fcm.auth-failure status=%s", status)
        return _terminal(f"fcm-auth: HTTP {status}")

    if status == 404 or "UNREGISTERED" in resp_body.upper():
        # Per ops guide §5.1: invalid DeviceToken → auto-deactivate (delete).
        _delete_device_token(str(device.id))
        return _transient(f"fcm-unregistered: HTTP {status}")

    if status == 400:
        # Bad payload — retrying won't help.
        return _terminal(f"fcm-invalid: HTTP {status}")

    return _transient(f"fcm-transient: HTTP {status}")


__all__ = ["send", "TERMINAL_PREFIX", "FCM_SCOPE"]
