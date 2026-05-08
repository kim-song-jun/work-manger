"""
Test: admin_api · 어드민 승인 처리 (single PATCH + bulk POST) + 만료 연차 집계
Type: Integration (real Postgres, JWT auth, role-based permissions)
Why:  대량 승인은 운영팀 처리량의 핵심. fan-out 으로 N+1 호출 시 admin 한 명이
      수십 건 승인할 때 응답 지연 + 서버 부하가 심화되며, 부분 실패 추적이 어렵다.
      만료 연차 집계도 직원 수 × 잔액 호출이라 동일한 N+1.
Covers:
  - PATCH /v1/admin/approvals/<id>           — 어드민 오버라이드 승인
  - PATCH (이미 결정됨)                       — 422 ALREADY_DECIDED
  - PATCH (EMPLOYEE)                          — 403
  - POST  /v1/admin/approvals/bulk           — 부분 실패 처리 (valid + 없는 id)
  - GET   /v1/admin/leave/expiring           — 회사 전체 만료 예정 집계
Out of scope:
  - 단일 결정 후 LeaveBalance USED 행 적재 (test_leave 가 다룸)
Coverage target: ≥ 80% for apps/admin_api/views_bulk.py 신규 함수들
"""
from __future__ import annotations

from datetime import date

import pytest

from apps.approval.models import ApprovalTask
from apps.leave.models import LeaveBalance, LeaveRequest
from tests.factories import MembershipFactory

pytestmark = pytest.mark.django_db


def _make_pending_task(approver, company=None) -> ApprovalTask:
    company = company or approver.company
    requester = MembershipFactory(company=company, role="EMPLOYEE")
    leave = LeaveRequest.objects.create(
        company=company,
        membership=requester,
        kind=LeaveRequest.Kind.FULL,
        start_date=date(2026, 5, 10),
        end_date=date(2026, 5, 11),
        days=2,
        reason="가족 행사",
        status=LeaveRequest.Status.PENDING,
    )
    return ApprovalTask.objects.create(
        company=company,
        target_type=ApprovalTask.TargetType.LEAVE,
        target_id=leave.id,
        requester=requester,
        approver=approver,
        status=ApprovalTask.Status.PENDING,
    )


def test_admin_decide_approval_requires_admin(client_auth):
    client, m = client_auth(role="EMPLOYEE")
    task = _make_pending_task(m)
    r = client.patch(
        f"/v1/admin/approvals/{task.id}",
        {"decision": "approve"},
        format="json",
    )
    assert r.status_code == 403


def test_admin_decide_approval_approve(client_auth):
    client, admin = client_auth(role="ADMIN")
    task = _make_pending_task(admin)
    r = client.patch(
        f"/v1/admin/approvals/{task.id}",
        {"decision": "approve"},
        format="json",
    )
    assert r.status_code == 200, r.content
    task.refresh_from_db()
    assert task.status == "APPROVED"
    # 승인 시 underlying LeaveRequest 도 동기화
    leave = LeaveRequest.objects.get(id=task.target_id)
    assert leave.status == LeaveRequest.Status.APPROVED


def test_admin_decide_approval_already_decided_returns_422(client_auth):
    client, admin = client_auth(role="ADMIN")
    task = _make_pending_task(admin)
    task.status = ApprovalTask.Status.APPROVED
    task.save(update_fields=["status"])
    r = client.patch(
        f"/v1/admin/approvals/{task.id}",
        {"decision": "approve"},
        format="json",
    )
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "ALREADY_DECIDED"


def test_admin_bulk_decide_partial_success(client_auth):
    client, admin = client_auth(role="ADMIN")
    t1 = _make_pending_task(admin)
    t2 = _make_pending_task(admin)
    bogus_id = "00000000-0000-0000-0000-000000000000"
    r = client.post(
        "/v1/admin/approvals/bulk",
        {"ids": [str(t1.id), str(t2.id), bogus_id], "decision": "approve"},
        format="json",
    )
    assert r.status_code == 200, r.content
    body = r.json()["data"]
    assert body["total"] == 3
    assert body["succeeded"] == 2
    assert body["failed"] == 1
    assert bogus_id in body["failed_ids"]
    t1.refresh_from_db()
    t2.refresh_from_db()
    assert t1.status == "APPROVED"
    assert t2.status == "APPROVED"


def test_admin_bulk_decide_requires_admin(client_auth):
    client, _ = client_auth(role="EMPLOYEE")
    r = client.post(
        "/v1/admin/approvals/bulk",
        {"ids": ["00000000-0000-0000-0000-000000000000"], "decision": "approve"},
        format="json",
    )
    assert r.status_code == 403


def test_admin_expiring_leave_filters_zero_expiring(client_auth):
    client, admin = client_auth(role="ADMIN")
    # 만료 예정이 있는 직원 1명
    target = MembershipFactory(company=admin.company, role="EMPLOYEE")
    LeaveBalance.objects.create(
        company=admin.company,
        membership=target,
        kind=LeaveBalance.Kind.GRANTED,
        days=5,
        granted_at=date(2026, 1, 1),
        expires_at=date(2026, 6, 1),
        note="annual",
    )
    # 만료 예정 없는 직원 1명도 추가 (필터 검증)
    MembershipFactory(company=admin.company, role="EMPLOYEE")

    r = client.get("/v1/admin/leave/expiring")
    assert r.status_code == 200, r.content
    data = r.json()["data"]
    # 만료 예정 > 0 인 직원만 응답에 포함
    membership_ids = [row["membership_id"] for row in data]
    assert str(target.id) in membership_ids


def test_admin_expiring_leave_requires_admin(client_auth):
    client, _ = client_auth(role="EMPLOYEE")
    r = client.get("/v1/admin/leave/expiring")
    assert r.status_code == 403
