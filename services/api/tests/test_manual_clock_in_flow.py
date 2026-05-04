"""
Test: 수동 출근 플로우 (manual clock-in approval -> AttendanceRecord)
Type: Integration (real Postgres, APIClient, Celery eager via test settings)
Why:  feature-spec §3.4 — 위치 검증이 실패한 사용자가 수동 출근을 요청하면
      관리자가 승인했을 때 실제 AttendanceRecord 가 만들어져야 한다.
      이전 구현은 ApprovalTask 만 만들고 record 를 만들지 않아 사용자에게
      "승인됐는데 출근 기록이 없다" 는 신뢰 균열이 생겼다.
Covers:
  - POST /v1/attendance/manual-request 가 ManualClockInRequest + ApprovalTask 동시 생성
  - 승인 시 apps.attendance.services.materialize_manual_clock_in 가 record 생성
  - 멱등성: 중복 materialize 호출은 동일 record 반환
  - 반려 시 record 미생성 + ManualClockInRequest.status=REJECTED
  - notification.dispatch 가 알림 로그 행을 남김 (event_kind=MANUAL_CLOCK_IN_DECISION)
Out of scope:
  - WebSocket 브로드캐스트 (best-effort, test_realtime.py 에서 다룸)
  - 알림 채널별 발송 (test_notification_providers.py)
Coverage target: ≥ 90% lines for materialize_manual_clock_in + approval._apply_decision MANUAL branch
"""
from __future__ import annotations

from datetime import date

import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.approval.models import ApprovalTask
from apps.attendance.models import AttendanceRecord, ManualClockInRequest
from apps.attendance import services as att_services
from apps.notification.models import NotificationLog

from tests.factories import (
    CompanyFactory,
    MembershipFactory,
    UserFactory,
    WorkScheduleFactory,
)

pytestmark = pytest.mark.django_db


# ---------- Fixtures ----------

@pytest.fixture
def company():
    return CompanyFactory()


@pytest.fixture
def employee(company):
    user = UserFactory()
    m = MembershipFactory(company=company, user=user)
    WorkScheduleFactory(membership=m)
    return m


@pytest.fixture
def approver(company, employee):
    """An ADMIN in the same company; wired as the employee's manager so
    the `_pick_approver` helper picks them deterministically."""
    user = UserFactory()
    admin = MembershipFactory(
        company=company, user=user, role="ADMIN"
    )
    employee.manager = admin
    employee.save(update_fields=["manager"])
    return admin


def _client_for(user) -> APIClient:
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return client


# ---------- Submission ----------

def test_submit_manual_request_creates_request_and_task(employee, approver):
    """수동 출근 신청은 ManualClockInRequest + ApprovalTask 두 행을 동시에 만든다.

    이유: 승인 단계에서 원본 페이로드(work_date/reason)를 재생할 수 있어야
    실제 AttendanceRecord 를 정확하게 만들 수 있다.
    """
    # Arrange
    client = _client_for(employee.user)

    # Act
    r = client.post(
        "/v1/attendance/manual-request",
        {"reason": "GPS 차단된 외근지", "work_date": "2026-05-04"},
        format="json",
    )

    # Assert
    assert r.status_code == 201, r.content
    body = r.json()["data"]
    assert body["approval_task_id"]
    assert body["manual_request_id"]

    mcir = ManualClockInRequest.objects.get(id=body["manual_request_id"])
    assert mcir.status == ManualClockInRequest.Status.PENDING
    assert mcir.work_date == date(2026, 5, 4)
    assert mcir.membership_id == employee.id

    task = ApprovalTask.objects.get(id=body["approval_task_id"])
    assert task.target_type == ApprovalTask.TargetType.MANUAL_CLOCK_IN
    assert task.target_id == mcir.id
    assert task.status == ApprovalTask.Status.PENDING
    assert task.approver_id == approver.id


# ---------- Approval materializes a record ----------

