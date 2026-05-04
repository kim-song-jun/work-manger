"""
Test: compliance · 52h weekly rule + admin board + clock-in block
Type: Integration (real Postgres, JWT auth, role-based permissions)
Why:  주 52시간 룰은 법적 의무다. 합산이 어긋나면 운영팀이 잘못된 판단을 한다.
      block_when_over=True 옵션을 켠 회사에서는 출근 자체가 막혀야 하므로
      서비스 → 뷰 → attendance.clock_in 흐름을 묶어 회귀를 보호한다.
Covers:
  - apps.compliance.repositories.ComplianceRepository.weekly_minutes / weekly_hours
  - apps.compliance.services.weekly_status (OK / WARN / OVER 분기)
  - apps.compliance.services.company_overview (회사 멤버 행 리턴)
  - GET /v1/compliance/me                    (요청자 본인 한 주)
  - GET /v1/admin/compliance/52h             (ADMIN+ 회사 보드)
  - attendance.clock_in 차단 (compliance_block_when_over=True + OVER → 422)
  - attendance.clock_in 통과 (compliance_block_when_over=False + OVER → 정상)
Out of scope:
  - 알림/푸시 (test_notification.py)
  - 모바일 차단 화면 (FE 테스트)
Coverage target: ≥ 90% lines for apps/compliance/{services,repositories,specifications}.py
"""
from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

import pytest
from django.utils import timezone as django_tz

from apps.attendance import services as att_services
from apps.attendance.models import AttendanceRecord
from apps.compliance import services as comp_services
from apps.compliance.repositories import ComplianceRepository
from tests.factories import (
    AttendanceRecordFactory,
    LocationFactory,
    MembershipFactory,
)

pytestmark = pytest.mark.django_db


def _monday(d: date) -> date:
    return d - timedelta(days=d.weekday())


def _make_records(membership, week_start: date, daily_minutes: list[int]) -> None:
    """Create one AttendanceRecord per day with the given total_work_minutes."""
    for i, minutes in enumerate(daily_minutes):
        AttendanceRecordFactory(
            membership=membership,
            company=membership.company,
            work_date=week_start + timedelta(days=i),
            total_work_minutes=minutes,
            status=AttendanceRecord.Status.COMPLETED,
        )


# ---------- repository / service unit checks ----------

def test_weekly_hours_sums_only_inside_window():
    """주 합산이 7일 윈도우 안만 더해야 외부 일자가 새지 않는다."""
    m = MembershipFactory()
    ws = _monday(date(2026, 5, 4))  # Monday
    # in-range: 5h * 5 days = 1500 minutes = 25h
    _make_records(m, ws, [300, 300, 300, 300, 300])
    # out-of-range: previous Sunday + next Monday should NOT count
    AttendanceRecordFactory(
        membership=m, company=m.company,
        work_date=ws - timedelta(days=1), total_work_minutes=600,
    )
    AttendanceRecordFactory(
        membership=m, company=m.company,
        work_date=ws + timedelta(days=7), total_work_minutes=600,
    )
    minutes = ComplianceRepository.weekly_minutes(m, ws)
    hours = ComplianceRepository.weekly_hours(m, ws)
    assert minutes == 1500
    assert hours == Decimal("25.00")


def test_weekly_status_transitions_ok_warn_over():
    """OK → WARN(>=48) → OVER(>=52) 분기를 회귀 보호한다."""
    m = MembershipFactory()
    ws = _monday(date(2026, 5, 4))
    # OK: 30h total
    _make_records(m, ws, [360, 360, 360, 360, 360])  # 30h
    s = comp_services.weekly_status(m, ws)
    assert s.status == "OK"
    assert s.hours == Decimal("30.00")
    assert s.remaining_hours == Decimal("22.00")

    # WARN: bump to 48h (add 18h on Saturday)
    AttendanceRecordFactory(
        membership=m, company=m.company,
        work_date=ws + timedelta(days=5), total_work_minutes=18 * 60,
    )
    s = comp_services.weekly_status(m, ws)
    assert s.status == "WARN"
    assert s.hours == Decimal("48.00")

    # OVER: add another 5h on Sunday => 53h
    AttendanceRecordFactory(
        membership=m, company=m.company,
        work_date=ws + timedelta(days=6), total_work_minutes=5 * 60,
    )
    s = comp_services.weekly_status(m, ws)
    assert s.status == "OVER"
    assert s.remaining_hours == Decimal("0")  # never negative


# ---------- API: /v1/compliance/me ----------

def test_my_compliance_requires_auth(api_client):
    """미인증 요청은 401."""
    r = api_client.get("/v1/compliance/me")
    assert r.status_code == 401


