"""Inbox / Approval views — /v1/inbox/* per docs/api/api-spec.md §7."""
from __future__ import annotations

from django.db import transaction
from django.utils import timezone as django_tz
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from core.errors import Conflict, Forbidden, NotFound
from core.permissions import IsActiveMember, active_membership

from .models import ApprovalTask
from .specifications import IsApprover, IsAlreadyDecided


class InboxItemSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(source="requester.user.name", read_only=True)
    summary = serializers.SerializerMethodField()

    class Meta:
        model = ApprovalTask
        fields = (
            "id",
            "target_type",
            "target_id",
            "status",
            "requester_name",
            "summary",
            "created_at",
            "decided_at",
        )

    def get_summary(self, obj: ApprovalTask) -> dict:
        # Best-effort denormalized summary; lazy imports to avoid cycles
        if obj.target_type == ApprovalTask.TargetType.LEAVE:
            from apps.leave.models import LeaveRequest

            r = LeaveRequest.objects.filter(id=obj.target_id).first()
            if r:
                return {
                    "kind": "leave",
                    "start_date": r.start_date.isoformat(),
                    "end_date": r.end_date.isoformat(),
                    "days": str(r.days),
                    "leave_kind": r.kind,
                    "reason": r.reason,
                }
        elif obj.target_type == ApprovalTask.TargetType.OVERTIME:
            from apps.attendance.models import OvertimeRequest

            r = OvertimeRequest.objects.filter(id=obj.target_id).first()
            if r:
                return {
                    "kind": "overtime",
                    "work_date": r.work_date.isoformat(),
                    "minutes": r.requested_minutes,
                    "reason": r.reason,
                }
        elif obj.target_type == ApprovalTask.TargetType.TRIP:
            from apps.trip.models import BusinessTrip

            r = BusinessTrip.objects.filter(id=obj.target_id).first()
            if r:
                return {
                    "kind": "trip",
                    "trip_kind": r.kind,
                    "start_date": r.start_date.isoformat(),
                    "end_date": r.end_date.isoformat(),
                    "location_label": r.location_label,
                    "purpose": r.purpose,
                }
        elif obj.target_type == ApprovalTask.TargetType.MANUAL_CLOCK_IN:
            from apps.attendance.models import ManualClockInRequest

            r = ManualClockInRequest.objects.filter(id=obj.target_id).first()
            if r:
                return {
                    "kind": "manual_clock_in",
                    "work_date": r.work_date.isoformat(),
                    "clock_in_kind": r.kind,
                    "reason": r.reason,
                }
        return {"kind": obj.target_type.lower()}


@api_view(["GET"])
@permission_classes([IsActiveMember])
def inbox(request):
    membership = active_membership(request.user)
    qs = ApprovalTask.objects.filter(approver=membership).select_related(
        "requester__user"
    ).order_by("-created_at")
    status_filter = request.query_params.get("status")
    if status_filter:
        qs = qs.filter(status=status_filter.upper())
    qs = qs[:200]
    return Response(
        {"data": InboxItemSerializer(qs, many=True).data, "meta": {"count": qs.count() if hasattr(qs, "count") else None}}
    )


def _ensure_approver(task: ApprovalTask, membership) -> None:
    """Authorisation guard composed from two Specifications.

    - :class:`IsApprover` checks ownership of the inbox slot.
    - :class:`IsAlreadyDecided` flags a duplicate decision attempt.
    - F-MANAGER-01: self-approve guard — requester != approver.

    We surface them as distinct HTTP errors (403 vs 409) on purpose so
    clients can show different toasts.
    """
    if not IsApprover(membership).is_satisfied_by(task):
        raise Forbidden(message="이 항목을 승인할 권한이 없습니다.")
    # F-MANAGER-01/F-MANAGER-10: prevent self-approve
    if task.requester_id == membership.id:
        raise Forbidden(message="본인이 신청한 항목은 직접 승인할 수 없습니다.")
    if IsAlreadyDecided().is_satisfied_by(task):
        raise Conflict(code="ALREADY_DECIDED", message="이미 처리된 항목입니다.")


