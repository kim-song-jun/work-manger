"""Google OAuth2 provider (Authorization Code + PKCE).

Endpoints (all ``urllib`` — no httpx dependency):
  - Authorization: https://accounts.google.com/o/oauth2/v2/auth
  - Token:         https://oauth2.googleapis.com/token
  - UserInfo:      https://www.googleapis.com/oauth2/v3/userinfo

For tests, callers may pass ``_test_responses={"token": {...}, "userinfo": {...}}``
to ``exchange()`` to bypass the HTTP layer entirely.
"""
from __future__ import annotations

import json
import urllib.parse
import urllib.request
from typing import Any

from django.conf import settings

from .base import ProviderProfile

AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"
USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


def _post_form(url: str, data: dict[str, str]) -> dict[str, Any]:
    body = urllib.parse.urlencode(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:  # nosec - URL constants
        return json.loads(resp.read().decode("utf-8"))


def _get_json(url: str, *, bearer: str) -> dict[str, Any]:
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {bearer}"},
        method="GET",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:  # nosec - URL constants
        return json.loads(resp.read().decode("utf-8"))


class GoogleProvider:
    name = "google"

    def start_url(
        self, *, state: str, code_challenge: str, redirect_uri: str
    ) -> str:
        client_id = getattr(settings, "OAUTH_GOOGLE_CLIENT_ID", "")
        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
            "access_type": "offline",
            "prompt": "consent",
        }
        return f"{AUTH_URL}?{urllib.parse.urlencode(params)}"

    def exchange(
        self,
        *,
        code: str,
        code_verifier: str,
        redirect_uri: str,
        _test_responses: dict[str, Any] | None = None,
    ) -> ProviderProfile:
        if _test_responses is not None:
            token_resp = _test_responses.get("token", {})
            userinfo = _test_responses.get("userinfo", {})
        else:
            token_resp = _post_form(
                TOKEN_URL,
                {
                    "code": code,
                    "client_id": getattr(settings, "OAUTH_GOOGLE_CLIENT_ID", ""),
                    "client_secret": getattr(
                        settings, "OAUTH_GOOGLE_CLIENT_SECRET", ""
                    ),
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                    "code_verifier": code_verifier,
                },
            )
            access_token = token_resp.get("access_token", "")
            userinfo = _get_json(USERINFO_URL, bearer=access_token)

        return ProviderProfile(
            provider_subject=str(userinfo.get("sub", "")),
            email=str(userinfo.get("email", "")).lower(),
            name=str(userinfo.get("name", "")),
            email_verified=bool(userinfo.get("email_verified", False)),
        )
