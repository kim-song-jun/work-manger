"""
Test: approval · Specification composition
Type: Unit (pure logic; light DB usage for ApprovalTask rows)
Why:  승인 권한 룰이 깨지면 다른 사용자가 남의 승인을 처리할 수 있는 보안 결함이 된다.
      Specification 결합 테스트로 IsApprover, IsPending, CanDecide 의 논리를 고정.
Covers:
  - IsApprover.is_satisfied_by — approver_id 매칭 / 미스매칭
  - IsPending.is_satisfied_by — PENDING 만 True
  - IsAlreadyDecided — APPROVED / REJECTED 모두 True
  - CanDecide = IsApprover & IsPending — 결합 결과 진리표
  - 잘못된 candidate (None / 다른 객체) 는 False
Out of scope:
  - HTTP 통합 (test 추후 inbox 통합 테스트가 다룰 수 있음)
Coverage target: ≥ 95% for apps/approval/specifications.py
"""
from __future__ import annotations

import pytest

from apps.approval.models import ApprovalTask
from apps.approval.specifications import (
    CanDecide,
    IsAlreadyDecided,
    IsApprover,
    IsPending,
)
from tests.factories import CompanyFactory, MembershipFactory

pytestmark = pytest.mark.django_db


def _make_task(approver, status=ApprovalTask.Status.PENDING):
    requester = MembershipFactory(company=approver.company)
    return ApprovalTask.objects.create(
        company=approver.company,
        target_type=ApprovalTask.TargetType.LEAVE,
        target_id=requester.id,
        requester=requester,
        approver=approver,
        status=status,
    )


def test_is_approver_matches_bound_membership():
    approver = MembershipFactory()
    other = MembershipFactory(company=approver.company)
    task = _make_task(approver)
    assert IsApprover(approver).is_satisfied_by(task) is True
    assert IsApprover(other).is_satisfied_by(task) is False


def test_is_approver_with_none_membership_is_false():
    approver = MembershipFactory()
    task = _make_task(approver)
    assert IsApprover(None).is_satisfied_by(task) is False


def test_is_approver_rejects_non_task_candidate():
    approver = MembershipFactory()
    assert IsApprover(approver).is_satisfied_by("not a task") is False
    assert IsApprover(approver).is_satisfied_by(None) is False


def test_is_pending_only_true_for_pending():
    approver = MembershipFactory()
    pending = _make_task(approver, status=ApprovalTask.Status.PENDING)
    approved = _make_task(approver, status=ApprovalTask.Status.APPROVED)

    assert IsPending().is_satisfied_by(pending) is True
    assert IsPending().is_satisfied_by(approved) is False


def test_is_already_decided_is_inverse_of_pending():
    approver = MembershipFactory()
    pending = _make_task(approver, status=ApprovalTask.Status.PENDING)
    rejected = _make_task(approver, status=ApprovalTask.Status.REJECTED)

    assert IsAlreadyDecided().is_satisfied_by(pending) is False
    assert IsAlreadyDecided().is_satisfied_by(rejected) is True


def test_can_decide_truth_table():
    # Arrange — same approver, both PENDING vs APPROVED
    approver = MembershipFactory()
    other = MembershipFactory(company=approver.company)
    pending_mine = _make_task(approver, status=ApprovalTask.Status.PENDING)
    approved_mine = _make_task(approver, status=ApprovalTask.Status.APPROVED)
    pending_others = _make_task(other, status=ApprovalTask.Status.PENDING)

    spec = CanDecide(approver)

    # Act / Assert
    assert spec.is_satisfied_by(pending_mine) is True
    assert spec.is_satisfied_by(approved_mine) is False  # already decided
    assert spec.is_satisfied_by(pending_others) is False  # not my task


def test_specifications_combine_with_and_or_not():
    # Arrange — ad-hoc composition still works.
    approver = MembershipFactory()
    pending = _make_task(approver, status=ApprovalTask.Status.PENDING)

    spec_or = IsApprover(approver) | IsPending()
    spec_not_pending = ~IsPending()

    # Act / Assert
    assert spec_or.is_satisfied_by(pending) is True
    assert spec_not_pending.is_satisfied_by(pending) is False
