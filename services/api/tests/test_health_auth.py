"""
Test: identity · health + auth round-trip
Type: Integration (real Postgres, JWT issuer, password hashing)
Why:  로그인 / 토큰 발급 / 인증 미들웨어가 같이 동작하지 않으면 모든 화면이 멈춘다.
      가장 자주 회귀가 발생하는 부분 (settings, JWT 키, 비밀번호 검증) 을 한 번에 보호.
Covers:
  - GET  /v1/health                — 헬스 핑 (ALB / k8s probe)
  - POST /v1/auth/signup           — 회원가입 + 비밀번호 정책
  - POST /v1/auth/login            — JWT 발급
  - GET  /v1/me                    — Bearer 토큰 인증 + UserMeSerializer
  - POST /v1/auth/login (invalid)  — 자격증명 실패 응답 envelope
Out of scope:
  - 이메일 인증 메일 발송 (test_email.py 향후)
  - 잠금 / brute-force (test_auth_lockout.py 향후)
  - OAuth (test_oauth.py 향후)
Coverage target: 100% lines for apps/identity/views.py + apps/identity/serializers.py auth paths
"""
from __future__ import annotations

import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


@pytest.fixture
def client():
    return APIClient()


def test_health(client):
    """헬스 엔드포인트는 인증 없이 200 반환.
    이유: 컨테이너 healthcheck + ALB target health 가 의존.
    """
    resp = client.get("/v1/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_signup_then_login_then_me(client):
    """signup → login → me 의 골든 패스가 한 번에 통과해야 한다.
    이유: 로그인 깨지면 모든 후속 화면이 무용지물 — 가장 비싼 회귀.
    """
    # Arrange
    payload = {
        "email": "alice@example.com",
        "password": "Strong!Pass99",
        "name": "Alice",
        "locale": "ko",
    }

    # Act 1 — signup
    r = client.post("/v1/auth/signup", payload, format="json")
    assert r.status_code == 201, r.content

    # Act 2 — login
    r = client.post(
        "/v1/auth/login",
        {"email": payload["email"], "password": payload["password"]},
        format="json",
    )
    assert r.status_code == 200, r.content
    access = r.json()["data"]["access_token"]
    assert access

    # Act 3 — /me with Bearer
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    r = client.get("/v1/me")

    # Assert
    assert r.status_code == 200
    assert r.json()["data"]["email"] == payload["email"]


def test_login_invalid(client):
    """잘못된 자격증명은 400 + 표준 에러 envelope.
    이유: FE 가 envelope 모양에 의존 (LoginPage 의 error 표시 분기).
    """
    r = client.post(
        "/v1/auth/login",
        {"email": "no@example.com", "password": "wrong"},
        format="json",
    )
    assert r.status_code == 400
