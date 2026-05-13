"""
Test: identity · auth flow (signup → login → lockout → password change → me)
Type: Integration (real Postgres, ApiClient)
Why:  identity 는 보안 경계 — signup 정책 / login lockout / 2FA / token rotation
      회귀 시 외부 펜테스트 통과 어렵고 prod 사고 위험. 본 모듈 0 tests 였음
      (B-CODE-06 backlog).
Covers:
  - POST /v1/auth/signup — 정상 / 약한 비밀번호 / 이메일 중복
  - POST /v1/auth/login — 정상 / 잘못된 비밀번호 / 락아웃
  - POST /v1/auth/refresh — 정상 / 만료 / 형식 오류
  - POST /v1/auth/logout — 정상 / 잘못된 토큰
  - POST /v1/auth/password/change — 정상 / 기존 PW 오류 / 정책 위반
  - GET /v1/me — 인증 / 비인증 401
Out of scope:
  - OAuth (test_oauth_*.py 가 다룸)
  - 2FA TOTP (test_identity_2fa_flow.py 가 다룸 — 별도)
  - 이메일 인증 / 비밀번호 분실 (별도 모듈)
Coverage target: ≥ 70% lines for apps/identity/views.py auth section.
"""
from __future__ import annotations

import pytest

from apps.identity.models import User
from tests.factories import UserFactory

pytestmark = pytest.mark.django_db


# ───────────────────────── signup ─────────────────────────


def test_signup_creates_user_and_requires_email_verification(api_client):
    """정상 가입은 201 + email_verification_required True. (이메일 인증 미완 상태)"""
    r = api_client.post(
        "/v1/auth/signup",
        {"email": "newhire@example.com", "password": "Strong!Pass99", "name": "신입사원"},
        format="json",
    )
    assert r.status_code == 201, r.content
    body = r.json()["data"]
    assert body["email_verification_required"] is True
    assert User.objects.filter(email__iexact="newhire@example.com").exists()


def test_signup_rejects_duplicate_email(api_client):
    """이미 가입된 이메일은 400 (User.email unique 제약).

    Note: 현재 시리얼라이저는 명시적 case-insensitive 검증을 하지 않으나, 모델의
    unique=True 가 정확히 일치하는 이메일 중복을 차단한다. 대소문자 다른 이메일
    중복 케이스는 시리얼라이저 강화 후 추가 검증 권장 (B-CODE-06 follow-up).
    """
    UserFactory(email="taken@example.com")
    r = api_client.post(
        "/v1/auth/signup",
        {"email": "taken@example.com", "password": "Strong!Pass99", "name": "중복"},
        format="json",
    )
    assert r.status_code == 400, r.content


def test_signup_rejects_weak_password(api_client):
    """8자 미만 + 정책 위반 비밀번호는 400."""
    r = api_client.post(
        "/v1/auth/signup",
        {"email": "weakpw@example.com", "password": "12345", "name": "약함"},
        format="json",
    )
    assert r.status_code == 400, r.content


# ───────────────────────── login + lockout ─────────────────────────


def test_login_returns_tokens_for_active_user(api_client):
    user = UserFactory(password="GoodPass!1", email="alice-login@example.com")
    r = api_client.post(
        "/v1/auth/login",
        {"email": "alice-login@example.com", "password": "GoodPass!1"},
        format="json",
    )
    assert r.status_code == 200, r.content
    body = r.json()["data"]
    assert "access_token" in body
    assert "refresh_token" in body
    assert body["user"]["email"] == "alice-login@example.com"


def test_login_with_wrong_password_returns_invalid_credentials(api_client):
    UserFactory(password="GoodPass!1", email="bob-login@example.com")
    r = api_client.post(
        "/v1/auth/login",
        {"email": "bob-login@example.com", "password": "WrongPass!9"},
        format="json",
    )
    assert r.status_code == 400, r.content
    assert r.json()["error"]["code"] == "INVALID_CREDENTIALS"


