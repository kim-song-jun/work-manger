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
