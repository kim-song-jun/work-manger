"""Leave domain repositories — Repository pattern.

Heavy aggregations / cohort scans live here so the service layer stays focused
on business rules and transactions. All methods are read-only (no writes).
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Q, Sum
from django.utils import timezone as django_tz

from apps.identity.models import Membership

from .models import LeaveBalance

ZERO = Decimal("0")
DEFAULT_EXPIRING_WINDOW_DAYS = 60


@dataclass(frozen=True)
class BalanceSnapshot:
    """Aggregate result returned by :meth:`BalanceRepository.compute_for`."""

    granted_total: Decimal
    used: Decimal
    expired: Decimal
    adjusted: Decimal
    remaining: Decimal
    expiring_soon: list[dict]


@dataclass(frozen=True)
class ExpiringRow:
    """A single upcoming-expiry projection."""

    days: Decimal
    expires_at: date
    membership_id: object
    company_id: object


class BalanceRepository:
    """Read-only aggregations over :class:`LeaveBalance`."""

    @staticmethod
    def _decimal_sum(qs) -> Decimal:
        val = qs.aggregate(s=Sum("days"))["s"]
        return Decimal(val) if val is not None else ZERO

    @classmethod
    def compute_for(
        cls, membership: Membership, as_of: date | None = None,
        expiring_window_days: int = DEFAULT_EXPIRING_WINDOW_DAYS,
    ) -> BalanceSnapshot:
        """Return the per-kind aggregates + remaining for *membership*.

        ``granted_total`` excludes rows already past their ``expires_at``.
        Mirrors the math previously inlined in ``services.compute_balance``.
        """
        today = as_of or django_tz.localdate()
        qs = LeaveBalance.objects.filter(membership=membership)

        granted_active_q = Q(kind=LeaveBalance.Kind.GRANTED) & (
            Q(expires_at__isnull=True) | Q(expires_at__gte=today)
        )
        granted_total = cls._decimal_sum(qs.filter(granted_active_q))
        used = cls._decimal_sum(qs.filter(kind=LeaveBalance.Kind.USED))
        expired = cls._decimal_sum(qs.filter(kind=LeaveBalance.Kind.EXPIRED))
        adjusted = cls._decimal_sum(qs.filter(kind=LeaveBalance.Kind.ADJUSTED))

        remaining = granted_total - used - expired + adjusted

        soon_window = today + timedelta(days=expiring_window_days)
        soon_rows = (
            qs.filter(
                kind=LeaveBalance.Kind.GRANTED,
                expires_at__isnull=False,
                expires_at__gte=today,
                expires_at__lte=soon_window,
            )
            .order_by("expires_at")
            .values("days", "expires_at")
        )
        expiring_soon = [
            {"days": Decimal(r["days"]), "expires_at": r["expires_at"]}
            for r in soon_rows
        ]
        return BalanceSnapshot(
            granted_total=granted_total,
            used=used,
            expired=expired,
            adjusted=adjusted,
            remaining=remaining,
            expiring_soon=expiring_soon,
        )

    @classmethod
    def expiring_soon(
        cls,
        membership: Membership,
        before_days: int,
        as_of: date | None = None,
    ) -> list[ExpiringRow]:
        """Return GRANTED rows that expire on exactly ``today + before_days``.

        Matches the semantics of the ``leave.notify_expiring`` task: we only
        notify on the configured offset days (e.g. 30/14/7/1) so the user
        sees one ping per offset, not every day in between.

        Edge case: ``before_days == 0`` matches rows expiring today.
        """
        today = as_of or django_tz.localdate()
        target = today + timedelta(days=int(before_days))
        rows = (
            LeaveBalance.objects.filter(
                membership=membership,
                kind=LeaveBalance.Kind.GRANTED,
                expires_at=target,
            )
            .values("days", "expires_at", "membership_id", "company_id")
            .order_by("expires_at")
        )
        return [
            ExpiringRow(
                days=Decimal(r["days"]),
                expires_at=r["expires_at"],
                membership_id=r["membership_id"],
                company_id=r["company_id"],
            )
            for r in rows
        ]


__all__ = [
    "BalanceRepository",
    "BalanceSnapshot",
    "ExpiringRow",
]
