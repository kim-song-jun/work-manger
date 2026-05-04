"""Kakao OAuth provider (Authorization Code + PKCE).

Endpoints:
  - Authorization: https://kauth.kakao.com/oauth/authorize
  - Token:         https://kauth.kakao.com/oauth/token
  - UserInfo:      https://kapi.kakao.com/v2/user/me

Kakao's userinfo nests email + profile under ``kakao_account``; we flatten
into the same ``ProviderProfile`` shape returned by :class:`GoogleProvider`.

For tests, callers may pass ``_test_responses={"token": {...}, "userinfo": {...}}``
to bypass HTTP.
"""
from __future__ import annotations

import json
import urllib.parse
import urllib.request
from typing import Any

from django.conf import settings

from .base import ProviderProfile

AUTH_URL = "https://kauth.kakao.com/oauth/authorize"
TOKEN_URL = "https://kauth.kakao.com/oauth/token"
USERINFO_URL = "https://kapi.kakao.com/v2/user/me"


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


class KakaoProvider:
    name = "kakao"

    def start_url(
        self, *, state: str, code_challenge: str, redirect_uri: str
    ) -> str:
        client_id = getattr(settings, "OAUTH_KAKAO_CLIENT_ID", "")
        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "account_email profile_nickname",
            "state": state,
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
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
                    "grant_type": "authorization_code",
                    "client_id": getattr(settings, "OAUTH_KAKAO_CLIENT_ID", ""),
                    "client_secret": getattr(
                        settings, "OAUTH_KAKAO_CLIENT_SECRET", ""
                    ),
                    "redirect_uri": redirect_uri,
                    "code": code,
                    "code_verifier": code_verifier,
                },
            )
            access_token = token_resp.get("access_token", "")
            userinfo = _get_json(USERINFO_URL, bearer=access_token)

        # Kakao shape:
        #   { "id": 12345, "kakao_account": { "email": "...",
        #     "is_email_verified": true, "profile": { "nickname": "..." } } }
        account = userinfo.get("kakao_account", {}) or {}
        profile = account.get("profile", {}) or {}
        return ProviderProfile(
            provider_subject=str(userinfo.get("id", "")),
            email=str(account.get("email", "") or "").lower(),
            name=str(profile.get("nickname", "") or ""),
            email_verified=bool(account.get("is_email_verified", False)),
        )
