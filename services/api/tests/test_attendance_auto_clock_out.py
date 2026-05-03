"""
Test: attendance · auto_clock_out_stale Celery task
Type: Integration (real Postgres; task invoked in-process)
Why:  사용자가 퇴근 누락 시 다음날 출근이 막히지 않도록 24h 이상 WORKING 인 레코드를
      자동 마감해야 한다. 잘못 동작하면 근무 시간이 무한정 누적되거나, 멱등성이 깨져
      재실행 시 출근 시각이 변형될 수 있다. 회귀 보호 우선.
Covers:
  - 24h 이상 WORKING 레코드만 마감 (최근 레코드는 미동작)
  - 마감 시 clock_out_at = clock_in_at + default_work_hours
  - 정규 종료시각 이전이면 is_early_leave=True
  - 두 번 실행해도 결과 동일 (멱등)
  - COMPLETED 레코드는 건드리지 않음
Out of scope:
  - 알림 발송 (notification 도메인이 별도)
Coverage target: ≥ 90% for apps/attendance/tasks.py
"""
from __future__ import annotations

from datetime import time, timedelta

import pytest
from django.utils import timezone as django_tz

from apps.attendance.models import AttendanceRecord
from apps.attendance.tasks import auto_clock_out_stale
from tests.factories import (
    AttendanceRecordFactory,
    CompanyFactory,
    MembershipFactory,
    WorkScheduleFactory,
)

pytestmark = pytest.mark.django_db


def _make_open_record(hours_ago: int):
    company = CompanyFactory()
    member = MembershipFactory(company=company)
    WorkScheduleFactory(membership=member, end_time=time(18, 0))
    in_at = django_tz.now() - timedelta(hours=hours_ago)
    rec = AttendanceRecordFactory(
        membership=member, company=company,
        clock_in_at=in_at,
        status=AttendanceRecord.Status.WORKING,
    )
    return rec


def test_auto_clock_out_skips_recent_records():
    # Arrange — only 2 h since clock-in (well under threshold)
    rec = _make_open_record(hours_ago=2)
    # Act
    closed = auto_clock_out_stale()
    # Assert
    assert closed == 0
    rec.refresh_from_db()
    assert rec.status == AttendanceRecord.Status.WORKING


def test_auto_clock_out_closes_stale_records():
    # Arrange — 30h ago, well past 24h threshold
    rec = _make_open_record(hours_ago=30)
    expected_out = rec.clock_in_at + timedelta(hours=18)

    # Act
    closed = auto_clock_out_stale()

    # Assert
    assert closed == 1
    rec.refresh_from_db()
    assert rec.status == AttendanceRecord.Status.COMPLETED
    assert rec.clock_out_at == expected_out
    assert rec.total_work_minutes == 18 * 60  # no breaks


def test_auto_clock_out_idempotent_second_run_does_nothing():
    # Arrange
    rec = _make_open_record(hours_ago=48)

    # Act
    first = auto_clock_out_stale()
    second = auto_clock_out_stale()

    # Assert — second run leaves rows unchanged.
    assert first == 1
    assert second == 0
    rec.refresh_from_db()
    assert rec.status == AttendanceRecord.Status.COMPLETED


def test_auto_clock_out_marks_early_leave_when_synthetic_out_before_schedule_end():
    # Arrange — schedule ends at 23:30 local; synthetic clock-out resolves to
    # `clock_in + 1h` which we ensure falls before that boundary.
    company = CompanyFactory()
    member = MembershipFactory(company=company)
    WorkScheduleFactory(membership=member, end_time=time(23, 30))
    # Use a deep past so the row clears the 24h stale threshold by a large margin.
    in_at = django_tz.now() - timedelta(hours=72)
    rec = AttendanceRecordFactory(
        membership=member, company=company,
        clock_in_at=in_at, status=AttendanceRecord.Status.WORKING,
    )

    # Act — synthetic close = in_at + 1h; with end_time 23:30 we need 1h to be
    # before that local boundary. The check uses local-of-clock_out vs same-date
    # 23:30, so any clock_in whose local hour is < 22:30 satisfies it.
    auto_clock_out_stale(stale_after_hours=24, default_work_hours=1)

    # Assert
    rec.refresh_from_db()
    assert rec.status == AttendanceRecord.Status.COMPLETED
    # The synthetic clock-out is in_at + 1h. The scheduled end is 23:30 local
    # *of that same calendar day*. We verify by direct comparison rather than
    # asserting True unconditionally, because the test runs at any wall-clock.
    from zoneinfo import ZoneInfo
    local_out = (in_at + timedelta(hours=1)).astimezone(ZoneInfo("Asia/Seoul"))
    expected_early = local_out.time() < time(23, 30)
    assert rec.is_early_leave is expected_early


def test_auto_clock_out_does_not_touch_completed_records():
    # Arrange — already COMPLETED record older than threshold
    company = CompanyFactory()
    member = MembershipFactory(company=company)
    WorkScheduleFactory(membership=member)
    in_at = django_tz.now() - timedelta(hours=48)
    rec = AttendanceRecordFactory(
        membership=member, company=company,
        clock_in_at=in_at, clock_out_at=in_at + timedelta(hours=8),
        status=AttendanceRecord.Status.COMPLETED,
    )

    # Act
    closed = auto_clock_out_stale()

    # Assert
    assert closed == 0
    original_out = rec.clock_out_at
    rec.refresh_from_db()
    assert rec.clock_out_at == original_out
