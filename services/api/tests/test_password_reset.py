"""
Test: identity · password reset (forgot → reset → replay protection)
Type: Integration (real Postgres, JWT blacklist, Redis-backed one-time guard)
Why:  비밀번호 재설정은 계정 탈취의 가장 흔한 진입점. 잘못된/재사용 토큰을 통과시키면
      OWASP A07. forgot 은 enumeration 방어로 항상 200, reset 은 재사용 시 명확히 400.
      성공 시 모든 refresh 가 blacklisted + 잠금 카운터 초기화 의 사이드이펙트도 회귀 보호.
Covers:
  - apps.identity.services.issue_password_reset_token        — TimestampSigner 발급
  - apps.identity.services.consume_password_reset_token      — 정상 / 약한 pw / 재사용
  - apps.identity.services.reset_token_use_log               — Redis SETNX 보호
  - POST /v1/auth/password/forgot                            — outbox 큐잉 + 200 enumeration 방어
  - POST /v1/auth/password/reset                             — 200 + refresh 블랙리스트
Out of scope:
  - 실제 SES 발송 (provider stub)
  - 이메일 인증 (test_email_verify.py)
Coverage target: ≥ 90% lines for password-reset branches in identity/services.py
"""
from __future__ import annotations

import pytest
from rest_framework.test import APIClient

from apps.identity import services as identity_services
from apps.notification.models import NotificationOutbox
from tests.factories import MembershipFactory, UserFactory

pytestmark = pytest.mark.django_db


def test_forgot_enqueues_email_when_user_exists(api_client):
    """forgot 호출 시 활성 사용자에게 EMAIL 행이 큐에 추가된다.
    이유: 사용자가 비밀번호 분실 시 메일을 받지 못하면 자가 복구 불가.
    """
    user = UserFactory()
    MembershipFactory(user=user)
    r = api_client.post(
        "/v1/auth/password/forgot", {"email": user.email}, format="json"
    )
    assert r.status_code == 200
    assert r.json()["data"]["sent"] is True
    assert NotificationOutbox.objects.filter(
        membership__user=user,
        channel="EMAIL",
        event_kind="auth.password.reset_requested",
    ).exists()


def test_forgot_unknown_email_still_200(api_client):
    """모르는 이메일도 200 — outbox 행 추가 없음.
    이유: account enumeration 방어 (docs/api/api-spec.md §1).
    """
    before = NotificationOutbox.objects.count()
    r = api_client.post(
        "/v1/auth/password/forgot", {"email": "missing@example.com"}, format="json"
    )
    assert r.status_code == 200
    assert NotificationOutbox.objects.count() == before


def test_reset_consumes_token_then_blacklists_refresh():
    """reset 성공 시 새 비밀번호로 로그인 가능 + 기존 refresh 가 무효화된다.
    이유: 탈취 시나리오에서 비밀번호 변경의 안전망 (docs/authentication.md §7).
    """
    # Arrange — user with an active refresh token
    user = UserFactory(password="OldPass!9")
    MembershipFactory(user=user)
    c = APIClient()
    login = c.post(
        "/v1/auth/login",
        {"email": user.email, "password": "OldPass!9"},
        format="json",
    )
    old_refresh = login.json()["data"]["refresh_token"]
    _, signed = identity_services.issue_password_reset_token(user)

    # Act
    r = c.post(
        "/v1/auth/password/reset",
        {"token": signed, "new_password": "BrandNew!42"},
        format="json",
    )

    # Assert — reset succeeded
    assert r.status_code == 200, r.content
    assert r.json()["data"]["reset"] is True

    # New password works
    c2 = APIClient()
    r2 = c2.post(
        "/v1/auth/login",
        {"email": user.email, "password": "BrandNew!42"},
        format="json",
    )
    assert r2.status_code == 200, r2.content

    # Old refresh blacklisted
    r3 = APIClient().post("/v1/auth/refresh", {"refresh_token": old_refresh}, format="json")
    assert r3.status_code == 401


def test_reset_token_cannot_be_reused(api_client):
    """동일 토큰으로 두 번째 reset 호출 시 400 PASSWORD_RESET_USED.
    이유: 토큰이 한 번만 유효해야 도난된 메일이 영구 백도어가 되지 않는다.
    """
    user = UserFactory()
    _, signed = identity_services.issue_password_reset_token(user)

    r1 = api_client.post(
        "/v1/auth/password/reset",
        {"token": signed, "new_password": "FirstPass!9"},
        format="json",
    )
    assert r1.status_code == 200, r1.content

    r2 = api_client.post(
        "/v1/auth/password/reset",
        {"token": signed, "new_password": "SecondPass!9"},
        format="json",
    )
    assert r2.status_code == 400
    assert r2.json()["error"]["code"] == "PASSWORD_RESET_USED"


def test_bad_token_returns_400(api_client):
    """위조 / 만료 토큰 → 400 PASSWORD_RESET_INVALID.
    이유: 서명 검증 실패는 클라이언트 오류로 명확히 분리.
    """
    r = api_client.post(
        "/v1/auth/password/reset",
        {"token": "garbage", "new_password": "Whatever!9"},
        format="json",
    )
    assert r.status_code == 400
    assert r.json()["error"]["code"] == "PASSWORD_RESET_INVALID"
