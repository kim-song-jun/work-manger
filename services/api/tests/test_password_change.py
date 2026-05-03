"""
Test: identity · password change
Type: Integration (real Postgres, JWT blacklist)
Why:  비밀번호 변경 후 기존 refresh 가 살아있으면 탈취 시나리오에서 무효화 의미가 없다.
      old-pw 검증 / django validators / 전체 refresh 블랙리스트가 한 묶음으로 동작해야 한다.
Covers:
  - POST /v1/auth/password/change — old 잘못 → 400, 약한 새 pw → 400, 성공 → 200 +
    기존 refresh blacklisted (다음 refresh 호출 401)
Out of scope:
  - 비밀번호 리셋 메일 흐름 (test_password_reset.py 향후)
Coverage target: 100% lines for password_change view
"""
from __future__ import annotations

import pytest
from rest_framework.test import APIClient

from tests.factories import MembershipFactory, UserFactory

pytestmark = pytest.mark.django_db


def _login(user, password="TestPass!1"):
    c = APIClient()
    r = c.post("/v1/auth/login", {"email": user.email, "password": password},
               format="json")
    assert r.status_code == 200, r.content
    data = r.json()["data"]
    c.credentials(HTTP_AUTHORIZATION=f"Bearer {data['access_token']}")
    return c, data["refresh_token"]


def test_old_password_wrong_returns_400():
    """기존 비밀번호가 틀리면 400 + INVALID_CREDENTIALS.
    이유: 세션 탈취된 access 만으로 비밀번호 교체를 막는다.
    """
    user = UserFactory(password="TestPass!1")
    MembershipFactory(user=user)
    client, _ = _login(user)

    r = client.post("/v1/auth/password/change",
                    {"old_password": "WRONG", "new_password": "NewStr0ng!Pwd"},
                    format="json")
    assert r.status_code == 400
    assert r.json()["error"]["code"] == "INVALID_CREDENTIALS"


def test_weak_new_password_returns_400():
    """짧은 새 비밀번호는 django validators 가 거절한다.
    이유: 정책 우회 방지.
    """
    user = UserFactory(password="TestPass!1")
    MembershipFactory(user=user)
    client, _ = _login(user)

    r = client.post("/v1/auth/password/change",
                    {"old_password": "TestPass!1", "new_password": "abc"},
                    format="json")
    assert r.status_code == 400
    assert r.json()["error"]["code"] == "VALIDATION_ERROR"


def test_success_blacklists_existing_refresh():
    """성공 시 기존 refresh 토큰이 blacklisted → 다음 refresh 호출 401.
    이유: 탈취 시나리오 차단의 핵심.
    """
    user = UserFactory(password="TestPass!1")
    MembershipFactory(user=user)
    client, refresh = _login(user)

    r = client.post("/v1/auth/password/change",
                    {"old_password": "TestPass!1", "new_password": "NewStr0ng!Pwd"},
                    format="json")
    assert r.status_code == 200, r.content

    # The old refresh must now be blacklisted
    fresh = APIClient()
    r2 = fresh.post("/v1/auth/refresh", {"refresh_token": refresh}, format="json")
    assert r2.status_code == 401
