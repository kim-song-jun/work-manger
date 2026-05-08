"""Billing skeleton tests (iter13 T6).

Covers:
  - SubscriptionPlan / CompanySubscription / Invoice model creation
  - Serializer roundtrip (read-only shape stable for FE types)
  - GET /v1/billing/subscription — auth required, OWNER-only, 404 when missing
  - GET /v1/billing/invoices — OWNER-only, filtered by company

Out of scope:
  - Stripe webhook (iter14)
  - Mutation endpoints (none exist yet)
"""
from __future__ import annotations

from datetime import date, timedelta

import pytest
from django.utils import timezone as django_tz
from rest_framework.test import APIClient

from apps.billing.models import CompanySubscription, Invoice, SubscriptionPlan
from apps.billing.serializers import (
    CompanySubscriptionSerializer,
    InvoiceSerializer,
    SubscriptionPlanSerializer,
)
from apps.identity.models import Company, Membership, User

pytestmark = pytest.mark.django_db


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def company(db):
    return Company.objects.create(
        name="ACME Billing",
        code="ACMEBL",
        fiscal_year_start=date(2026, 1, 1),
        timezone="Asia/Seoul",
    )


@pytest.fixture
def other_company(db):
    return Company.objects.create(
        name="Other Co",
        code="OTHCO1",
        fiscal_year_start=date(2026, 1, 1),
        timezone="Asia/Seoul",
    )


@pytest.fixture
def plan(db):
    return SubscriptionPlan.objects.create(
        name="Standard",
        price_monthly_krw=50000,
        max_employees=50,
        features_jsonb={"attendance": True},
    )


def _make_user_membership(company, role: str, email: str) -> Membership:
    user = User.objects.create_user(
        email=email,
        password="Strong!Pass99",
        name=f"{role} User",
        is_email_verified=True,
    )
    return Membership.objects.create(
        company=company,
        user=user,
        role=role,
        hired_at=date(2024, 1, 1),
    )


def _auth_client(membership: Membership) -> APIClient:
    client = APIClient()
    resp = client.post(
        "/v1/auth/login",
        {"email": membership.user.email, "password": "Strong!Pass99"},
        format="json",
    )
    assert resp.status_code == 200, resp.content
    access = resp.json()["data"]["access_token"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    return client


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------


def test_models_create_full_chain(company, plan):
    """Plan → CompanySubscription → Invoice all persist with default values."""
    sub = CompanySubscription.objects.create(
        company=company,
        plan=plan,
        status=CompanySubscription.Status.TRIAL,
        current_period_end=django_tz.now() + timedelta(days=14),
    )
    inv = Invoice.objects.create(
        subscription=sub,
        amount_krw=50000,
        status=Invoice.Status.DRAFT,
    )
    assert SubscriptionPlan.objects.count() == 1
    assert CompanySubscription.objects.filter(company=company).count() == 1
    assert Invoice.objects.filter(subscription=sub).count() == 1
    assert inv.external_id == ""  # Stripe placeholder, set by iter14 webhook
    assert inv.pdf_url == ""


# ---------------------------------------------------------------------------
# Serializers
# ---------------------------------------------------------------------------


def test_subscription_serializer_includes_plan(company, plan):
    """Serializer nests the plan so the FE can render name + price in one fetch."""
    sub = CompanySubscription.objects.create(
        company=company,
        plan=plan,
        status=CompanySubscription.Status.ACTIVE,
    )
    data = CompanySubscriptionSerializer(sub).data
    assert data["status"] == "ACTIVE"
    assert data["plan"]["name"] == "Standard"
    assert data["plan"]["price_monthly_krw"] == 50000
    assert "company" not in data  # implicit via auth — never leaked outward


def test_invoice_serializer_shape(company, plan):
    sub = CompanySubscription.objects.create(company=company, plan=plan)
    inv = Invoice.objects.create(
        subscription=sub,
        amount_krw=50000,
        status=Invoice.Status.PAID,
        paid_at=django_tz.now(),
    )
    data = InvoiceSerializer(inv).data
    assert set(data.keys()) == {
        "id",
        "amount_krw",
        "status",
        "issued_at",
        "paid_at",
        "external_id",
        "pdf_url",
    }
    assert data["status"] == "PAID"
    assert data["amount_krw"] == 50000


def test_plan_serializer_roundtrip(plan):
    data = SubscriptionPlanSerializer(plan).data
    assert data["name"] == "Standard"
    assert data["features_jsonb"] == {"attendance": True}


# ---------------------------------------------------------------------------
# Endpoints — auth + role gates
# ---------------------------------------------------------------------------


def test_subscription_endpoint_requires_auth():
    client = APIClient()
    resp = client.get("/v1/billing/subscription")
    assert resp.status_code == 401


def test_subscription_endpoint_blocks_employee(company, plan):
    """Non-OWNER roles must hit 403, even with a valid subscription row."""
    CompanySubscription.objects.create(company=company, plan=plan)
    member = _make_user_membership(company, Membership.Role.EMPLOYEE, "emp@acme.test")
    client = _auth_client(member)
    resp = client.get("/v1/billing/subscription")
    assert resp.status_code == 403


def test_subscription_endpoint_owner_returns_data(company, plan):
    sub = CompanySubscription.objects.create(
        company=company, plan=plan, status=CompanySubscription.Status.TRIAL
    )
    owner = _make_user_membership(company, Membership.Role.OWNER, "owner@acme.test")
    client = _auth_client(owner)
    resp = client.get("/v1/billing/subscription")
    assert resp.status_code == 200, resp.content
    body = resp.json()["data"]
    assert body["status"] == "TRIAL"
    assert body["plan"]["name"] == "Standard"
    assert body["id"] == str(sub.id)


def test_subscription_endpoint_returns_404_when_missing(company):
    """OWNER without a subscription gets a structured 404 (FE branches to CTA)."""
    owner = _make_user_membership(company, Membership.Role.OWNER, "owner@acme.test")
    client = _auth_client(owner)
    resp = client.get("/v1/billing/subscription")
    assert resp.status_code == 404


def test_invoices_endpoint_filters_by_company(company, other_company, plan):
    """Cross-tenant isolation: an OWNER must only see their own company's invoices."""
    own_sub = CompanySubscription.objects.create(company=company, plan=plan)
    other_sub = CompanySubscription.objects.create(company=other_company, plan=plan)
    Invoice.objects.create(subscription=own_sub, amount_krw=50000, status=Invoice.Status.PAID)
    Invoice.objects.create(subscription=own_sub, amount_krw=50000, status=Invoice.Status.DRAFT)
    Invoice.objects.create(subscription=other_sub, amount_krw=99999, status=Invoice.Status.PAID)

    owner = _make_user_membership(company, Membership.Role.OWNER, "owner@acme.test")
    client = _auth_client(owner)
    resp = client.get("/v1/billing/invoices")
    assert resp.status_code == 200, resp.content
    rows = resp.json()["data"]
    assert len(rows) == 2
    # Cross-tenant amount must never leak
    assert all(r["amount_krw"] == 50000 for r in rows)


def test_invoices_endpoint_blocks_admin(company, plan):
    """ADMIN < OWNER — billing is OWNER-only even for ADMIN role."""
    sub = CompanySubscription.objects.create(company=company, plan=plan)
    Invoice.objects.create(subscription=sub, amount_krw=50000)
    admin = _make_user_membership(company, Membership.Role.ADMIN, "admin@acme.test")
    client = _auth_client(admin)
    resp = client.get("/v1/billing/invoices")
    assert resp.status_code == 403
