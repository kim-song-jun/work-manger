"""
Test: identity · login lockout (brute-force protection)
Type: Integration (real Postgres, time travel)
Why:  계정 잠금이 동작하지 않으면 무차별 비밀번호 추측에 무방비 — OWASP A07.
      threshold / duration / 카운터 리셋 / 잠금 만료의 4축이 모두 통과해야 한다.
Covers:
  - POST /v1/auth/login — 5회 실패 시 423 ACCOUNT_LOCKED
  - 성공 시 failed_login_count / locked_until 초기화
  - 15분 경과 후 잠금 자동 해제
Out of scope:
  - rate-limit (별도 미들웨어; test_rate_limit.py 향후)
  - CAPTCHA (v2)
Coverage target: 100% lines for apps/identity/services.py 잠금 분기
"""
from __future__ import annotations

from datetime import timedelta

import pytest
from freezegun import freeze_time

from apps.identity.models import User
from tests.factories import UserFactory

pytestmark = pytest.mark.django_db


def _bad(client, email):
    return client.post(
        "/v1/auth/login",
        {"email": email, "password": "WRONG"},
        format="json",
    )


def test_5_failed_logins_lock_account(api_client):
    """5회 잘못된 시도 후 다음 호출은 423 + ACCOUNT_LOCKED 반환.
    이유: docs/api/authentication.md §2 — brute-force 방어 핵심 정책.
    """
    # Arrange
    user = UserFactory(password="TestPass!1")

    # Act
    for i in range(5):
        r = _bad(api_client, user.email)
        # last attempt either 400 or 423 depending on threshold ordering
        assert r.status_code in (400, 423)

    # Assert — even with correct password, locked
    r = api_client.post(
        "/v1/auth/login",
        {"email": user.email, "password": "TestPass!1"},
        format="json",
    )
    assert r.status_code == 423
    assert r.json()["error"]["code"] == "ACCOUNT_LOCKED"


def test_success_resets_counter(api_client):
    """1~2회 실패 후 정답이면 카운터가 0으로 리셋된다.
    이유: 정상 사용자가 오타 후 정정한 케이스에서 평생 잠기지 않게.
    """
    user = UserFactory(password="TestPass!1")
    _bad(api_client, user.email)
    _bad(api_client, user.email)

    r = api_client.post(
        "/v1/auth/login",
        {"email": user.email, "password": "TestPass!1"},
        format="json",
    )
    assert r.status_code == 200, r.content
    user.refresh_from_db()
    assert user.failed_login_count == 0
    assert user.locked_until is None


def test_lock_expires_after_duration(api_client):
    """잠금 후 15분이 지나면 다시 정상 로그인 가능.
    이유: 영구 잠금은 가용성 문제 — 정책상 15분 cool-down.
    """
    user = UserFactory(password="TestPass!1")
    with freeze_time("2026-05-04 12:00:00"):
        for _ in range(5):
            _bad(api_client, user.email)
        # locked
        r = api_client.post(
            "/v1/auth/login",
            {"email": user.email, "password": "TestPass!1"},
            format="json",
        )
        assert r.status_code == 423

    # +16 min
    with freeze_time("2026-05-04 12:16:00"):
        r = api_client.post(
            "/v1/auth/login",
            {"email": user.email, "password": "TestPass!1"},
            format="json",
        )
        assert r.status_code == 200, r.content
