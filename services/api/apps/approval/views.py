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
    if task.approver_id != membership.id:
        raise Forbidden(message="이 항목을 승인할 권한이 없습니다.")
    if task.status != ApprovalTask.Status.PENDING:
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


class DecisionSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, default="")


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
    return Response({"data": {"id": str(task.id), "status": task.status}})