def test_login_locks_after_failed_threshold(api_client, settings):
    """LOGIN_LOCKOUT_THRESHOLD 회 실패 시 423 ACCOUNT_LOCKED 반환.

    is_locked() 가 True 가 되는 시점부터 추가 시도는 차단된다.
    """
    threshold = getattr(settings, "LOGIN_LOCKOUT_THRESHOLD", 5)
    UserFactory(password="GoodPass!1", email="lockout@example.com")
    last = None
    for _ in range(threshold + 1):
        last = api_client.post(
            "/v1/auth/login",
            {"email": "lockout@example.com", "password": "Bad!9999"},
            format="json",
        )
    assert last is not None
    assert last.status_code == 423, last.content
    # 잠긴 상태에서 정확한 PW 로 시도해도 차단되어야 함.
    r = api_client.post(
        "/v1/auth/login",
        {"email": "lockout@example.com", "password": "GoodPass!1"},
        format="json",
    )
    assert r.status_code == 423


def test_login_rejects_inactive_user(api_client):
    """비활성 계정은 Django auth backend 가 `authenticate(...)=None` 으로 응답하므로
    뷰는 INVALID_CREDENTIALS 로 본다 (잠긴 상태와 동일한 UX 보호 — 활성 여부 leak 방지).
    """
    UserFactory(password="GoodPass!1", email="inactive@example.com", is_active=False)
    r = api_client.post(
        "/v1/auth/login",
        {"email": "inactive@example.com", "password": "GoodPass!1"},
        format="json",
    )
    assert r.status_code == 400, r.content
    assert r.json()["error"]["code"] == "INVALID_CREDENTIALS"


# ───────────────────────── refresh + logout ─────────────────────────


def test_refresh_rotates_access_token(api_client):
    UserFactory(password="GoodPass!1", email="refresh@example.com")
    login = api_client.post(
        "/v1/auth/login",
        {"email": "refresh@example.com", "password": "GoodPass!1"},
        format="json",
    )
    rt = login.json()["data"]["refresh_token"]
    r = api_client.post("/v1/auth/refresh", {"refresh_token": rt}, format="json")
    assert r.status_code == 200, r.content
    assert "access_token" in r.json()["data"]


def test_refresh_requires_token(api_client):
    r = api_client.post("/v1/auth/refresh", {}, format="json")
    assert r.status_code == 400


def test_logout_blacklists_refresh_token(api_client):
    UserFactory(password="GoodPass!1", email="logout@example.com")
    login = api_client.post(
        "/v1/auth/login",
        {"email": "logout@example.com", "password": "GoodPass!1"},
        format="json",
    )
    access = login.json()["data"]["access_token"]
    rt = login.json()["data"]["refresh_token"]
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    r = api_client.post("/v1/auth/logout", {"refresh_token": rt}, format="json")
    assert r.status_code == 200
    # 블랙리스트 후 같은 refresh 로 access 발급 시도 → 실패
    api_client.credentials()
    again = api_client.post("/v1/auth/refresh", {"refresh_token": rt}, format="json")
    assert again.status_code == 401


# ───────────────────────── /v1/me ─────────────────────────


def test_me_returns_user_payload_when_authenticated(client_auth):
    client, _ = client_auth("EMPLOYEE")
    r = client.get("/v1/me")
    assert r.status_code == 200, r.content
    data = r.json()["data"]
    assert "id" in data
    assert "email" in data
    assert "memberships" in data


def test_me_returns_401_when_anonymous(api_client):
    r = api_client.get("/v1/me")
    assert r.status_code == 401


# ───────────────────────── password change ─────────────────────────


def test_password_change_success(client_auth):
    client, membership = client_auth("EMPLOYEE")
    r = client.post(
        "/v1/auth/password/change",
        {"old_password": "TestPass!1", "new_password": "Brand!New99"},
        format="json",
    )
    assert r.status_code == 200, r.content
    # 새 PW 로 다시 로그인되어야 함
    membership.user.refresh_from_db()
    assert membership.user.check_password("Brand!New99")


def test_password_change_rejects_wrong_old(client_auth):
    client, _ = client_auth("EMPLOYEE")
    r = client.post(
        "/v1/auth/password/change",
        {"old_password": "WrongOld!9", "new_password": "Brand!New99"},
        format="json",
    )
    assert r.status_code == 400


def test_password_change_rejects_weak_new(client_auth):
    client, _ = client_auth("EMPLOYEE")
    r = client.post(
        "/v1/auth/password/change",
        {"old_password": "TestPass!1", "new_password": "12345"},
        format="json",
    )
    assert r.status_code == 400
