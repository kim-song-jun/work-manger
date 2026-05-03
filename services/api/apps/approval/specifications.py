"""Approval domain specifications — Specification pattern.

Composable predicates over :class:`apps.approval.models.ApprovalTask`. Used by
the Approval views to decide whether a given membership can act on a task.

Composition example:

    from apps.approval.specifications import IsApprover, IsPending, CanDecide

    if not CanDecide(membership).is_satisfied_by(task):
        raise Forbidden()
"""
from __future__ import annotations

from typing import Any

from core.specifications import Specification

from .models import ApprovalTask


class IsApprover(Specification):
    """True iff *task.approver_id* matches the bound membership."""

    def __init__(self, membership) -> None:
        self.membership = membership

    def is_satisfied_by(self, candidate: Any) -> bool:
        if not isinstance(candidate, ApprovalTask):
            return False
        if self.membership is None:
            return False
        return candidate.approver_id == self.membership.id


class IsPending(Specification):
    """True iff the task status is PENDING."""

    def is_satisfied_by(self, candidate: Any) -> bool:
        if not isinstance(candidate, ApprovalTask):
            return False
        return candidate.status == ApprovalTask.Status.PENDING


class IsAlreadyDecided(Specification):
    """True iff the task is no longer pending."""

    def is_satisfied_by(self, candidate: Any) -> bool:
        if not isinstance(candidate, ApprovalTask):
            return False
        return candidate.status != ApprovalTask.Status.PENDING


def CanDecide(membership) -> Specification:  # noqa: N802 — class-like factory
    """Composite spec: the bound membership may decide on the task."""
    return IsApprover(membership) & IsPending()


__all__ = [
    "IsApprover",
    "IsPending",
    "IsAlreadyDecided",
    "CanDecide",
]
