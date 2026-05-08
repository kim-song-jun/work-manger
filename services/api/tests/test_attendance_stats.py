"""Tests for /v1/attendance/stats/* endpoints (F-EMPLOYEE-012).

Covers:
- empty week (no records) returns zeros
- partial week (one in-progress + one completed) sums correctly
- overtime calculation (worked > regular_minutes per day)
- ISO week boundary (records outside the current ISO week are excluded)
- /stats/today flat shape (clocked in, completed, never clocked in)
- auth required (401 when no token)

NB: We intentionally avoid ``freeze_time`` here — SimpleJWT validates
``iat`` against ``django_tz.now()`` and frozen wall clocks make every
token look expired. Instead we compute "this week" dynamically and seed
records relative to ``django_tz.localdate()`` so the assertions remain
stable across calendar dates.
"""
from __future__ import annotations

from datetime import date, timedelta
from zoneinfo import ZoneInfo

import pytest
from django.utils import timezone as django_tz
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.attendance.models import AttendanceRecord
from tests.factories import (
    AttendanceRecordFactory,
    CompanyFactory,
    MembershipFactory,
    UserFactory,
    WorkScheduleFactory,
)

pytestmark = pytest.mark.django_db


@pytest.fixture
def client():
    return APIClient()


def _auth(client, user):
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return client


@pytest.fixture
def company():
    return CompanyFactory(timezone="Asia/Seoul")


@pytest.fixture
def member(company):
    user = UserFactory()
    m = MembershipFactory(company=company, user=user)
    WorkScheduleFactory(membership=m)  # 09-18, 60min break => 480 regular min/day
    return m


@pytest.fixture
def auth_client(client, member):
    return _auth(client, member.user)


def _local_today(company) -> date:
    return django_tz.now().astimezone(ZoneInfo(company.timezone)).date()


def _week_bounds(local_today: date) -> tuple[date, date]:
    monday = local_today - timedelta(days=local_today.weekday())
    return monday, monday + timedelta(days=6)


# ---------- /stats/weekly ----------


def test_weekly_stats_empty_week_returns_zeros(auth_client, member):
    r = auth_client.get("/v1/attendance/stats/weekly")
    assert r.status_code == 200, r.content
    data = r.json()["data"]
    week_start, week_end = _week_bounds(_local_today(member.company))
    assert data["week_start"] == week_start.isoformat()
    assert data["week_end"] == week_end.isoformat()
    assert data["regular_minutes"] == 0
    assert data["overtime_minutes"] == 0
    assert data["break_minutes"] == 0
    assert data["days_worked"] == 0


def test_weekly_stats_partial_week_sums(auth_client, member):
    week_start, _ = _week_bounds(_local_today(member.company))
    # Mon: completed 7h, no overtime
    AttendanceRecordFactory(
        membership=member,
        company=member.company,
        work_date=week_start,
        clock_in_at=django_tz.now() - timedelta(days=2, hours=8),
        clock_out_at=django_tz.now() - timedelta(days=2),
        total_break_minutes=60,
        total_work_minutes=420,  # 7h
        status=AttendanceRecord.Status.COMPLETED,
    )
    # Tue: completed exactly 8h regular
    AttendanceRecordFactory(
        membership=member,
        company=member.company,
        work_date=week_start + timedelta(days=1),
        clock_in_at=django_tz.now() - timedelta(days=1, hours=9),
        clock_out_at=django_tz.now() - timedelta(days=1),
        total_break_minutes=60,
        total_work_minutes=480,
        status=AttendanceRecord.Status.COMPLETED,
    )
    r = auth_client.get("/v1/attendance/stats/weekly")
    assert r.status_code == 200, r.content
    data = r.json()["data"]
    assert data["days_worked"] == 2
    # 420 + 480 = 900, both <= 480/day cap so no overtime
    assert data["regular_minutes"] == 900
    assert data["overtime_minutes"] == 0
    assert data["break_minutes"] == 120


