"""ntfy (https://ntfy.sh) provider — self-hosted Android push transport.

Selected by the per-platform router for :class:`DeviceToken` rows whose
``platform`` is ``ANDROID``. The Android client subscribes to a predictable,
per-membership topic via WebSocket; the BE publishes by POSTing JSON to that
same topic on the internal ntfy service (``http://ntfy:80`` on ``wm-net``).

Topic shape::

    {NTFY_TOPIC_PREFIX}-membership-{membership.id}

The prefix is per-environment (``wm-prod``, ``wm-stg``, ...) so a leaked dev
topic name can never receive prod traffic. ACL is enforced server-side via
``NTFY_AUTH_DEFAULT_ACCESS=deny-all`` + a service user (see
``init_ntfy_user`` management command).

Failure taxonomy:

* HTTP 200 → success.
* HTTP 401/403 → ``terminal:`` (bad auth token; retrying won't help).
* HTTP 4xx (other) → ``terminal:`` (malformed publish, no retry).
* HTTP 429/5xx, network error → transient.

Stdlib only — no new runtime deps. Lazy imports keep the provider import
graph tight.
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

TERMINAL_PREFIX = "terminal:"
DEFAULT_TIMEOUT_SECONDS = 5


def _terminal(reason: str) -> "ProviderResult":
    from . import ProviderResult

    return ProviderResult(success=False, error=f"{TERMINAL_PREFIX} {reason}")


def _transient(reason: str) -> "ProviderResult":
    from . import ProviderResult

    return ProviderResult(success=False, error=reason)


def topic_for(membership_id: Any) -> str:
    """Return the per-membership ntfy topic. Exposed for the FE/Android side."""
    prefix = getattr(settings, "NTFY_TOPIC_PREFIX", "wm-prod") or "wm-prod"
    return f"{prefix}-membership-{membership_id}"


def _post(url: str, body: bytes, *, auth_token: str) -> tuple[int, str]:
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    if auth_token:
        req.add_header("Authorization", f"Bearer {auth_token}")
    try:
        with urllib.request.urlopen(req, timeout=DEFAULT_TIMEOUT_SECONDS) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        try:
            text = exc.read().decode("utf-8", errors="replace")
        except Exception:  # noqa: BLE001
            text = ""
        return exc.code, text


def send(*, payload: dict[str, Any], membership: "Membership") -> "ProviderResult":
    """Publish one ntfy message for ``membership``'s Android device(s).

    ntfy fans out across all open subscriptions on the topic, so we issue ONE
    HTTP POST per membership regardless of how many DeviceToken rows exist.
    """
    from . import ProviderResult

    base_url = (getattr(settings, "NTFY_BASE_URL", "http://ntfy:80") or "").rstrip("/")
    if not base_url:
        return _terminal("NTFY_BASE_URL not configured")

    topic = topic_for(membership.id)
    url = f"{base_url}/{topic}"

    body_dict = {
        "title": str(payload.get("title", "")) if isinstance(payload, dict) else "",
        "message": str(payload.get("body", "")) if isinstance(payload, dict) else "",
        "click": str(payload.get("url", "")) if isinstance(payload, dict) else "",
        "priority": int(payload.get("priority", 3)) if isinstance(payload, dict) else 3,
        "tags": payload.get("tags", []) if isinstance(payload, dict) else [],
    }
    body = json.dumps(body_dict).encode("utf-8")
    auth_token = getattr(settings, "NTFY_AUTH_TOKEN", "") or ""

    try:
        status, text = _post(url, body, auth_token=auth_token)
    except (urllib.error.URLError, OSError) as exc:
        return _transient(f"ntfy-network: {type(exc).__name__}")

    if 200 <= status < 300:
        return ProviderResult(success=True, provider_message_id=f"ntfy:{topic}")

    if status in (401, 403):
        logger.warning("ntfy.auth-failure status=%s topic=%s", status, topic)
        return _terminal(f"ntfy-auth: HTTP {status}")

    if status == 429 or status >= 500:
        return _transient(f"ntfy-transient: HTTP {status}")

    return _terminal(f"ntfy-bad-request: HTTP {status} body={text[:128]}")


__all__ = ["send", "topic_for", "TERMINAL_PREFIX"]
