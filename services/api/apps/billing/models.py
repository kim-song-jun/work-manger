"""Billing data models — iter13 T6 SKELETON.

Stripe integration is *deferred to iter14*. This module ships the data layer
and read-only OWNER-only views only:

- :class:`SubscriptionPlan` — catalog of purchasable plans (KRW pricing).
- :class:`CompanySubscription` — one row per company tracking lifecycle
  (TRIAL → ACTIVE → PAST_DUE → CANCELED).
- :class:`Invoice` — receipt rows with a nullable ``external_id`` placeholder
  for the future Stripe ``in_xxx`` reference.

ADR-006 keeps payments off Firebase; the eventual provider is Stripe but
no SDK calls happen here.
"""
from __future__ import annotations

import uuid

from django.db import models
from django.utils import timezone as django_tz


class SubscriptionPlan(models.Model):
    """A purchasable subscription tier.

    Prices are KRW integers (no fractional won). ``features_jsonb`` is a
    free-form catalog payload the FE can render — it intentionally
    avoids a per-feature column so iter14 can extend without migrations.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=64)
    price_monthly_krw = models.IntegerField()
    max_employees = models.IntegerField(default=0, help_text="0 = unlimited")
    features_jsonb = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=django_tz.now, editable=False)

    class Meta:
        db_table = "billing_subscription_plan"
        indexes = [
            models.Index(fields=["is_active"], name="idx_plan_active"),
        ]

    def __str__(self) -> str:  # pragma: no cover — admin / shell only
        return f"{self.name} (₩{self.price_monthly_krw:,}/mo)"


class CompanySubscription(models.Model):
    """Per-company subscription state.

    A company has at most one active row at a time. The lifecycle is:

    - ``TRIAL`` — new tenant, default trial period (14d) before billing.
    - ``ACTIVE`` — paid, ``current_period_end`` advances each cycle.
    - ``PAST_DUE`` — Stripe webhook flips here on failed charge (iter14).
    - ``CANCELED`` — owner-initiated, ``canceled_at`` is set.
    """

    class Status(models.TextChoices):
        TRIAL = "TRIAL", "Trial"
        ACTIVE = "ACTIVE", "Active"
        PAST_DUE = "PAST_DUE", "Past due"
        CANCELED = "CANCELED", "Canceled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        "identity.Company",
        on_delete=models.CASCADE,
        related_name="subscriptions",
    )
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name="subscriptions",
    )
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.TRIAL)
    started_at = models.DateTimeField(default=django_tz.now)
    current_period_end = models.DateTimeField(null=True, blank=True)
    canceled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=django_tz.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "billing_company_subscription"
        indexes = [
            models.Index(fields=["company", "status"], name="idx_sub_company_status"),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.company_id} → {self.plan_id} [{self.status}]"


class Invoice(models.Model):
    """A receipt row for one billing cycle.

    ``external_id`` will hold the Stripe ``in_xxx`` reference once the
    iter14 webhook lands; today it stays NULL on every row.
    """

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PAID = "PAID", "Paid"
        VOID = "VOID", "Void"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey(
        CompanySubscription,
        on_delete=models.CASCADE,
        related_name="invoices",
    )
    amount_krw = models.IntegerField()
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    issued_at = models.DateTimeField(default=django_tz.now)
    paid_at = models.DateTimeField(null=True, blank=True)
    # Empty string (not NULL) per Django convention for optional text columns
    # — keeps the column NOT NULL and avoids `null=True` on string fields
    # (DJ001). The Stripe webhook (iter14) writes the real `in_xxx` ref here.
    external_id = models.CharField(
        max_length=128,
        blank=True,
        default="",
        help_text="Stripe invoice ID (iter14)",
    )
    pdf_url = models.URLField(blank=True, default="")
    created_at = models.DateTimeField(default=django_tz.now, editable=False)

    class Meta:
        db_table = "billing_invoice"
        indexes = [
            models.Index(fields=["subscription", "status"], name="idx_invoice_sub_status"),
            models.Index(fields=["issued_at"], name="idx_invoice_issued"),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"Invoice {self.id} ₩{self.amount_krw:,} [{self.status}]"
