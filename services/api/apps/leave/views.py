"""Leave domain HTTP endpoints — see docs/api/api-spec.md §5."""
from __future__ import annotations

from datetime import date, datetime, timedelta

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.approval.models import ApprovalTask
from apps.identity.models import Membership
from core.errors import Forbidden, NotFound, Unprocessable
from core.permissions import IsActiveMember, attach_membership

from . import services
from .models import LeaveRequest
from .serializers import (
    BalanceSerializer,
    LeavePolicySerializer,
    LeaveRequestCreateSerializer,
    LeaveRequestSerializer,
    TeamCalendarEntrySerializer,
)


def _parse_date(raw: str | None, default: date) -> date:
    if not raw:
        return default
    try:
        return datetime.strptime(raw, "%Y-%m-%d").date()
    except ValueError as exc:
        raise Unprocessable("INVALID_DATE", f"잘못된 날짜 형식: {raw}") from exc


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveMember])
def balance(request):
    membership = attach_membership(request)
    target = membership
    employee_id = request.query_params.get("employee_id")
    if employee_id:
        if membership.role not in ("ADMIN", "OWNER"):
            raise Forbidden()
        target = (
            Membership.objects.filter(
                id=employee_id,
                company=membership.company,
                is_active=True,
            )
            .select_related("company", "department")
            .first()
        )
        if target is None:
            raise NotFound("MEMBERSHIP_NOT_FOUND", "Employee not found.")
    payload = services.compute_balance(target)
    return Response({"data": BalanceSerializer(payload).data})


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveMember])
def policy(request):
    membership = attach_membership(request)
    pol = services.get_or_create_default_policy(membership.company)
    return Response({"data": LeavePolicySerializer(pol).data})


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsActiveMember])
def requests_collection(request):
    membership = attach_membership(request)
    if request.method == "POST":
        ser = LeaveRequestCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        leave = services.submit_request(
            membership=membership,
            start_date=ser.validated_data["start_date"],
            end_date=ser.validated_data["end_date"],
            kind=ser.validated_data["kind"],
            leave_type=ser.validated_data.get(
                "leave_type", LeaveRequest.LeaveType.ANNUAL
            ),
            reason=ser.validated_data.get("reason", ""),
        )
        return Response(
            {"data": LeaveRequestSerializer(leave).data},
            status=status.HTTP_201_CREATED,
        )

    qs = LeaveRequest.objects.filter(membership=membership).order_by("-start_date")
    status_filter = request.query_params.get("status")
    if status_filter:
        qs = qs.filter(status=status_filter)
    return Response({"data": LeaveRequestSerializer(qs, many=True).data})


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveMember])
def request_detail(request, request_id):
    membership = attach_membership(request)
    try:
        leave = LeaveRequest.objects.get(id=request_id, company=membership.company)
    except LeaveRequest.DoesNotExist:
        raise NotFound("LEAVE_NOT_FOUND", "신청 데이터를 찾을 수 없습니다.")
    if leave.membership_id != membership.id and (
        membership.role not in ("MANAGER", "ADMIN", "OWNER")
    ):
        raise Forbidden()
    return Response({"data": LeaveRequestSerializer(leave).data})


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsActiveMember])
def request_cancel(request, request_id):
    membership = attach_membership(request)
    try:
        leave = LeaveRequest.objects.get(id=request_id, company=membership.company)
    except LeaveRequest.DoesNotExist:
        raise NotFound("LEAVE_NOT_FOUND", "신청 데이터를 찾을 수 없습니다.")
    if leave.membership_id != membership.id:
        raise Forbidden()
    if leave.status not in (LeaveRequest.Status.PENDING, LeaveRequest.Status.APPROVED):
        raise Unprocessable("INVALID_STATE", "취소할 수 없는 상태입니다.")

    leave.status = LeaveRequest.Status.CANCELLED
    leave.save(update_fields=["status", "updated_at"])
    ApprovalTask.objects.filter(
        target_id=leave.id, status=ApprovalTask.Status.PENDING
    ).update(status=ApprovalTask.Status.REJECTED)
    return Response({"data": LeaveRequestSerializer(leave).data})


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveMember])
def team_calendar(request):
    membership = attach_membership(request)
    today = date.today()
    start = _parse_date(request.query_params.get("from"), today.replace(day=1))
    end = _parse_date(request.query_params.get("to"), start + timedelta(days=30))
    department = membership.department
    entries = services.list_team_calendar(
        membership.company, start=start, end=end, department=department
    )
    return Response({"data": TeamCalendarEntrySerializer(entries, many=True).data})
