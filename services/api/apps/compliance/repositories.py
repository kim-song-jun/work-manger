"""Compliance domain repositories — Repository pattern.

Heavy aggregations (per-week per-membership totals over AttendanceRecord)
live here so the service layer stays focused on rule decisions.
All methods are read-only.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Sum

from apps.attendance.models import AttendanceRecord
from apps.identity.models import Company, Membership

ZERO = Decimal("0")


@dataclass(frozen=True)
class MemberHours:
    """Per-membership hours projection for a given week."""

    membership_id: object
    name: str
    department: str | None
    role: str
    hours: Decimal


class ComplianceRepository:
    """Read-only aggregations over :class:`AttendanceRecord` for 52h compliance."""

    @staticmethod
    def _minutes_to_hours(minutes: int | None) -> Decimal:
        if not minutes:
            return ZERO
        return (Decimal(int(minutes)) / Decimal(60)).quantize(Decimal("0.01"))

    @classmethod
    def weekly_minutes(
        cls, membership: Membership, week_start: date
    ) -> int:
        """Sum total_work_minutes for *membership* between ``week_start`` and +6 days."""
        end = week_start + timedelta(days=6)
        agg = (
            AttendanceRecord.objects.select_related("membership")
            .filter(membership=membership, work_date__gte=week_start, work_date__lte=end)
            .aggregate(s=Sum("total_work_minutes"))
        )
        return int(agg["s"] or 0)

    @classmethod
    def weekly_hours(cls, membership: Membership, week_start: date) -> Decimal:
        """Same as :meth:`weekly_minutes` but as ``Decimal`` hours."""
        return cls._minutes_to_hours(cls.weekly_minutes(membership, week_start))

    @classmethod
    def company_member_hours(
        cls, company: Company, week_start: date
    ) -> list[MemberHours]:
        """Per-membership hours for an entire company in one query."""
        end = week_start + timedelta(days=6)
        rows = (
            AttendanceRecord.objects.select_related(
                "membership__user", "membership__department"
            )
            .filter(
                company=company,
                work_date__gte=week_start,
                work_date__lte=end,
                membership__is_active=True,
            )
            .values(
                "membership_id",
                "membership__user__name",
                "membership__role",
                "membership__department__name",
            )
            .annotate(s=Sum("total_work_minutes"))
        )
        out: list[MemberHours] = []
        for r in rows:
            out.append(
                MemberHours(
                    membership_id=r["membership_id"],
                    name=r["membership__user__name"] or "",
                    department=r["membership__department__name"],
                    role=r["membership__role"] or "EMPLOYEE",
                    hours=cls._minutes_to_hours(r["s"]),
                )
            )
        # also include active members with zero recorded minutes for the week
        existing_ids = {row.membership_id for row in out}
        zero_members = (
            Membership.objects.filter(company=company, is_active=True)
            .exclude(id__in=existing_ids)
            .select_related("user", "department")
        )
        for m in zero_members:
            out.append(
                MemberHours(
                    membership_id=m.id,
                    name=m.user.name,
                    department=m.department.name if m.department else None,
                    role=m.role,
                    hours=ZERO,
                )
            )
        return out


__all__ = ["ComplianceRepository", "MemberHours"]
