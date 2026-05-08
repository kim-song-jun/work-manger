"""DRF serializers for billing read-only endpoints.

The FE never writes through these — pricing changes happen via Django
admin (or, in iter14, Stripe webhook). Keep them flat and explicit so
``drf-spectacular`` produces a clean OpenAPI schema for ``types:gen``.
"""
from __future__ import annotations

from rest_framework import serializers

from .models import CompanySubscription, Invoice, SubscriptionPlan


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = (
            "id",
            "name",
            "price_monthly_krw",
            "max_employees",
            "features_jsonb",
            "is_active",
        )


class CompanySubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)

    class Meta:
        model = CompanySubscription
        fields = (
            "id",
            "plan",
            "status",
            "started_at",
            "current_period_end",
            "canceled_at",
        )


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = (
            "id",
            "amount_krw",
            "status",
            "issued_at",
            "paid_at",
            "external_id",
            "pdf_url",
        )
