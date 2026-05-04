"""Shared monthly-report aggregation for CSV + PDF exporters.

Single read path so CSV row count and PDF table count cannot diverge.
"""
from __future__ import annotations

from datetime import date
from decimal import Decimal

from apps.attendance.models import AttendanceRecord
from apps.leave.models import LeaveBalance
from core.errors import Unprocessable


def parse_ym(ym: str) -> tuple[date, date]:
    """Return [month_start, next_month_start) bounds. Raises Unprocessable on bad input."""
    try:
        y, m = ym.split("-")
        year, month = int(y), int(m)
        if not (1 <= month <= 12):
            raise ValueError
        start = date(year, month, 1)
    except (ValueError, AttributeError):
        raise Unprocessable(code="INVALID_YM", message="ym 파라미터는 YYYY-MM 형식이어야 합니다.")
    end = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
    return start, end


def collect_monthly(company, ym: str) -> dict:
    """Aggregate per-member attendance + leave totals for the given YYYY-MM."""
    start, end = parse_ym(ym)
    rows = (
        AttendanceRecord.objects.filter(
            company=company, work_date__gte=start, work_date__lt=end
        )
        .select_related("membership__user", "membership__department")
    )
    by_member: dict[str, dict] = {}
    for r in rows:
        key = str(r.membership_id)
        m = by_member.setdefault(
            key,
            {
                "membership_id": key,
                "name": r.membership.user.name,
                "department": r.membership.department.name if r.membership.department else "",
                "days": 0,
                "late_days": 0,
                "total_minutes": 0,
                "leave_used": Decimal("0"),
            },
        )
        m["days"] += 1
        m["late_days"] += 1 if r.is_late else 0
        m["total_minutes"] += r.total_work_minutes or 0

    # Layer in leave usage (USED rows are stored as negative days per leave model conventions).
    used = (
        LeaveBalance.objects.filter(
            company=company, kind="USED", granted_at__gte=start, granted_at__lt=end
        )
        .values_list("membership_id", "days")
    )
    for mid, days in used:
        key = str(mid)
        m = by_member.setdefault(
            key,
            {
                "membership_id": key,
                "name": "",
                "department": "",
                "days": 0,
                "late_days": 0,
                "total_minutes": 0,
                "leave_used": Decimal("0"),
            },
        )
        m["leave_used"] += abs(days)

    members = list(by_member.values())
    totals = {
        "members": len(members),
        "total_minutes": sum(m["total_minutes"] for m in members),
        "late_days": sum(m["late_days"] for m in members),
        "leave_used": sum((m["leave_used"] for m in members), Decimal("0")),
    }
    avg_hours = (
        round(totals["total_minutes"] / 60 / totals["members"], 2)
        if totals["members"]
        else 0
    )
    return {"ym": ym, "members": members, "totals": totals, "avg_hours": avg_hours}
