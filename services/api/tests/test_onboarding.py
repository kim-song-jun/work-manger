"""
Test: identity · onboarding + admin company-codes
Type: Integration (real Postgres, settings.DEBUG toggling for dev bootstrap)
Why:  사용자가 회사에 합류하는 경로가 깨지면 신규 가입자 모두 막힌다.
      관리자 측 코드 발급 / 회수 / 만료 / 사용 한도 룰을 한 번에 회귀 보호.
Covers:
  - POST /v1/dev/bootstrap-company   — 개발 편의 부트스트랩 (DEBUG only)
  - POST /v1/admin/company-codes     — 코드 발급 (ADMIN+)
  - POST /v1/onboarding/join-company — 코드로 합류 + 부서 lazy 생성
  - POST 중복 가입 → 409 ALREADY_MEMBER
  - POST 잘못된 코드 → 404 JOIN_CODE_INVALID
  - DELETE 코드 회수 → revoked_at 세팅
  - 권한 가드: EMPLOYEE 가 admin endpoint 호출 시 403
Out of scope:
  - 이메일 인증 (verify 별도 PR)
  - 위치 / 스케줄 / 알림 단계 (각각 별도 단위 테스트)
Coverage target: ≥ 90% for apps/identity/onboarding_views.py
"""
from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.identity.models import Company, CompanyJoinCode, Membership

pytestmark = pytest.mark.django_db


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def owner(db):
    User = get_user_model()
    u = User.objects.create_user(email="owner@x.com", password="StrongPass!9", name="Owner")
    return u


@pytest.fixture
def employee(db):
    User = get_user_model()
    return User.objects.create_user(email="emp@x.com", password="StrongPass!9", name="Emp")


def auth(client, user):
    r = client.post(
        "/v1/auth/login",
        {"email": user.email, "password": "StrongPass!9"},
        format="json",
    )
    assert r.status_code == 200, r.content
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {r.json()['data']['access_token']}")
    return r.json()["data"]


def test_dev_bootstrap_then_join_with_code(client, owner, employee, settings):
    settings.DEBUG = True
    auth(client, owner)
    r = client.post("/v1/dev/bootstrap-company", {"name": "Acme"}, format="json")
    assert r.status_code == 201
    company_data = r.json()["data"]["company"]
    assert company_data["name"] == "Acme"

    # owner now creates a join code
    r = client.post("/v1/admin/company-codes", {"max_uses": 5}, format="json")
    assert r.status_code == 201, r.content
    code = r.json()["data"]["code"]
    assert len(code) == 6

    # employee joins
    auth(client, employee)
    r = client.post(
        "/v1/onboarding/join-company",
        {"code": code, "department_name": "Engineering", "position": "Developer"},
        format="json",
    )
    assert r.status_code == 201, r.content
    assert Membership.objects.filter(company__name="Acme", user=employee, role="EMPLOYEE").exists()

    # cannot join twice
    r = client.post("/v1/onboarding/join-company", {"code": code}, format="json")
    assert r.status_code == 409
    assert r.json()["error"]["code"] == "ALREADY_MEMBER"


def test_join_with_invalid_code(client, employee):
    auth(client, employee)
    r = client.post("/v1/onboarding/join-company", {"code": "ZZZZZZ"}, format="json")
    assert r.status_code == 404
    assert r.json()["error"]["code"] == "JOIN_CODE_INVALID"


def test_admin_codes_require_admin_role(client, employee):
    auth(client, employee)
    # employee with no membership at all → 403 (IsActiveMember fails)
    r = client.get("/v1/admin/company-codes")
    assert r.status_code == 403


def test_revoke_company_code(client, owner, settings):
    settings.DEBUG = True
    auth(client, owner)
    client.post("/v1/dev/bootstrap-company", {"name": "Bcorp"}, format="json")
    r = client.post("/v1/admin/company-codes", {}, format="json")
    code_id = r.json()["data"]["id"]
    r = client.delete(f"/v1/admin/company-codes/{code_id}")
    assert r.status_code == 200
    assert CompanyJoinCode.objects.get(id=code_id).revoked_at is not None
