"""
Test: oauth · Google OAuth2 happy path + state mismatch + link to existing
Type: Integration (real Postgres, monkeypatched provider HTTP)
Why:  OAuth 콜백이 잘못된 state 를 통과시키면 CSRF + 계정 탈취 가능 (RFC 6749 §10.12).
      또한 같은 이메일로 가입된 사용자에게 자동 연동되지 않으면 사용자가 별도 계정을 끌어
      온보딩 데이터가 분리된다. 새 사용자 생성 / 기존 사용자 연동 / state 위조의 3축을
      회귀 보호한다. PKCE code_verifier 는 서비스 레이어가 보관 — 외부 요청을 모킹.
Covers:
  - apps.oauth.services.start              — PKCE state 생성 + DB 저장
  - apps.oauth.services.complete           — 신규 / 연동 / state 무효
  - GET /v1/auth/oauth/google/start        — JSON 응답 (Accept: application/json)
  - GET /v1/auth/oauth/google/callback     — 토큰 발급, OAuthIdentity 생성
  - apps.oauth.providers.google            — _test_responses 주입 경로
Out of scope:
  - 실제 Google 호출 (네트워크 격리; settings.OAUTH_GOOGLE_CLIENT_ID 가 비어있을 때
    /start 가 503 OAUTH_NOT_CONFIGURED 반환하는 것은 별도 확인됨)
  - 2FA 흐름 (test_2fa.py 가 다룸; OAuth 2FA 분기는 동일 코드 경로)
Coverage target: ≥ 90% lines for apps/oauth/services.py
"""
from __future__ import annotations

import pytest
from django.test import override_settings

from apps.identity.models import User
from apps.oauth import services as oauth_services
from apps.oauth.models import OAuthIdentity, OAuthState
from tests.factories import UserFactory

pytestmark = pytest.mark.django_db


GOOGLE_FAKE_RESP = {
    "token": {"access_token": "tok-google-test", "id_token": "id-jwt"},
    "userinfo": {
        "sub": "google-sub-12345",
        "email": "newuser@example.com",
        "name": "New User",
        "email_verified": True,
    },
}


@override_settings(OAUTH_GOOGLE_CLIENT_ID="cid", OAUTH_GOOGLE_CLIENT_SECRET="sec")
def test_start_returns_url_and_persists_state(api_client):
    """start 호출 시 URL + state 반환 + OAuthState 행 저장.
    이유: 콜백이 PKCE verifier 를 다시 꺼내려면 state 키가 DB 에 있어야 한다.
    """
    r = api_client.get(
        "/v1/auth/oauth/google/start?redirect_uri=https://app.example.com/cb",
        HTTP_ACCEPT="application/json",
    )
    assert r.status_code == 200, r.content
    body = r.json()["data"]
    assert body["url"].startswith("https://accounts.google.com/o/oauth2/v2/auth")
    assert "state=" in body["url"]
    assert body["state"]
    assert OAuthState.objects.filter(state=body["state"], provider="google").exists()


@override_settings(OAUTH_GOOGLE_CLIENT_ID="", OAUTH_GOOGLE_CLIENT_SECRET="")
def test_start_503_when_not_configured(api_client):
    """client_id 가 비어있으면 503 OAUTH_NOT_CONFIGURED.
    이유: 빈 자격증명으로 사용자가 깨진 페이지로 리다이렉트되는 것을 방지.
    """
    r = api_client.get(
        "/v1/auth/oauth/google/start?redirect_uri=https://app.example.com/cb",
        HTTP_ACCEPT="application/json",
    )
    assert r.status_code == 503
    assert r.json()["error"]["code"] == "OAUTH_NOT_CONFIGURED"


@override_settings(OAUTH_GOOGLE_CLIENT_ID="cid", OAUTH_GOOGLE_CLIENT_SECRET="sec")
def test_complete_creates_new_user_and_returns_tokens(monkeypatch):
    """state 통과 + provider 응답 모킹 → 신규 User + access/refresh 발급.
    이유: 첫 OAuth 로그인 사용자의 핵심 행복 경로.
    """
    started = oauth_services.start(
        provider="google", redirect_uri="https://app.example.com/cb"
    )

    # Patch the provider exchange to skip HTTP entirely.
    from apps.oauth.providers import google as google_provider

    real_exchange = google_provider.GoogleProvider.exchange

    def _fake(self, *, code, code_verifier, redirect_uri, _test_responses=None):
        return real_exchange(
            self,
            code=code,
            code_verifier=code_verifier,
            redirect_uri=redirect_uri,
            _test_responses=GOOGLE_FAKE_RESP,
        )

    monkeypatch.setattr(google_provider.GoogleProvider, "exchange", _fake)

    from rest_framework.test import APIClient
    c = APIClient()
    r = c.get(
        f"/v1/auth/oauth/google/callback?code=AUTH-CODE&state={started['state']}"
    )
    assert r.status_code == 200, r.content
    body = r.json()["data"]
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["created"] is True
    assert User.objects.filter(email="newuser@example.com").exists()
    assert OAuthIdentity.objects.filter(
        provider="google", provider_subject="google-sub-12345"
    ).exists()


@override_settings(OAUTH_GOOGLE_CLIENT_ID="cid", OAUTH_GOOGLE_CLIENT_SECRET="sec")
def test_complete_links_to_existing_verified_user(monkeypatch):
    """이미 가입된 (verified) 사용자에게 동일 이메일로 OAuth 콜백 시 자동 연동.
    이유: 사용자가 이메일/비밀번호로 가입한 뒤 같은 메일로 Google 로그인 시
    중복 계정이 만들어지지 않아야 한다 (docs/api/authentication.md §3 계정 연동).
    """
    existing = UserFactory(email="linked@example.com", is_email_verified=True)
    started = oauth_services.start(
        provider="google", redirect_uri="https://app.example.com/cb"
    )

    from apps.oauth.providers import google as google_provider

    real_exchange = google_provider.GoogleProvider.exchange

    def _fake(self, **kwargs):
        return real_exchange(
            self,
            code=kwargs["code"],
            code_verifier=kwargs["code_verifier"],
            redirect_uri=kwargs["redirect_uri"],
            _test_responses={
                "token": {"access_token": "x"},
                "userinfo": {
                    "sub": "google-sub-link",
                    "email": "linked@example.com",
                    "name": "Linked",
                    "email_verified": True,
                },
            },
        )

    monkeypatch.setattr(google_provider.GoogleProvider, "exchange", _fake)

    from rest_framework.test import APIClient
    r = APIClient().get(
        f"/v1/auth/oauth/google/callback?code=AC&state={started['state']}"
    )
    assert r.status_code == 200, r.content
    body = r.json()["data"]
    assert body["created"] is False
    assert body["user"]["id"] == str(existing.id)
    assert OAuthIdentity.objects.filter(
        provider="google", user=existing, provider_subject="google-sub-link"
    ).exists()


@override_settings(OAUTH_GOOGLE_CLIENT_ID="cid", OAUTH_GOOGLE_CLIENT_SECRET="sec")
def test_complete_state_mismatch_returns_400(api_client):
    """알 수 없는 state 로 콜백 시 400 OAUTH_STATE_INVALID.
    이유: CSRF 방어의 핵심 (state 가 없으면 공격자가 콜백을 위조).
    """
    r = api_client.get(
        "/v1/auth/oauth/google/callback?code=any&state=NONEXISTENT-STATE"
    )
    assert r.status_code == 400
    assert r.json()["error"]["code"] == "OAUTH_STATE_INVALID"
