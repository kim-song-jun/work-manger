"""Django admin registrations for billing.

Production note: change-permissions are intentionally restrictive so
operators don't accidentally mutate paid invoice rows. Edits are still
allowed for ``SubscriptionPlan`` / ``CompanySubscription`` (the catalog
and lifecycle are owner-tools), but ``Invoice`` is read-only — Stripe
webhooks (iter14) will be the only writer.
"""
from __future__ import annotations

from django.contrib import admin

from .models import CompanySubscription, Invoice, SubscriptionPlan


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ("name", "price_monthly_krw", "max_employees", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name",)


@admin.register(CompanySubscription)
class CompanySubscriptionAdmin(admin.ModelAdmin):
    list_display = ("company", "plan", "status", "started_at", "current_period_end")
    list_filter = ("status", "plan")
    search_fields = ("company__name", "company__code")
    autocomplete_fields = ("company", "plan")


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("subscription", "amount_krw", "status", "issued_at", "paid_at", "external_id")
    list_filter = ("status",)
    search_fields = ("external_id", "subscription__company__name")
    readonly_fields = (
        "subscription",
        "amount_krw",
        "status",
        "issued_at",
        "paid_at",
        "external_id",
        "pdf_url",
        "created_at",
    )

    def has_add_permission(self, request):  # pragma: no cover — admin policy
        # Production policy: invoices are written exclusively by the Stripe
        # webhook (iter14). Local seed_demo bypasses the admin and uses ORM.
        return False

    def has_delete_permission(self, request, obj=None):  # pragma: no cover
        return False
