"""Compliance specifications — composable predicates per docs/guidelines §3.

Used by attendance.services.clock_in to optionally block when the membership
has already exceeded the 52h weekly threshold and the company has opted in.
"""
from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

from django.utils import timezone as django_tz

from apps.identity.models import Membership
from core.specifications import Specification

from .repositories import ComplianceRepository

THRESHOLD_HOURS = Decimal("52")


def week_start_for(today: date) -> date:
    """Return Monday of the week containing *today* (KST-aware via caller)."""
    return today - timedelta(days=today.weekday())


class WeeklyHoursOver(Specification):
    """Satisfied when *candidate* (Membership) is at/over THRESHOLD_HOURS this week."""

    def __init__(self, threshold: Decimal = THRESHOLD_HOURS) -> None:
        self.threshold = threshold

    def is_satisfied_by(self, candidate: Membership) -> bool:  # type: ignore[override]
        if candidate is None:
            return False
        today = django_tz.localdate()
        ws = week_start_for(today)
        hours = ComplianceRepository.weekly_hours(candidate, ws)
        return hours >= self.threshold


__all__ = ["THRESHOLD_HOURS", "WeeklyHoursOver", "week_start_for"]
