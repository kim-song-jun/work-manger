"""Celery tasks for the Leave domain.

Schedules are configured via :mod:`apps.leave.migrations.0002_seed_beat_schedule`.
"""
from __future__ import annotations

from datetime import timedelta
from decimal import Decimal

from celery import shared_task
from django.db import transaction
from django.utils import timezone as django_tz

from apps.identity.models import Company, Membership
from apps.notification.models import NotificationLog

from . import services
from .models import LeaveBalance, LeavePolicy


@shared_task(name="leave.grant_monthly")
def grant_monthly() -> int:
    """Award the monthly day-off to qualifying memberships (입사 1년 미만).

    Idempotent: a per-month note key prevents duplicate grants when re-run.
    """
    today = django_tz.localdate()
    cutoff = today - timedelta(days=400)
    created = 0

    memberships = (
        Membership.objects.filter(is_active=True, hired_at__gte=cutoff)
        .select_related("company")
    )
    for membership in memberships:
        policy = services.get_or_create_default_policy(membership.company)
        grants = services.apply_grant_rules(membership, today, policy)
        for grant in grants:
            if not grant.note.startswith("monthly:"):
                continue
            with transaction.atomic():
                exists = LeaveBalance.objects.filter(
                    membership=membership,
                    kind=LeaveBalance.Kind.GRANTED,
                    note=grant.note,
                ).exists()
                if exists:
                    continue
                LeaveBalance.objects.create(
                    company=membership.company,
                    membership=membership,
                    kind=LeaveBalance.Kind.GRANTED,
                    days=grant.days,
                    granted_at=grant.granted_at,
                    expires_at=grant.expires_at,
                    note=grant.note,
                )
                created += 1
    return created


@shared_task(name="leave.grant_annual")
def grant_annual() -> int:
    """Award the annual block on each company's fiscal-year start.

    Idempotent via ``annual:<year>`` note key.
    """
    today = django_tz.localdate()
    created = 0

    for company in Company.objects.all():
        policy = services.get_or_create_default_policy(company)
        # Only run on the company's fiscal_year_start day-of-year.
        fy = company.fiscal_year_start
        if (today.month, today.day) != (fy.month, fy.day):
            continue

        memberships = Membership.objects.filter(company=company, is_active=True)
        for membership in memberships:
            grants = services.apply_grant_rules(membership, today, policy)
            for grant in grants:
                if not grant.note.startswith("annual:"):
                    continue
                with transaction.atomic():
                    exists = LeaveBalance.objects.filter(
                        membership=membership,
                        kind=LeaveBalance.Kind.GRANTED,
                        note=grant.note,
                    ).exists()
                    if exists:
                        continue
                    LeaveBalance.objects.create(
                        company=company,
                        membership=membership,
                        kind=LeaveBalance.Kind.GRANTED,
                        days=grant.days,
                        granted_at=grant.granted_at,
                        expires_at=grant.expires_at,
                        note=grant.note,
                    )
                    created += 1
    return created


@shared_task(name="leave.notify_expiring")
def notify_expiring() -> int:
    """Create in-app notification log rows for upcoming expirations.

    Push delivery itself is handled by the ``notification.dispatch`` task —
    here we only record the inbox entry.
    """
    today = django_tz.localdate()
    created = 0

    for company in Company.objects.all():
        policy = services.get_or_create_default_policy(company)
        days_list = policy.notify_days_before or services.DEFAULT_NOTIFY_DAYS
        for delta in days_list:
            target = today + timedelta(days=int(delta))
            rows = (
                LeaveBalance.objects.filter(
                    company=company,
                    kind=LeaveBalance.Kind.GRANTED,
                    expires_at=target,
                )
                .select_related("membership")
            )
            for row in rows:
                payload = {
                    "kind": "leave.expiring",
                    "days": str(Decimal(row.days)),
                    "expires_at": row.expires_at.isoformat(),
                    "delta_days": int(delta),
                }
                # Prevent duplicate logging for the same (membership, balance row, delta).
                exists = NotificationLog.objects.filter(
                    membership=row.membership,
                    event_kind="leave.expiring",
                    payload_json__contains={
                        "expires_at": row.expires_at.isoformat(),
                        "delta_days": int(delta),
                    },
                ).exists()
                if exists:
                    continue
                NotificationLog.objects.create(
                    membership=row.membership,
                    event_kind="leave.expiring",
                    channel="INAPP",
                    payload_json=payload,
                )
                created += 1
    return created


@shared_task(name="leave.expire")
def expire_balances_task() -> int:
    today = django_tz.localdate()
    return services.expire_balances(today)


# Re-exported aliases for convenience in tests / shells.
__all__ = [
    "grant_monthly",
    "grant_annual",
    "notify_expiring",
    "expire_balances_task",
]
