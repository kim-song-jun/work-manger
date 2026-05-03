"""
Test: identity · seed_demo management command
Type: Integration (real Postgres; runs the actual command)
Why:  데모 시드는 신규 입사자 / QA / 영업 데모에서 매번 사용. 깨지면 데모가 멈추고
      재현 가능한 상태가 사라진다. 행 수 + 멱등성을 회귀 보호.
Covers:
  - call_command("seed_demo") — 기본 옵션으로 1회 실행 후 행 수 검증
  - 회사 / 부서 / 멤버십 / 출퇴근 / 휴가 / 초과근무 카운트
  - 두 번째 실행도 동일 결과 (멱등 — 데모 회사 wipe 후 재시드)
Out of scope:
  - 정확한 분포 (랜덤 jitter) — count 만 확인
Coverage target: ≥ 80% for seed_demo.py (기본 옵션 경로)
"""
from __future__ import annotations

import pytest
from django.core.management import call_command

from apps.attendance.models import AttendanceRecord, OvertimeRequest, WorkSchedule
from apps.identity.models import Company, Department, Membership
from apps.leave.models import LeaveRequest

pytestmark = pytest.mark.django_db


DEMO_CODE = "ACMEDM"


def _counts():
    company = Company.objects.get(code=DEMO_CODE)
    return {
        "memberships": Membership.objects.filter(company=company).count(),
        "departments": Department.objects.filter(company=company).count(),
        "schedules": WorkSchedule.objects.filter(membership__company=company).count(),
        "leave_requests": LeaveRequest.objects.filter(company=company).count(),
        "overtime_requests": OvertimeRequest.objects.filter(company=company).count(),
        "attendance_rows": AttendanceRecord.objects.filter(company=company).count(),
    }


def test_seed_demo_creates_expected_rows():
    # Arrange — clean DB
    assert Company.objects.filter(code=DEMO_CODE).count() == 0

    # Act
    call_command("seed_demo")

    # Assert
    assert Company.objects.filter(code=DEMO_CODE).count() == 1
    counts = _counts()
    assert counts["departments"] == 4
    assert counts["memberships"] == 29  # 1 OWNER + 1 ADMIN + 2 MGRs + 25 employees
    assert counts["schedules"] == 29
    assert counts["leave_requests"] == 5 + 3
    assert counts["overtime_requests"] == 3
    assert counts["attendance_rows"] > 0  # depends on weekday distribution + RNG


def test_seed_demo_is_idempotent_on_second_run():
    # Arrange
    call_command("seed_demo")
    first = _counts()

    # Act — second call should wipe + re-seed.
    call_command("seed_demo")
    second = _counts()

    # Assert — counts equal, exactly one demo company in DB.
    assert Company.objects.filter(code=DEMO_CODE).count() == 1
    assert first == second
