"""
Test: attendance · ClockOutBuilder + Service composition
Type: Unit (Builder pure logic) + Integration (Service writes via real Postgres)
Why:  퇴근은 출근과 함께 사용자가 가장 많이 쓰는 단일 액션. Builder 가
      "휴게 누적 / 조기 퇴근 / 열린 휴게 자동 종료" 룰을 한곳에서 책임지면
      Service / Auto-batch 어떤 진입점이든 동일 결과를 보장한다.
Covers:
  - ClockOutBuilder.build() — 정상 퇴근 경로 (총근무분 = 스팬 - 휴게)
  - 열린 휴게(open break) 가 자동으로 퇴근 시각으로 닫혀 누적에 반영
  - 스케줄 종료시각 이전 퇴근 시 is_early_leave=True
  - clock_out 이 clock_in 보다 빠를 때 InvalidClockOutPayload
  - 이미 COMPLETED 인 레코드에 대한 호출 InvalidClockOutPayload
  - clock_in_at None 일 때 NoOpenAttendance
  - Service.clock_out() 가 Builder 결과를 DB 에 정확히 반영
Out of scope:
  - HTTP 응답 직렬화 (test_attendance.py 가 다룸)
Coverage target: ≥ 95% for new ClockOutBuilder branches.
"""
from __future__ import annotations

from datetime import datetime, time, timedelta

import pytest
from django.utils import timezone as django_tz

from apps.attendance.builders import (
    BreakSpan,
    ClockOutBuilder,
    InvalidClockOutPayload,
    NoOpenAttendance,
)
from apps.attendance.models import AttendanceRecord, BreakRecord
from apps.attendance.services import clock_out as svc_clock_out
from tests.factories import (
    AttendanceRecordFactory,
    CompanyFactory,
    LocationFactory,
    MembershipFactory,
    WorkScheduleFactory,
)

pytestmark = pytest.mark.django_db


# ----------------------------------------------------------------------
# Builder unit tests
# ----------------------------------------------------------------------


def test_clock_out_builder_happy_path_computes_minutes():
    # Arrange
    m = MembershipFactory()
    tz = django_tz.get_current_timezone()
    in_at = django_tz.make_aware(datetime(2026, 5, 4, 9, 0), tz)
    out_at = django_tz.make_aware(datetime(2026, 5, 4, 18, 0), tz)
    breaks = [BreakSpan(in_at + timedelta(hours=4), in_at + timedelta(hours=4, minutes=45))]

    # Act
    plan = (
        ClockOutBuilder(m)
        .with_open_record(in_at, AttendanceRecord.Status.WORKING)
        .with_breaks(breaks)
        .with_schedule(time(18, 0))
        .at(out_at)
        .build()
    )

    # Assert
    assert plan.total_break_minutes == 45
    assert plan.total_work_minutes == 9 * 60 - 45
    assert plan.is_early_leave is False
    assert plan.open_break_to_close is None


def test_clock_out_builder_open_break_auto_closes_at_clock_out():
    # Arrange — break open with no ended_at
    m = MembershipFactory()
    tz = django_tz.get_current_timezone()
    in_at = django_tz.make_aware(datetime(2026, 5, 4, 9, 0), tz)
    out_at = django_tz.make_aware(datetime(2026, 5, 4, 17, 30), tz)
    open_br = BreakSpan(in_at + timedelta(hours=4), None)

    # Act
    plan = (
        ClockOutBuilder(m)
        .with_open_record(in_at, AttendanceRecord.Status.ON_BREAK)
        .with_breaks([open_br])
        .with_schedule(time(18, 0))
        .at(out_at)
        .build()
    )

    # Assert — open break is closed at clock_out, contributes 4h30m to break total.
    expected_break = (out_at - open_br.started_at).total_seconds() // 60
    assert plan.total_break_minutes == int(expected_break)
    assert plan.open_break_to_close is open_br
    assert plan.is_early_leave is True  # 17:30 < 18:00


def test_clock_out_builder_raises_when_no_open_record():
    # Arrange
    m = MembershipFactory()
    builder = ClockOutBuilder(m)  # no with_open_record call
    # Act / Assert
    with pytest.raises(NoOpenAttendance):
        builder.build()


def test_clock_out_builder_rejects_already_completed():
    m = MembershipFactory()
    in_at = django_tz.now() - timedelta(hours=4)
    with pytest.raises(InvalidClockOutPayload):
        (
            ClockOutBuilder(m)
            .with_open_record(in_at, AttendanceRecord.Status.COMPLETED)
            .build()
        )


def test_clock_out_builder_rejects_out_before_in():
    m = MembershipFactory()
    in_at = django_tz.now()
    out_at = in_at - timedelta(minutes=5)
    with pytest.raises(InvalidClockOutPayload):
        (
            ClockOutBuilder(m)
            .with_open_record(in_at, AttendanceRecord.Status.WORKING)
            .at(out_at)
            .build()
        )


def test_clock_out_builder_no_schedule_no_early_leave():
    m = MembershipFactory()
    in_at = django_tz.now() - timedelta(hours=2)
    plan = (
        ClockOutBuilder(m)
        .with_open_record(in_at, AttendanceRecord.Status.WORKING)
        .build()
    )
    assert plan.is_early_leave is False


# ----------------------------------------------------------------------
# Service integration: clock_out persists builder output
# ----------------------------------------------------------------------


def test_service_clock_out_persists_builder_output():
    # Arrange — open record + closed break in DB
    company = CompanyFactory()
    LocationFactory(company=company)
    member = MembershipFactory(company=company)
    WorkScheduleFactory(membership=member)
    in_at = django_tz.now() - timedelta(hours=8)
    rec = AttendanceRecordFactory(
        membership=member, company=company,
        clock_in_at=in_at, status=AttendanceRecord.Status.WORKING,
    )
    BreakRecord.objects.create(
        attendance_record=rec,
        started_at=in_at + timedelta(hours=4),
        ended_at=in_at + timedelta(hours=4, minutes=30),
    )

    # Act
    out = svc_clock_out(membership=member, company=company)

    # Assert — DB row reflects builder math (≈ 8*60 − 30 = 450).
    out.refresh_from_db()
    assert out.status == AttendanceRecord.Status.COMPLETED
    assert 448 <= out.total_work_minutes <= 452
    assert out.total_break_minutes == 30
    assert out.clock_out_at is not None


def test_service_clock_out_closes_open_break():
    # Arrange — open break that should close on clock-out
    company = CompanyFactory()
    member = MembershipFactory(company=company)
    WorkScheduleFactory(membership=member)
    in_at = django_tz.now() - timedelta(hours=5)
    rec = AttendanceRecordFactory(
        membership=member, company=company,
        clock_in_at=in_at, status=AttendanceRecord.Status.ON_BREAK,
    )
    open_br = BreakRecord.objects.create(
        attendance_record=rec,
        started_at=in_at + timedelta(hours=4),
        ended_at=None,
    )

    # Act
    svc_clock_out(membership=member, company=company)

    # Assert — open break gets ended_at populated, status COMPLETED.
    open_br.refresh_from_db()
    assert open_br.ended_at is not None
    rec.refresh_from_db()
    assert rec.status == AttendanceRecord.Status.COMPLETED
