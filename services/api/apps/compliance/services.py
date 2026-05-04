"""Compliance domain services — 52h weekly rule per spec §7.6.

Pure read functions + a single rule decision (`block_clock_in_if_over`).
No model writes. Heavy DB aggregation lives in :mod:`apps.compliance.repositories`.
"""
from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import date
from decimal import Decimal

from apps.identity.models import Company, Membership

from .repositories import ComplianceRepository, MemberHours
from .specifications import THRESHOLD_HOURS, WeeklyHoursOver, week_start_for

WARN_HOURS = Decimal("48")
ZERO = Decimal("0")


@dataclass(frozen=True)
class WeeklyStatus:
    """Status snapshot for one membership in one week."""

    hours: Decimal
    threshold_hours: Decimal
    status: str  # OK | WARN | OVER
    remaining_hours: Decimal
    week_start: date


def _classify(hours: Decimal) -> str:
    if hours >= THRESHOLD_HOURS:
        return "OVER"
    if hours >= WARN_HOURS:
        return "WARN"
    return "OK"


def weekly_hours(membership: Membership, week_start: date) -> Decimal:
    """Return the membership's worked hours for the week starting *week_start*."""
    return ComplianceRepository.weekly_hours(membership, week_start)


def weekly_status(membership: Membership, week_start: date) -> WeeklyStatus:
    """Return classified status (OK/WARN/OVER) for the week."""
    hours = weekly_hours(membership, week_start)
    remaining = THRESHOLD_HOURS - hours
    if remaining < ZERO:
        remaining = ZERO
    return WeeklyStatus(
        hours=hours,
        threshold_hours=THRESHOLD_HOURS,
        status=_classify(hours),
        remaining_hours=remaining,
        week_start=week_start,
    )


def status_to_dict(s: WeeklyStatus) -> dict:
    d = asdict(s)
    d["hours"] = str(s.hours)
    d["threshold_hours"] = str(s.threshold_hours)
    d["remaining_hours"] = str(s.remaining_hours)
    d["week_start"] = s.week_start.isoformat()
    return d


def company_overview(company: Company, week_start: date) -> list[dict]:
    """Per-membership row for the admin compliance board."""
    rows: list[MemberHours] = ComplianceRepository.company_member_hours(
        company, week_start
    )
    out: list[dict] = []
    for r in rows:
        remaining = THRESHOLD_HOURS - r.hours
        if remaining < ZERO:
            remaining = ZERO
        out.append(
            {
                "membership_id": str(r.membership_id),
                "name": r.name,
                "department": r.department,
                "role": r.role,
                "hours": str(r.hours),
                "threshold_hours": str(THRESHOLD_HOURS),
                "remaining_hours": str(remaining),
                "status": _classify(r.hours),
            }
        )
    out.sort(key=lambda d: Decimal(d["hours"]), reverse=True)
    return out


def block_clock_in_if_over(membership: Membership) -> bool:
    """Specification check — return ``True`` when the spec is satisfied (over).

    Caller (attendance.services.clock_in) decides whether to honor the block;
    that depends on Company.compliance_block_when_over.
    """
    return WeeklyHoursOver().is_satisfied_by(membership)


__all__ = [
    "WARN_HOURS",
    "WeeklyStatus",
    "weekly_hours",
    "weekly_status",
    "status_to_dict",
    "company_overview",
    "block_clock_in_if_over",
    "week_start_for",
]
