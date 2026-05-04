"""
Test: admin_api.export · 월간 리포트 내보내기 (GET /v1/admin/reports/export)
Type: Integration (real Postgres, JWT auth, reportlab PDF generation)
Why:  CSV/PDF 다운로드는 외부 회계·노무 툴 연동의 핵심 진입점이다. format
      파라미터 분기와 Content-Type/Disposition 헤더가 깨지면 운영팀이 파일을
      열지 못해 즉시 incident.
Covers:
  - GET /v1/admin/reports/export?format=csv  → text/csv, header 행 + 1 멤버 행
  - GET /v1/admin/reports/export?format=pdf  → application/pdf, %PDF- 시그니처
  - GET /v1/admin/reports/export?format=xml  → 422 INVALID_FORMAT
Out of scope:
  - 한글 폰트 렌더링 정밀도 (수동 검증)
  - 매우 큰 회사 (성능)
Coverage target: ≥ 85% for apps/admin_api/views_bulk.py + exporters/
"""
from __future__ import annotations

import datetime as _dt

import pytest

from tests.factories import AttendanceRecordFactory, MembershipFactory

pytestmark = pytest.mark.django_db


def _seed_one_record(company, ym: str = "2026-05"):
    member = MembershipFactory(company=company, role="EMPLOYEE")
    work_date = _dt.date(int(ym.split("-")[0]), int(ym.split("-")[1]), 5)
    AttendanceRecordFactory(
        membership=member, company=company, work_date=work_date,
        is_late=True, total_work_minutes=480,
    )
    return member


def test_export_csv_has_header_and_one_member_row(client_auth):
    """CSV: 헤더 1줄 + 멤버 1줄 = 최소 2줄."""
    client, admin = client_auth(role="ADMIN")
    member = _seed_one_record(admin.company, ym="2026-05")
    r = client.get("/v1/admin/reports/export?format=csv&ym=2026-05")
    assert r.status_code == 200, r.content
    assert r["Content-Type"].startswith("text/csv")
    assert "attachment" in r["Content-Disposition"]
    body = r.content.decode("utf-8")
    lines = [ln for ln in body.splitlines() if ln.strip()]
    assert len(lines) >= 2
    assert lines[0].startswith("membership_id,name,department")
    assert str(member.id) in body


def test_export_pdf_starts_with_pdf_signature(client_auth):
    """PDF: 첫 5바이트 == b'%PDF-'."""
    client, admin = client_auth(role="ADMIN")
    _seed_one_record(admin.company, ym="2026-05")
    r = client.get("/v1/admin/reports/export?format=pdf&ym=2026-05")
    assert r.status_code == 200, r.content
    assert r["Content-Type"] == "application/pdf"
    assert "monthly-2026-05.pdf" in r["Content-Disposition"]
    assert r.content[:5] == b"%PDF-"


def test_export_invalid_format_returns_422(client_auth):
    """format=xml → 422 INVALID_FORMAT."""
    client, _admin = client_auth(role="ADMIN")
    r = client.get("/v1/admin/reports/export?format=xml")
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "INVALID_FORMAT"