def test_approve_materializes_attendance_record_and_notifies(employee, approver):
    """승인 시 (membership, work_date) 에 대한 AttendanceRecord 가 생기고
    신청자에게 MANUAL_CLOCK_IN_DECISION 알림이 발송된다.
    """
    # Arrange
    employee_client = _client_for(employee.user)
    submit = employee_client.post(
        "/v1/attendance/manual-request",
        {"reason": "출장", "work_date": "2026-05-04"},
        format="json",
    )
    task_id = submit.json()["data"]["approval_task_id"]

    approver_client = _client_for(approver.user)

    # Act
    decision = approver_client.post(
        f"/v1/inbox/{task_id}/approve",
        {"reason": "확인됨"},
        format="json",
    )

    # Assert
    assert decision.status_code == 200, decision.content
    rec = AttendanceRecord.objects.get(
        membership=employee, work_date=date(2026, 5, 4)
    )
    assert rec.status == AttendanceRecord.Status.WORKING
    assert rec.clock_in_kind == AttendanceRecord.Kind.MANUAL
    assert rec.clock_in_at is not None

    mcir = ManualClockInRequest.objects.get(
        membership=employee, work_date=date(2026, 5, 4)
    )
    assert mcir.status == ManualClockInRequest.Status.APPROVED
    assert mcir.decided_by_id == approver.id

    log = NotificationLog.objects.filter(
        membership=employee, event_kind="MANUAL_CLOCK_IN_DECISION"
    ).first()
    assert log is not None
    assert log.payload_json.get("decision") == "APPROVE"


# ---------- Idempotency ----------

def test_materialize_is_idempotent(employee, approver):
    """동일 (membership, work_date) 에 두 번 materialize 호출해도 record 는 한 개.

    이유: 승인 중복 호출 / 워커 재시도 시 record 가 두 개 만들어지면
    근태 통계가 두 배로 부풀려진다.
    """
    # Arrange
    work_date = date(2026, 5, 4)
    rec1 = att_services.materialize_manual_clock_in(
        membership=employee,
        work_date=work_date,
        kind=AttendanceRecord.Kind.MANUAL,
        reason="첫 호출",
        approver=approver,
    )

    # Act
    rec2 = att_services.materialize_manual_clock_in(
        membership=employee,
        work_date=work_date,
        kind=AttendanceRecord.Kind.MANUAL,
        reason="두 번째 호출",
        approver=approver,
    )

    # Assert
    assert rec1.id == rec2.id
    assert (
        AttendanceRecord.objects.filter(
            membership=employee, work_date=work_date
        ).count()
        == 1
    )


# ---------- Reject ----------

def test_reject_does_not_materialize_record(employee, approver):
    """반려 시 AttendanceRecord 는 생성되지 않고 ManualClockInRequest 만 REJECTED 로 전환."""
    # Arrange
    employee_client = _client_for(employee.user)
    submit = employee_client.post(
        "/v1/attendance/manual-request",
        {"reason": "사유 부족", "work_date": "2026-05-04"},
        format="json",
    )
    task_id = submit.json()["data"]["approval_task_id"]
    approver_client = _client_for(approver.user)

    # Act
    decision = approver_client.post(
        f"/v1/inbox/{task_id}/reject",
        {"reason": "근거 자료 없음"},
        format="json",
    )

    # Assert
    assert decision.status_code == 200, decision.content
    assert not AttendanceRecord.objects.filter(
        membership=employee, work_date=date(2026, 5, 4)
    ).exists()
    mcir = ManualClockInRequest.objects.get(
        membership=employee, work_date=date(2026, 5, 4)
    )
    assert mcir.status == ManualClockInRequest.Status.REJECTED
    log = NotificationLog.objects.filter(
        membership=employee, event_kind="MANUAL_CLOCK_IN_DECISION"
    ).first()
    assert log is not None
    assert log.payload_json.get("decision") == "REJECT"
    assert log.payload_json.get("record_id") is None
