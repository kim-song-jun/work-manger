"""
Test: admin_api · 관리자 핵심 엔드포인트 회귀
Type: Integration (real Postgres, JWT auth, role-based permissions)
Why:  관리자 화면이 멈추면 운영팀이 사용자 신청을 처리하지 못한다.
      권한 가드(403)와 잘못된 입력(422) 분기가 자주 회귀하므로 핵심 케이스만 우선 커버.
Covers:
  - GET  /v1/admin/dashboard                       — 오늘의 운영 KPI
  - GET  /v1/admin/employees?q=...                 — 검색
  - PATCH /v1/admin/employees/{id}/update          — 권한/직책 변경
  - POST /v1/admin/employees/{id}/deactivate       — 비활성화
  - GET  /v1/admin/reports/monthly?ym=YYYY-MM      — 입력 검증 + 기본값
  - 권한: EMPLOYEE → 403 (ADMIN/OWNER 만 통과)
Out of scope:
  - CSV 일괄 등록 (별도 테스트)
  - 컴플라이언스 보드 / 실시간 보드 (별도 도메인)
Coverage target: ≥ 80% for apps/admin_api/views.py
"""
from __future__ import annotations

from datetime import date, timedelta

import pytest
from django.utils import timezone as django_tz

from tests.factories import MembershipFactory, UserFactory

pytestmark = pytest.mark.django_db


def test_dashboard_requires_admin(client_auth):
    client, _m = client_auth(role="EMPLOYEE")
    r = client.get("/v1/admin/dashboard")
    assert r.status_code == 403


def test_dashboard_admin_ok(client_auth):
    client, m = client_auth(role="ADMIN")
    # add a coworker
    MembershipFactory(company=m.company, role="EMPLOYEE")
    r = client.get("/v1/admin/dashboard")
    assert r.status_code == 200, r.content
    d = r.json()["data"]
    assert d["total_members"] >= 2
    assert "pending_approvals" in d


def test_list_employees_search(client_auth):
    client, m = client_auth(role="ADMIN")
    u = UserFactory(name="Sungjun Lee", email="sungjun@x.com")
    MembershipFactory(company=m.company, user=u, role="EMPLOYEE", employee_no="E0001")
    r = client.get("/v1/admin/employees?q=sung")
    assert r.status_code == 200
    items = r.json()["data"]
    names = [it["name"] for it in items]
    assert "Sungjun Lee" in names


def test_update_employee_role(client_auth):
    client, admin = client_auth(role="ADMIN")
    target = MembershipFactory(company=admin.company, role="EMPLOYEE")
    r = client.patch(
        f"/v1/admin/employees/{target.id}/update",
        {"role": "MANAGER", "position": "Lead"},
        format="json",
    )
    assert r.status_code == 200, r.content
    target.refresh_from_db()
    assert target.role == "MANAGER"
    assert target.position == "Lead"


def test_deactivate_employee(client_auth):
    client, admin = client_auth(role="ADMIN")
    target = MembershipFactory(company=admin.company, role="EMPLOYEE")
    r = client.post(f"/v1/admin/employees/{target.id}/deactivate")
    assert r.status_code == 200
    target.refresh_from_db()
    assert target.is_active is False


def test_monthly_report_invalid_ym(client_auth):
    client, _m = client_auth(role="ADMIN")
    r = client.get("/v1/admin/reports/monthly?ym=bad")
    assert r.status_code == 422


def test_monthly_report_default_current_month(client_auth):
    client, _m = client_auth(role="ADMIN")
    r = client.get("/v1/admin/reports/monthly")
    assert r.status_code == 200
    d = r.json()["data"]
    today = django_tz.localdate()
    assert d["ym"] == today.strftime("%Y-%m")
