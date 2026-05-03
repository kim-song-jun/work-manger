"""
Test: identity · 2FA (TOTP) enable/verify/login challenge
Type: Integration (real Postgres, pyotp)
Why:  관리자/오너 계정 보호의 마지막 방어선. enable → verify → 로그인 challenge 의
      3단계가 한 묶음으로 통과해야 실제 사용자가 2FA 를 켤 수 있다.
Covers:
  - POST /v1/auth/2fa/enable — secret + otpauth_uri 반환, totp_enabled=False 유지
  - POST /v1/auth/2fa/verify — 정답 코드 → totp_enabled=True + 복구 코드 10개
  - POST /v1/auth/login — 2FA 켜진 사용자는 access 대신 two_fa_token 반환
  - POST /v1/auth/2fa/challenge — token + code 로 access pair 교환
Out of scope:
  - WebAuthn (v2)
  - 백업 채널 (SMS) — v1 미지원
Coverage target: 90%+ for 2FA branches in services.py / views.py
"""
from __future__ import annotations

import pyotp
import pytest

from tests.factories import MembershipFactory, UserFactory

pytestmark = pytest.mark.django_db


def _login(client, user, password="TestPass!1"):
    r = client.post("/v1/auth/login",
                    {"email": user.email, "password": password},
                    format="json")
    assert r.status_code == 200, r.content
    return r.json()["data"]


def test_enable_returns_secret_and_uri(api_client):
    """enable 호출 시 base32 시크릿과 otpauth:// URI 반환, 아직 enabled=False.
    이유: QR 로 표시 후 사용자가 코드를 검증해야만 활성화되는 안전한 흐름.
    """
    user = UserFactory(password="TestPass!1")
    MembershipFactory(user=user)
    data = _login(api_client, user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {data['access_token']}")

    r = api_client.post("/v1/auth/2fa/enable")
    assert r.status_code == 200, r.content
    body = r.json()["data"]
    assert body["secret"] and len(body["secret"]) >= 16
    assert body["otpauth_uri"].startswith("otpauth://totp/")
    user.refresh_from_db()
    assert user.totp_enabled is False
    assert user.totp_secret


def test_verify_with_valid_code_enables_2fa(api_client):
    """provision → 정답 코드 입력 시 totp_enabled=True + 복구 코드 10개.
    이유: 관리자가 강제 2FA 정책을 켰을 때 사용자가 정상 가입 가능해야 함.
    """
    user = UserFactory(password="TestPass!1")
    MembershipFactory(user=user)
    data = _login(api_client, user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {data['access_token']}")
    r = api_client.post("/v1/auth/2fa/enable")
    secret = r.json()["data"]["secret"]

    code = pyotp.TOTP(secret).now()
    r = api_client.post("/v1/auth/2fa/verify", {"code": code}, format="json")

    assert r.status_code == 200, r.content
    body = r.json()["data"]
    assert body["enabled"] is True
    assert len(body["recovery_codes"]) == 10
    user.refresh_from_db()
    assert user.totp_enabled is True


def test_login_returns_2fa_token_then_exchanges(api_client):
    """2FA 켜진 사용자: 로그인 1차 = two_fa_token, 2차 = challenge 로 access 발급.
    이유: 핵심 사용자 흐름 — FE 가 두 단계 분기를 분기 없이 처리하면 잠금 사고 발생.
    """
    # Arrange — fully enable 2FA
    user = UserFactory(password="TestPass!1")
    MembershipFactory(user=user)
    secret = pyotp.random_base32()
    user.totp_secret = secret
    user.totp_enabled = True
    user.save()

    # Act 1 — login: should return 2fa challenge
    r = api_client.post("/v1/auth/login",
                        {"email": user.email, "password": "TestPass!1"},
                        format="json")
    assert r.status_code == 200, r.content
    data = r.json()["data"]
    assert data.get("two_fa_required") is True
    token = data["two_fa_token"]
    assert token

    # Act 2 — exchange
    code = pyotp.TOTP(secret).now()
    r = api_client.post(
        "/v1/auth/2fa/challenge",
        {"two_fa_token": token, "code": code},
        format="json",
    )
    assert r.status_code == 200, r.content
    final = r.json()["data"]
    assert final["access_token"]
    assert final["refresh_token"]
    assert final["user"]["email"] == user.email


def test_challenge_with_bad_code_400(api_client):
    """잘못된 코드 → 400 INVALID_CREDENTIALS.
    이유: 토큰만 있고 코드가 없는 공격 방어.
    """
    user = UserFactory(password="TestPass!1")
    MembershipFactory(user=user)
    user.totp_secret = pyotp.random_base32()
    user.totp_enabled = True
    user.save()
    r = api_client.post("/v1/auth/login",
                        {"email": user.email, "password": "TestPass!1"},
                        format="json")
    token = r.json()["data"]["two_fa_token"]

    r = api_client.post(
        "/v1/auth/2fa/challenge",
        {"two_fa_token": token, "code": "000000"},
        format="json",
    )
    assert r.status_code == 400
    assert r.json()["error"]["code"] == "INVALID_CREDENTIALS"