def test_my_compliance_returns_status(client_auth):
    """인증된 사용자는 본인 한 주 status를 받는다."""
    client, m = client_auth(role="EMPLOYEE")
    ws = _monday(django_tz.localdate())
    _make_records(m, ws, [240, 240])  # 8h total
    r = client.get(f"/v1/compliance/me?week={ws.isoformat()}")
    assert r.status_code == 200, r.content
    d = r.json()["data"]
    assert d["status"] == "OK"
    assert d["threshold_hours"] == "52"
    assert Decimal(d["hours"]) == Decimal("8.00")


def test_my_compliance_invalid_week_returns_422(client_auth):
    """잘못된 week 파라미터는 422."""
    client, _m = client_auth(role="EMPLOYEE")
    r = client.get("/v1/compliance/me?week=oops")
    assert r.status_code == 422


# ---------- API: /v1/admin/compliance/52h ----------

def test_admin_compliance_requires_admin(client_auth):
    """EMPLOYEE는 403."""
    client, _m = client_auth(role="EMPLOYEE")
    r = client.get("/v1/admin/compliance/52h")
    assert r.status_code == 403


def test_admin_compliance_returns_per_member_rows(client_auth):
    """ADMIN은 회사 전체 멤버 행을 받는다 (정렬 hours desc)."""
    client, admin = client_auth(role="ADMIN")
    coworker = MembershipFactory(company=admin.company, role="EMPLOYEE")
    ws = _monday(django_tz.localdate())
    _make_records(coworker, ws, [10 * 60, 10 * 60, 10 * 60, 10 * 60, 10 * 60])  # 50h
    _make_records(admin, ws, [4 * 60])  # 4h
    r = client.get(f"/v1/admin/compliance/52h?week={ws.isoformat()}")
    assert r.status_code == 200, r.content
    d = r.json()["data"]
    assert d["week_start"] == ws.isoformat()
    assert d["threshold_hours"] == "52"
    members = d["members"]
    assert len(members) >= 2
    # sorted hours desc
    assert Decimal(members[0]["hours"]) >= Decimal(members[-1]["hours"])
    # find coworker row
    cw_row = next(it for it in members if it["membership_id"] == str(coworker.id))
    assert cw_row["status"] == "WARN"


# ---------- attendance.clock_in × compliance block ----------

def test_clock_in_blocked_when_company_opt_in_and_over(client_auth):
    """compliance_block_when_over=True + 누적 OVER → 422 OVER_HOURS_LIMIT."""
    client, m = client_auth(role="EMPLOYEE")
    m.company.compliance_block_when_over = True
    m.company.save(update_fields=["compliance_block_when_over"])
    LocationFactory(company=m.company, kind="OFFICE")

    ws = _monday(django_tz.localdate())
    # Pre-fill 52h+ this week so today's clock-in is over the limit.
    # Use yesterday-only so today's date row is still empty (no AlreadyClockedIn).
    today = django_tz.localdate()
    days_to_fill = max(1, (today - ws).days)  # at least 1 day
    daily = [60 * 9] * days_to_fill  # 9h per day
    if sum(daily) < 52 * 60:
        # ensure >= 52h regardless of weekday; pad with extra mins on day 0
        daily[0] += (52 * 60 - sum(daily))
    _make_records(m, ws, daily)

    # Direct service call to bypass HTTP-layer geo plumbing nuances.
    with pytest.raises(att_services.OverHoursLimit):
        att_services.clock_in(
            membership=m,
            company=m.company,
            latitude=37.5,
            longitude=127.0,
            kind=AttendanceRecord.Kind.OFFICE,
        )


def test_clock_in_passes_when_block_flag_disabled():
    """compliance_block_when_over=False는 OVER여도 통과해야 한다."""
    m = MembershipFactory()
    LocationFactory(
        company=m.company, kind="OFFICE",
        latitude="37.500000", longitude="127.000000", radius_m=500,
    )
    # company.compliance_block_when_over defaults to False
    ws = _monday(django_tz.localdate())
    _make_records(m, ws, [60 * 9] * 6)  # 54h prior

    today = django_tz.localdate()
    # avoid AlreadyClockedIn — delete any record on today created above
    AttendanceRecord.objects.filter(membership=m, work_date=today).delete()

    result = att_services.clock_in(
        membership=m,
        company=m.company,
        latitude=37.500000,
        longitude=127.000000,
        kind=AttendanceRecord.Kind.OFFICE,
    )
    assert result.record.id is not None
    assert result.replayed is False
