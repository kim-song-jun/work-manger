"""PDF monthly report — reportlab Platypus.

Korean-safe: bundles NotoSansKR-Regular.otf at fonts/NotoSansKR-Regular.otf when
present (see requirements-fonts.md). When the font file is absent the report
falls back to Helvetica + romanized labels — table rows still render but Korean
characters in member.name will appear as filler boxes (acceptable; engineers
will only see this in dev). PDFs always begin with the literal "%PDF-" header
which is what tests assert.

License: NotoSansKR is OFL 1.1 (free for redistribution); reportlab 4.x is
Apache-2.0. No native compile required (pure-Python wheels).
"""
from __future__ import annotations

import io
import os
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from .report_data import collect_monthly

_FONT_PATH = os.path.join(os.path.dirname(__file__), "fonts", "NotoSansKR-Regular.otf")
_FONT_NAME_KR = "NotoSansKR"
_REGISTERED: bool | None = None


def _ensure_font() -> str:
    """Register the bundled CJK font once. Return the font name to use.

    TODO(ops): pin the font hash and verify on build. See requirements-fonts.md.
    """
    global _REGISTERED
    if _REGISTERED is True:
        return _FONT_NAME_KR
    if _REGISTERED is False:
        return "Helvetica"
    if os.path.exists(_FONT_PATH):
        try:
            pdfmetrics.registerFont(TTFont(_FONT_NAME_KR, _FONT_PATH))
            _REGISTERED = True
            return _FONT_NAME_KR
        except Exception:  # noqa: BLE001 — fall through to romanized
            _REGISTERED = False
            return "Helvetica"
    _REGISTERED = False
    return "Helvetica"


def _labels(use_kr: bool) -> dict[str, str]:
    if use_kr:
        return {
            "title": "{company} · {ym} 근태 리포트",
            "kpi_total": "총 인원",
            "kpi_avg": "평균 근무시간(h)",
            "kpi_late": "지각 일수",
            "kpi_leave": "연차 사용일",
            "col_name": "이름",
            "col_dept": "부서",
            "col_days": "출근일수",
            "col_late": "지각",
            "col_minutes": "총근무(분)",
            "col_leave": "연차사용",
        }
    return {
        "title": "{company} - {ym} Attendance Report",
        "kpi_total": "Members",
        "kpi_avg": "Avg Hours",
        "kpi_late": "Late Days",
        "kpi_leave": "Leave Used",
        "col_name": "Name",
        "col_dept": "Dept",
        "col_days": "Days",
        "col_late": "Late",
        "col_minutes": "Minutes",
        "col_leave": "Leave",
    }


def monthly_report_pdf(company, ym: str) -> bytes:
    """Render an A4 PDF for one month. Returns raw bytes starting with `%PDF-`."""
    font = _ensure_font()
    use_kr = font == _FONT_NAME_KR
    L = _labels(use_kr)
    data = collect_monthly(company, ym)

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "title", parent=styles["Title"], fontName=font, fontSize=18, leading=22
    )
    body_style = ParagraphStyle(
        "body", parent=styles["BodyText"], fontName=font, fontSize=10, leading=14
    )

    story: list[Any] = []
    story.append(Paragraph(L["title"].format(company=company.name, ym=ym), title_style))
    story.append(Spacer(1, 6 * mm))

    totals = data["totals"]
    kpi_table = Table(
        [
            [L["kpi_total"], L["kpi_avg"], L["kpi_late"], L["kpi_leave"]],
            [
                str(totals["members"]),
                str(data["avg_hours"]),
                str(totals["late_days"]),
                str(totals["leave_used"]),
            ],
        ],
        colWidths=[40 * mm] * 4,
    )
    kpi_table.setStyle(
        TableStyle(
            [
                ("FONT", (0, 0), (-1, -1), font, 10),
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ]
        )
    )
    story.append(kpi_table)
    story.append(Spacer(1, 8 * mm))

    rows: list[list[str]] = [
        [
            L["col_name"],
            L["col_dept"],
            L["col_days"],
            L["col_late"],
            L["col_minutes"],
            L["col_leave"],
        ]
    ]
    for m in data["members"]:
        rows.append(
            [
                m["name"] or "-",
                m["department"] or "-",
                str(m["days"]),
                str(m["late_days"]),
                str(m["total_minutes"]),
                str(m["leave_used"]),
            ]
        )
    member_table = Table(rows, repeatRows=1)
    member_table.setStyle(
        TableStyle(
            [
                ("FONT", (0, 0), (-1, -1), font, 9),
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    story.append(member_table)
    if not use_kr:
        story.append(Spacer(1, 4 * mm))
        story.append(
            Paragraph("(Korean font missing; see requirements-fonts.md)", body_style)
        )

    doc.build(story)
    return buf.getvalue()
