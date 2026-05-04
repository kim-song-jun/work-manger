"""
Test: team · /v1/team/calendar/matrix
Type: Integration (real Postgres, JWT auth)
Why:  웹 어드민과 매니저가 한 화면에서 날짜×멤버 매트릭스를 본다.
      status 매핑이 잘못되면 휴가 중인 사람이 출근으로 표시될 수 있어
      매핑(office/wfh/leave/break/off)과 group_by 정렬을 회귀 보호한다.
Covers:
  - GET /v1/team/calendar/matrix?from=...&to=...           — 7일 윈도우
  - status 매핑: leave > break > wfh > office > off
  - group_by=team                                          — 부서 그룹 묶음
  - 잘못된 from/to → 422 INVALID_DATE / INVALID_RANGE
Out of scope:
  - 캘린더 캐싱 / WS 푸시 (별도)
Coverage target: ≥ 90% lines for apps/team/views.calendar_matrix
"""
from __future__ import annotations

from datetime import date, timedelta

import pytest
from django.utils import timezone as django_tz

from apps.attendance.models import AttendanceRecord
from apps.leave.models import LeaveRequest
from tests.factories import (
    AttendanceRecordFactory,
    DepartmentFactory,
    MembershipFactory,
)

pytestmark = pytest.mark.django_db


def _make_member(company, dept, name) -> object:
    user_kwargs = {"name": name}
    return MembershipFactory(
        company=company,
        department=dept,
        user__name=name,
    ) if False else MembershipFactory(
        company=company,
        department=dept,
    )


def test_matrix_5_members_7_days_status_mapping(client_auth):
    """5 members × 7 days; status 매핑이 정확해야 한다."""
    client, me = client_auth(role="MANAGER")
    company = me.company
    dept = DepartmentFactory(company=company, name="개발")

    # 5 members (incl. caller)
    members = [me]
    for _ in range(4):
        members.append(MembershipFactory(company=company, department=dept))

    today = django_tz.localdate()
    start = today - timedelta(days=6)
    end = today

    # member[0]: clocked in today office
    AttendanceRecordFactory(
        membership=members[0], company=company,
        work_date=today,
        clock_in_at=django_tz.now(),
        clock_in_kind=AttendanceRecord.Kind.OFFICE,
        status=AttendanceRecord.Status.WORKING,
    )
    # member[1]: WFH today
    AttendanceRecordFactory(
        membership=members[1], company=company,
        work_date=today,
        clock_in_at=django_tz.now(),
        clock_in_kind=AttendanceRecord.Kind.WFH,
        status=AttendanceRecord.Status.WORKING,
    )
    # member[2]: ON_BREAK today
    AttendanceRecordFactory(
        membership=members[2], company=company,
        work_date=today,
        clock_in_at=django_tz.now(),
        clock_in_kind=AttendanceRecord.Kind.OFFICE,
        status=AttendanceRecord.Status.ON_BREAK,
    )
    # member[3]: leave today (approved)
    LeaveRequest.objects.create(
        company=company,
        membership=members[3],
        kind=LeaveRequest.Kind.FULL,
        start_date=today,
        end_date=today,
        days="1.00",
        status=LeaveRequest.Status.APPROVED,
    )
    # member[4]: nothing -> off

    r = client.get(
        f"/v1/team/calendar/matrix?from={start.isoformat()}&to={end.isoformat()}"
    )
    assert r.status_code == 200, r.content
    payload = r.json()["data"]
    assert payload["from"] == start.isoformat()
    assert payload["to"] == end.isoformat()
    rows = payload["rows"]
    assert len(rows) == 5

    # build helper: lookup by membership_id
    by_id = {row["membership_id"]: row for row in rows}
    today_iso = today.isoformat()

    def status_today(membership):
        days = by_id[str(membership.id)]["days"]
        cell = next(d for d in days if d["date"] == today_iso)
        return cell["status"]

    assert status_today(members[0]) == "office"
    assert status_today(members[1]) == "wfh"
    assert status_today(members[2]) == "break"
    assert status_today(members[3]) == "leave"
    assert status_today(members[4]) == "off"

    # 7-day window dense
    for row in rows:
        assert len(row["days"]) == 7


def test_matrix_group_by_team_groups_rows(client_auth):
    """group_by=team이면 부서별로 묶인다."""
    client, me = client_auth(role="MANAGER")
    company = me.company
    dept_a = DepartmentFactory(company=company, name="엔지니어링")
    dept_b = DepartmentFactory(company=company, name="디자인")
    MembershipFactory(company=company, department=dept_a)
    MembershipFactory(company=company, department=dept_a)
    MembershipFactory(company=company, department=dept_b)

    today = django_tz.localdate()
    start = today - timedelta(days=2)
    end = today
    r = client.get(
        f"/v1/team/calendar/matrix?from={start.isoformat()}"
        f"&to={end.isoformat()}&group_by=team"
    )
    assert r.status_code == 200
    payload = r.json()["data"]
    assert "groups" in payload
    departments = {g["department"] for g in payload["groups"]}
    assert "엔지니어링" in departments
    assert "디자인" in departments


def test_matrix_invalid_date_param_returns_422(client_auth):
    """잘못된 날짜 파라미터는 422."""
    client, _m = client_auth()
    r = client.get("/v1/team/calendar/matrix?from=oops&to=2026-05-04")
    assert r.status_code == 422


def test_matrix_to_before_from_returns_422(client_auth):
    """to < from 이면 422 INVALID_RANGE."""
    client, _m = client_auth()
    r = client.get("/v1/team/calendar/matrix?from=2026-05-10&to=2026-05-01")
    assert r.status_code == 422
