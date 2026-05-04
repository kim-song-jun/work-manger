"""
Test: oauth · Kakao OAuth happy path
Type: Integration (real Postgres, monkeypatched provider HTTP)
Why:  국내 사용자의 1차 가입 경로. provider_subject 가 정수 id 로 오는 점,
      email 이 ``kakao_account.email`` 안에 중첩된 점 등 Kakao 특이 응답 형태를
      회귀 보호한다. start → callback → User 생성의 한 묶음을 검증한다.
Covers:
  - apps.oauth.providers.kakao.KakaoProvider.exchange   — _test_responses 매핑
  - apps.oauth.services.complete                         — 신규 사용자 생성
  - GET /v1/auth/oauth/kakao/start                       — 302 / JSON 모드
  - GET /v1/auth/oauth/kakao/callback                    — 토큰 발급
Out of scope:
  - 2FA OAuth 흐름 (test_2fa.py 가 다룸)
  - 실제 Kakao 호출 (네트워크 격리)
Coverage target: ≥ 90% lines for apps/oauth/providers/kakao.py
"""
from __future__ import annotations

import pytest
from django.test import override_settings
from rest_framework.test import APIClient

from apps.identity.models import User
from apps.oauth import services as oauth_services
from apps.oauth.models import OAuthIdentity

pytestmark = pytest.mark.django_db


KAKAO_FAKE_RESP = {
    "token": {"access_token": "tok-kakao-test"},
    "userinfo": {
        "id": 9988776655,
        "kakao_account": {
            "email": "kakao-user@example.com",
            "is_email_verified": True,
            "profile": {"nickname": "카카오 사용자"},
        },
    },
}


@override_settings(OAUTH_KAKAO_CLIENT_ID="kakaocid", OAUTH_KAKAO_CLIENT_SECRET="kksec")
def test_kakao_callback_creates_new_user(monkeypatch):
    """Kakao userinfo (id 정수, kakao_account 중첩) 를 정규화해 새 User 생성.
    이유: provider 별 응답 모양 차이를 service 가 흡수한다.
    """
    started = oauth_services.start(
        provider="kakao", redirect_uri="https://app.example.com/cb"
    )

    from apps.oauth.providers import kakao as kakao_provider

    real_exchange = kakao_provider.KakaoProvider.exchange

    def _fake(self, **kwargs):
        return real_exchange(
            self,
            code=kwargs["code"],
            code_verifier=kwargs["code_verifier"],
            redirect_uri=kwargs["redirect_uri"],
            _test_responses=KAKAO_FAKE_RESP,
        )

    monkeypatch.setattr(kakao_provider.KakaoProvider, "exchange", _fake)

    r = APIClient().get(
        f"/v1/auth/oauth/kakao/callback?code=AC&state={started['state']}"
    )
    assert r.status_code == 200, r.content
    body = r.json()["data"]
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["created"] is True
    assert User.objects.filter(email="kakao-user@example.com").exists()
    assert OAuthIdentity.objects.filter(
        provider="kakao", provider_subject="9988776655"
    ).exists()


@override_settings(OAUTH_KAKAO_CLIENT_ID="kakaocid", OAUTH_KAKAO_CLIENT_SECRET="kksec")
def test_kakao_start_redirects_when_not_json(api_client):
    """Accept 헤더가 application/json 아니면 302 리다이렉트.
    이유: SPA 가 아닌 일반 브라우저 진입 경로 — 사용자를 바로 Kakao 페이지로 보낸다.
    """
    r = api_client.get(
        "/v1/auth/oauth/kakao/start?redirect_uri=https://app.example.com/cb",
        HTTP_ACCEPT="text/html",
    )
    assert r.status_code in (301, 302)
    assert "kauth.kakao.com" in r["Location"]