def test_weekly_stats_overtime_computed(auth_client, member):
    week_start, _ = _week_bounds(_local_today(member.company))
    # Worked 10h => 8h regular + 2h overtime
    AttendanceRecordFactory(
        membership=member,
        company=member.company,
        work_date=week_start + timedelta(days=2),
        clock_in_at=django_tz.now() - timedelta(hours=11),
        clock_out_at=django_tz.now(),
        total_break_minutes=60,
        total_work_minutes=600,  # 10h
        status=AttendanceRecord.Status.COMPLETED,
    )
    r = auth_client.get("/v1/attendance/stats/weekly")
    data = r.json()["data"]
    assert data["regular_minutes"] == 480  # capped per scheduled day
    assert data["overtime_minutes"] == 120
    assert data["days_worked"] == 1


def test_weekly_stats_excludes_records_outside_week(auth_client, member):
    week_start, _ = _week_bounds(_local_today(member.company))
    prev_sun = week_start - timedelta(days=1)
    next_mon = week_start + timedelta(days=7)

    # Records outside the current ISO week — must be excluded
    AttendanceRecordFactory(
        membership=member,
        company=member.company,
        work_date=prev_sun,
        clock_in_at=django_tz.now() - timedelta(days=2, hours=9),
        clock_out_at=django_tz.now() - timedelta(days=2),
        total_break_minutes=60,
        total_work_minutes=480,
        status=AttendanceRecord.Status.COMPLETED,
    )
    AttendanceRecordFactory(
        membership=member,
        company=member.company,
        work_date=next_mon,
        clock_in_at=django_tz.now() - timedelta(days=1, hours=9),
        clock_out_at=django_tz.now() - timedelta(days=1),
        total_break_minutes=60,
        total_work_minutes=480,
        status=AttendanceRecord.Status.COMPLETED,
    )
    # In-week record to confirm aggregation runs
    AttendanceRecordFactory(
        membership=member,
        company=member.company,
        work_date=week_start + timedelta(days=2),
        clock_in_at=django_tz.now() - timedelta(hours=9),
        clock_out_at=django_tz.now(),
        total_break_minutes=60,
        total_work_minutes=480,
        status=AttendanceRecord.Status.COMPLETED,
    )
    r = auth_client.get("/v1/attendance/stats/weekly")
    data = r.json()["data"]
    assert data["days_worked"] == 1
    assert data["regular_minutes"] == 480
    assert data["overtime_minutes"] == 0


# ---------- /stats/today ----------


def test_today_stats_no_record_returns_flat_zeros(auth_client):
    r = auth_client.get("/v1/attendance/stats/today")
    assert r.status_code == 200, r.content
    data = r.json()["data"]
    assert data["clock_in_at"] is None
    assert data["clock_out_at"] is None
    assert data["work_minutes"] == 0
    assert data["break_minutes"] == 0
    assert data["is_clocked_in"] is False


def test_today_stats_in_progress_uses_live_minutes(auth_client, member):
    AttendanceRecordFactory(
        membership=member,
        company=member.company,
        work_date=_local_today(member.company),
        clock_in_at=django_tz.now() - timedelta(minutes=90),
        status=AttendanceRecord.Status.WORKING,
    )
    r = auth_client.get("/v1/attendance/stats/today")
    assert r.status_code == 200, r.content
    data = r.json()["data"]
    assert data["is_clocked_in"] is True
    assert data["clock_out_at"] is None
    assert 88 <= data["work_minutes"] <= 92  # ~90 ±2 for clock skew
    assert data["clock_in_at"] is not None


def test_today_stats_completed_uses_persisted_total(auth_client, member):
    AttendanceRecordFactory(
        membership=member,
        company=member.company,
        work_date=_local_today(member.company),
        clock_in_at=django_tz.now() - timedelta(hours=8),
        clock_out_at=django_tz.now(),
        total_break_minutes=60,
        total_work_minutes=420,
        status=AttendanceRecord.Status.COMPLETED,
    )
    r = auth_client.get("/v1/attendance/stats/today")
    data = r.json()["data"]
    assert data["is_clocked_in"] is False
    assert data["work_minutes"] == 420
    assert data["break_minutes"] == 60
    assert data["clock_out_at"] is not None


# ---------- Auth ----------


def test_weekly_stats_requires_authentication(client):
    r = client.get("/v1/attendance/stats/weekly")
    assert r.status_code == 401


def test_today_stats_requires_authentication(client):
    r = client.get("/v1/attendance/stats/today")
    assert r.status_code == 401
