"""Leave domain tests.

Covers:
- balance computation with GRANTED / USED / EXPIRED / ADJUSTED rows
- request submission happy path + insufficient-balance (HTTP 422)
- approval decision creates a USED transaction and decrements remaining
- monthly grant idempotency (running twice yields the same outcome)
- expiry batch rolls past-expiry GRANTED rows into EXPIRED
"""
from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

import pytest
from freezegun import freeze_time
from rest_framework.test import APIClient

from apps.approval.models import ApprovalTask
from apps.identity.models import Company, Membership, User
from apps.leave import services, tasks
from apps.leave.models import LeaveBalance, LeavePolicy, LeaveRequest

pytestmark = pytest.mark.django_db


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def company(db):
    return Company.objects.create(
        name="ACME",
        code="ACME01",
        fiscal_year_start=date(2026, 1, 1),
        timezone="Asia/Seoul",
    )


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="bob@example.com",
        password="Strong!Pass99",
        name="Bob",
    )


@pytest.fixture
def membership(db, company, user):
    return Membership.objects.create(
        company=company,
        user=user,
        role=Membership.Role.EMPLOYEE,
        hired_at=date(2024, 1, 15),
    )


@pytest.fixture
def manager_membership(db, company):
    boss_user = User.objects.create_user(
        email="boss@example.com",
        password="Strong!Pass99",
        name="Boss",
    )
    return Membership.objects.create(
        company=company,
        user=boss_user,
        role=Membership.Role.MANAGER,
        hired_at=date(2020, 1, 1),
    )


@pytest.fixture
def policy(db, company) -> LeavePolicy:
    return services.get_or_create_default_policy(company)


