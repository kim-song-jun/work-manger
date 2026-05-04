"""CSV writer for /v1/admin/reports/export?format=csv."""
from __future__ import annotations

import csv
import io

from .report_data import collect_monthly


def monthly_report_csv(company, ym: str) -> str:
    """Return CSV text: header row + 1 row per member."""
    data = collect_monthly(company, ym)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(
        [
            "membership_id",
            "name",
            "department",
            "days",
            "late_days",
            "total_minutes",
            "leave_used",
        ]
    )
    for m in data["members"]:
        writer.writerow(
            [
                m["membership_id"],
                m["name"],
                m["department"],
                m["days"],
                m["late_days"],
                m["total_minutes"],
                str(m["leave_used"]),
            ]
        )
    return buf.getvalue()