def _apply_decision(task: ApprovalTask, decision: str, reason: str = "") -> None:
    """Propagates the decision to the underlying domain object + notifies requester."""
    from apps.notification import services as notif_svc

    if task.target_type == ApprovalTask.TargetType.LEAVE:
        from apps.leave.models import LeaveRequest, LeaveBalance
        from decimal import Decimal

        r = LeaveRequest.objects.filter(id=task.target_id).first()
        if r is None:
            return
        r.status = LeaveRequest.Status.APPROVED if decision == "APPROVE" else LeaveRequest.Status.REJECTED
        r.decided_by = task.approver
        r.decided_at = django_tz.now()
        r.save(update_fields=["status", "decided_by", "decided_at", "updated_at"])
        if decision == "APPROVE":
            LeaveBalance.objects.create(
                company=r.company,
                membership=r.membership,
                kind=LeaveBalance.Kind.USED,
                days=Decimal(r.days) * Decimal("-1"),
                granted_at=r.start_date,
                related_request_id=r.id,
                note=f"신청 승인: {r.start_date} ~ {r.end_date}",
            )
        notif_svc.dispatch(
            task.requester,
            event_kind="LEAVE_DECISION",
            payload={
                "request_id": str(r.id),
                "decision": decision,
                "start_date": r.start_date.isoformat(),
                "end_date": r.end_date.isoformat(),
                "reason": reason,
            },
        )
    elif task.target_type == ApprovalTask.TargetType.OVERTIME:
        from apps.attendance.models import OvertimeRequest

        r = OvertimeRequest.objects.filter(id=task.target_id).first()
        if r is None:
            return
        r.status = (
            OvertimeRequest.Status.APPROVED if decision == "APPROVE" else OvertimeRequest.Status.REJECTED
        )
        r.decided_by = task.approver
        r.decided_at = django_tz.now()
        r.save(update_fields=["status", "decided_by", "decided_at", "updated_at"])
        notif_svc.dispatch(
            task.requester,
            event_kind="OVERTIME_DECISION",
            payload={
                "request_id": str(r.id),
                "decision": decision,
                "minutes": r.requested_minutes,
                "reason": reason,
            },
        )
    elif task.target_type == ApprovalTask.TargetType.TRIP:
        # Hook: m-trip decision propagation. We update BusinessTrip.status and
        # dispatch a TRIP_DECISION notification so the requester sees the
        # outcome in their in-app inbox.
        from apps.trip.models import BusinessTrip

        r = BusinessTrip.objects.filter(id=task.target_id).first()
        if r is None:
            return
        r.status = (
            BusinessTrip.Status.APPROVED
            if decision == "APPROVE"
            else BusinessTrip.Status.REJECTED
        )
        r.decided_by = task.approver
        r.decided_at = django_tz.now()
        r.save(update_fields=["status", "decided_by", "decided_at", "updated_at"])
        notif_svc.dispatch(
            task.requester,
            event_kind="TRIP_DECISION",
            payload={
                "request_id": str(r.id),
                "decision": decision,
                "trip_kind": r.kind,
                "start_date": r.start_date.isoformat(),
                "end_date": r.end_date.isoformat(),
                "location_label": r.location_label,
                "reason": reason,
            },
        )
    elif task.target_type == ApprovalTask.TargetType.MANUAL_CLOCK_IN:
        # Spec §3.4 — on APPROVE, materialize the AttendanceRecord using the
        # original ManualClockInRequest payload. Idempotent: a duplicate
        # APPROVE re-decision (which the approve view also blocks via
        # IsAlreadyDecided) returns the existing record.
        from apps.attendance.models import ManualClockInRequest
        from apps.attendance import services as att_svc

        r = ManualClockInRequest.objects.filter(id=task.target_id).first()
        if r is None:
            return
        r.status = (
            ManualClockInRequest.Status.APPROVED
            if decision == "APPROVE"
            else ManualClockInRequest.Status.REJECTED
        )
        r.decided_by = task.approver
        r.decided_at = django_tz.now()
        r.save(update_fields=["status", "decided_by", "decided_at", "updated_at"])

        record_id = None
        if decision == "APPROVE":
            record = att_svc.materialize_manual_clock_in(
                membership=r.membership,
                work_date=r.work_date,
                kind=r.kind,
                reason=r.reason,
                approver=task.approver,
            )
            record_id = str(record.id)

        notif_svc.dispatch(
            task.requester,
            event_kind="MANUAL_CLOCK_IN_DECISION",
            payload={
                "request_id": str(r.id),
                "decision": decision,
                "work_date": r.work_date.isoformat(),
                "record_id": record_id,
                "reason": reason,
            },
        )


class DecisionSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, default="")


def _broadcast_decided(task: ApprovalTask, decision: str, reason: str) -> None:
    """Best-effort WS push to the requester's inbox channel."""
    try:
        from apps.realtime import broadcast as _ws_broadcast

        _ws_broadcast.notify_inbox(
            task.requester,
            "inbox.task.decided",
            {
                "task_id": str(task.id),
                "target_type": task.target_type,
                "target_id": str(task.target_id),
                "decision": decision,
                "reason": reason,
                "decided_at": task.decided_at.isoformat() if task.decided_at else None,
            },
        )
    except Exception:  # noqa: BLE001
        pass


@api_view(["POST"])
@permission_classes([IsActiveMember])
def approve(request, task_id: str):
    membership = active_membership(request.user)
    task = ApprovalTask.objects.filter(id=task_id, company=membership.company).first()
    if task is None:
        raise NotFound()
    _ensure_approver(task, membership)
    s = DecisionSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    with transaction.atomic():
        task.status = ApprovalTask.Status.APPROVED
        task.decided_at = django_tz.now()
        task.save(update_fields=["status", "decided_at"])
        _apply_decision(task, "APPROVE", s.validated_data["reason"])
    _broadcast_decided(task, "APPROVE", s.validated_data["reason"])
    return Response({"data": {"id": str(task.id), "status": task.status}})


@api_view(["POST"])
@permission_classes([IsActiveMember])
def reject(request, task_id: str):
    membership = active_membership(request.user)
    task = ApprovalTask.objects.filter(id=task_id, company=membership.company).first()
    if task is None:
        raise NotFound()
    _ensure_approver(task, membership)
    s = DecisionSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    with transaction.atomic():
        task.status = ApprovalTask.Status.REJECTED
        task.decided_at = django_tz.now()
        task.save(update_fields=["status", "decided_at"])
        _apply_decision(task, "REJECT", s.validated_data["reason"])
    _broadcast_decided(task, "REJECT", s.validated_data["reason"])
    return Response({"data": {"id": str(task.id), "status": task.status}})