@pytest.fixture
def auth_client(db, user):
    """An :class:`APIClient` authenticated with *user*'s JWT access token."""
    client = APIClient()
    resp = client.post(
        "/v1/auth/login",
        {"email": user.email, "password": "Strong!Pass99"},
        format="json",
    )
    assert resp.status_code == 200, resp.content
    access = resp.json()["data"]["access_token"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    return client


# ---------------------------------------------------------------------------
# compute_balance
# ---------------------------------------------------------------------------


def test_compute_balance_aggregates_kinds(membership, policy, company):
    today = date(2026, 5, 4)
    LeaveBalance.objects.create(
        company=company,
        membership=membership,
        kind=LeaveBalance.Kind.GRANTED,
        days=Decimal("15"),
        granted_at=date(2026, 1, 1),
        expires_at=date(2026, 12, 31),
    )
    LeaveBalance.objects.create(
        company=company,
        membership=membership,
        kind=LeaveBalance.Kind.GRANTED,
        days=Decimal("3"),
        granted_at=date(2025, 1, 1),
        expires_at=date(2025, 12, 31),  # past expiry — must be excluded
    )
    LeaveBalance.objects.create(
        company=company,
        membership=membership,
        kind=LeaveBalance.Kind.USED,
        days=Decimal("4"),
        granted_at=date(2026, 3, 10),
    )
    LeaveBalance.objects.create(
        company=company,
        membership=membership,
        kind=LeaveBalance.Kind.EXPIRED,
        days=Decimal("3"),
        granted_at=date(2026, 1, 1),
    )
    LeaveBalance.objects.create(
        company=company,
        membership=membership,
        kind=LeaveBalance.Kind.ADJUSTED,
        days=Decimal("1"),
        granted_at=date(2026, 4, 1),
    )

    bal = services.compute_balance(membership, as_of=today)

    assert bal["granted_total"] == Decimal("15")
    assert bal["used"] == Decimal("4")
    # 15 (active GRANTED) - 4 (USED) - 3 (EXPIRED) + 1 (ADJUSTED) = 9
    assert bal["remaining"] == Decimal("9")


# ---------------------------------------------------------------------------
# submit_request via HTTP
# ---------------------------------------------------------------------------


def _seed_grant(company, membership, days="15", expires=date(2026, 12, 31)):
    return LeaveBalance.objects.create(
        company=company,
        membership=membership,
        kind=LeaveBalance.Kind.GRANTED,
        days=Decimal(days),
        granted_at=date(2026, 1, 1),
        expires_at=expires,
    )


def test_submit_request_happy_path(auth_client, membership, company, manager_membership):
    membership.manager = manager_membership
    membership.save(update_fields=["manager"])
    _seed_grant(company, membership)

    resp = auth_client.post(
        "/v1/leave/requests",
        {
            "start_date": "2026-05-04",
            "end_date": "2026-05-06",
            "kind": "FULL",
            "reason": "휴식",
        },
        format="json",
    )
    assert resp.status_code == 201, resp.content
    body = resp.json()["data"]
    assert Decimal(body["days"]) == Decimal("3")  # Mon, Tue, Wed
    assert body["status"] == "PENDING"

    leave = LeaveRequest.objects.get(id=body["id"])
    assert leave.membership_id == membership.id
    appr = ApprovalTask.objects.get(target_id=leave.id)
    assert appr.approver_id == manager_membership.id


def test_submit_request_insufficient_balance(auth_client, membership, company):
    _seed_grant(company, membership, days="1")

    resp = auth_client.post(
        "/v1/leave/requests",
        {
            "start_date": "2026-05-04",
            "end_date": "2026-05-08",
            "kind": "FULL",
        },
        format="json",
    )
    assert resp.status_code == 422, resp.content
    assert resp.json()["error"]["code"] == "INSUFFICIENT_BALANCE"


# ---------------------------------------------------------------------------
# decide_request
# ---------------------------------------------------------------------------


def test_decide_approve_creates_used_row(membership, manager_membership, company):
    membership.manager = manager_membership
    membership.save(update_fields=["manager"])
    _seed_grant(company, membership)

    leave = services.submit_request(
        membership=membership,
        start_date=date(2026, 5, 4),
        end_date=date(2026, 5, 5),
        kind=LeaveRequest.Kind.FULL,
    )
    appr = ApprovalTask.objects.get(target_id=leave.id)
    services.decide_request(appr, ApprovalTask.Status.APPROVED, manager_membership)

    used_rows = LeaveBalance.objects.filter(
        membership=membership, kind=LeaveBalance.Kind.USED
    )
    assert used_rows.count() == 1
    assert used_rows.first().days == Decimal("2")

    bal = services.compute_balance(membership, as_of=date(2026, 5, 4))
    # 15 granted - 2 used = 13 remaining
    assert bal["remaining"] == Decimal("13")


# ---------------------------------------------------------------------------
# grant_monthly idempotency
# ---------------------------------------------------------------------------


def test_grant_monthly_idempotent(company):
    user = User.objects.create_user(
        email="newhire@example.com",
        password="Strong!Pass99",
        name="Newhire",
    )
    membership = Membership.objects.create(
        company=company,
        user=user,
        role=Membership.Role.EMPLOYEE,
        hired_at=date(2026, 1, 15),
    )
    services.get_or_create_default_policy(company)

    with freeze_time("2026-03-15 00:05:00+09:00"):
        first = tasks.grant_monthly()
        second = tasks.grant_monthly()

    assert first == 1
    assert second == 0  # second run grants nothing new
    rows = LeaveBalance.objects.filter(
        membership=membership, kind=LeaveBalance.Kind.GRANTED
    )
    assert rows.count() == 1
    assert rows.first().days == Decimal("1")


# ---------------------------------------------------------------------------
# expire_balances
# ---------------------------------------------------------------------------


def test_expire_balances_rolls_past_expiry(company, membership):
    LeaveBalance.objects.create(
        company=company,
        membership=membership,
        kind=LeaveBalance.Kind.GRANTED,
        days=Decimal("5"),
        granted_at=date(2025, 1, 1),
        expires_at=date(2025, 12, 31),
    )
    LeaveBalance.objects.create(
        company=company,
        membership=membership,
        kind=LeaveBalance.Kind.USED,
        days=Decimal("2"),
        granted_at=date(2025, 6, 1),
    )

    created = services.expire_balances(date(2026, 5, 4))
    assert created == 1

    expired_rows = LeaveBalance.objects.filter(
        membership=membership, kind=LeaveBalance.Kind.EXPIRED
    )
    assert expired_rows.count() == 1
    # 5 granted - 2 used = 3 expired
    assert expired_rows.first().days == Decimal("3")

    # Re-run is idempotent
    created_again = services.expire_balances(date(2026, 5, 4))
    assert created_again == 0
    assert (
        LeaveBalance.objects.filter(
            membership=membership, kind=LeaveBalance.Kind.EXPIRED
        ).count()
        == 1
    )


# ---------------------------------------------------------------------------
# Endpoint smoke tests
# ---------------------------------------------------------------------------


def test_balance_endpoint(auth_client, membership, company):
    _seed_grant(company, membership, days="10")
    resp = auth_client.get("/v1/leave/balance")
    assert resp.status_code == 200, resp.content
    body = resp.json()["data"]
    assert Decimal(body["granted_total"]) == Decimal("10")
    assert Decimal(body["remaining"]) == Decimal("10")


def test_admin_balance_endpoint_can_query_employee(company, membership):
    admin_user = User.objects.create_user(
        email="leave-admin@example.com",
        password="Strong!Pass99",
        name="Leave Admin",
    )
    Membership.objects.create(
        company=company,
        user=admin_user,
        role=Membership.Role.ADMIN,
        hired_at=date(2020, 1, 1),
    )
    _seed_grant(company, membership, days="7")
    client = APIClient()
    client.force_authenticate(admin_user)

    resp = client.get(f"/v1/leave/balance?employee_id={membership.id}")

    assert resp.status_code == 200, resp.content
    body = resp.json()["data"]
    assert Decimal(body["granted_total"]) == Decimal("7")
    assert Decimal(body["remaining"]) == Decimal("7")


def test_employee_balance_endpoint_rejects_other_employee(auth_client, company):
    other_user = User.objects.create_user(
        email="other@example.com",
        password="Strong!Pass99",
        name="Other",
    )
    other = Membership.objects.create(
        company=company,
        user=other_user,
        role=Membership.Role.EMPLOYEE,
        hired_at=date(2024, 1, 1),
    )

    resp = auth_client.get(f"/v1/leave/balance?employee_id={other.id}")

    assert resp.status_code == 403, resp.content


def test_policy_endpoint_auto_creates(auth_client, membership):
    assert LeavePolicy.objects.count() == 0
    resp = auth_client.get("/v1/leave/policy")
    assert resp.status_code == 200, resp.content
    assert LeavePolicy.objects.count() == 1
    body = resp.json()["data"]
    assert body["expiry_months"] == 12
