"""Pure-function business logic for the Trip domain.

A trip submission creates an :class:`apps.approval.models.ApprovalTask` so the
manager can decide via the existing inbox plumbing. Decisions are propagated
back into :class:`BusinessTrip.status` via
``apps.approval.views._apply_decision``.
"""
from __future__ import annotations

from datetime import date

from django.db import transaction
from django.utils import timezone as django_tz

from apps.approval.models import ApprovalTask
from apps.identity.models import Membership
from core.errors import Forbidden, Unprocessable

from .models import BusinessTrip


@transaction.atomic
def submit(
    membership: Membership,
    *,
    kind: str,
    start_date: date,
    end_date: date,
    location_label: str,
    purpose: str = "",
) -> BusinessTrip:
    """Persist a :class:`BusinessTrip` and queue an approval task.

    Why: the m-trip page needs a single endpoint that mirrors the leave-apply
    pattern — submit + approval inbox + notification.
    """
    if kind not in BusinessTrip.Kind.values:
        raise Unprocessable("INVALID_KIND", "유효하지 않은 출장 유형입니다.")
    if end_date < start_date:
        raise Unprocessable(
            "INVALID_RANGE",
            "종료일은 시작일과 같거나 이후여야 합니다.",
            details={"start_date": str(start_date), "end_date": str(end_date)},
        )
    location_label = (location_label or "").strip()
    if not location_label:
        raise Unprocessable("LOCATION_REQUIRED", "장소를 입력해 주세요.")

    trip = BusinessTrip.objects.create(
        company=membership.company,
        membership=membership,
        kind=kind,
        start_date=start_date,
        end_date=end_date,
        location_label=location_label,
        purpose=purpose or "",
    )

    approver = membership.manager or membership
    ApprovalTask.objects.create(
        company=membership.company,
        target_type=ApprovalTask.TargetType.TRIP,
        target_id=trip.id,
        requester=membership,
        approver=approver,
    )
    return trip


@transaction.atomic
def cancel(trip: BusinessTrip, by: Membership) -> BusinessTrip:
    """Owner-initiated cancellation; only allowed on PENDING/APPROVED trips."""
    if trip.membership_id != by.id:
        raise Forbidden(message="본인 신청만 취소할 수 있습니다.")
    if trip.status not in (BusinessTrip.Status.PENDING, BusinessTrip.Status.APPROVED):
        raise Unprocessable("INVALID_STATE", "취소할 수 없는 상태입니다.")

    trip.status = BusinessTrip.Status.CANCELLED
    trip.save(update_fields=["status", "updated_at"])
    ApprovalTask.objects.filter(
        target_type=ApprovalTask.TargetType.TRIP,
        target_id=trip.id,
        status=ApprovalTask.Status.PENDING,
    ).update(status=ApprovalTask.Status.REJECTED, decided_at=django_tz.now())
    return trip
