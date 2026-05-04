from __future__ import annotations

from base64 import urlsafe_b64decode, urlsafe_b64encode
from typing import Optional

from django.utils import timezone as django_tz
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.db import transaction

from apps.approval.models import ApprovalTask
from apps.identity.models import Membership

from . import services
from .models import AttendanceRecord, ManualClockInRequest
from .permissions import IsActiveMember
from .serializers import (
    AttendanceRecordSerializer,
    BreakRecordSerializer,
    ClockInRequestSerializer,
    ManualRequestSerializer,
)


# ---------- Helpers ----------

def _err(code: str, message: str, *, http: int, details: Optional[dict] = None) -> Response:
    body = {"error": {"code": code, "message": message}}
    if details:
        body["error"]["details"] = details
    return Response(body, status=http)


def _record_payload(record: AttendanceRecord) -> dict:
    return {
        "record_id": str(record.id),
        "clock_in_at": record.clock_in_at.isoformat() if record.clock_in_at else None,
        "clock_out_at": record.clock_out_at.isoformat() if record.clock_out_at else None,
        "is_late": record.is_late,
        "is_early_leave": record.is_early_leave,
        "status": record.status,
        "total_break_minutes": record.total_break_minutes,
        "total_work_minutes": record.total_work_minutes,
        "matched_location": (
            {
                "id": str(record.clock_in_location.id),
                "label": record.clock_in_location.label,
            }
            if record.clock_in_location
            else None
        ),
    }


def _pick_approver(membership: Membership) -> Membership:
    """Return the manager (preferred) or any ADMIN/OWNER in the company as approver."""
    if membership.manager_id and membership.manager and membership.manager.is_active:
        return membership.manager
    admin = (
        membership.company.memberships.filter(
            is_active=True,
            role__in=[Membership.Role.ADMIN, Membership.Role.OWNER, Membership.Role.MANAGER],
        )
        .exclude(id=membership.id)
        .first()
    )
    return admin or membership  # fallback: self-approve (single-user dev case)


# ---------- Cursor pagination ----------

def _encode_cursor(created_at, ident) -> str:
    raw = f"{created_at.isoformat()}|{ident}".encode("utf-8")
    return urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def _decode_cursor(token: str):
    pad = "=" * (-len(token) % 4)
    raw = urlsafe_b64decode((token + pad).encode("ascii")).decode("utf-8")
    iso, ident = raw.split("|", 1)
    return iso, ident


# ---------- Endpoints ----------

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveMember])
def today(request):
    rec = services.get_today_record(request.membership, request.company)
    if rec is None:
        return Response({"data": None})
    return Response({"data": AttendanceRecordSerializer(rec).data})


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsActiveMember])
def clock_in(request):
    ser = ClockInRequestSerializer(data=request.data)
    if not ser.is_valid():
        return _err(
            "VALIDATION_ERROR", "입력 검증 실패", http=422, details={"fields": ser.errors}
        )
    data = ser.validated_data
    loc = data.get("location") or {}
    idem_key = request.headers.get("Idempotency-Key", "") or ""

    try:
        result = services.clock_in(
            membership=request.membership,
            company=request.company,
            latitude=loc.get("latitude"),
            longitude=loc.get("longitude"),
            kind=data["kind"],
            client_time=data.get("client_time"),
            idempotency_key=idem_key,
        )
    except services.AlreadyClockedIn as e:
        existing = services.get_today_record(request.membership, request.company)
        details = {"record_id": str(existing.id)} if existing else None
        return _err(e.code, e.message, http=e.http_status, details=details)
    except services.LocationOutOfRange as e:
        return _err(e.code, e.message, http=e.http_status, details=e.details)
    except services.ManualApprovalRequired as e:
        return _err(e.code, e.message, http=e.http_status)
    except services.AttendanceError as e:
        return _err(e.code, e.message, http=e.http_status, details=e.details)

    payload = _record_payload(result.record)
    http_code = status.HTTP_200_OK if result.replayed else status.HTTP_201_CREATED
    return Response({"data": payload}, status=http_code)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsActiveMember])
def clock_out(request):
    try:
        rec = services.clock_out(membership=request.membership, company=request.company)
    except services.AttendanceError as e:
        return _err(e.code, e.message, http=e.http_status, details=e.details)
    return Response({"data": _record_payload(rec)})


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsActiveMember])
def break_start(request):
    try:
        br = services.break_start(membership=request.membership, company=request.company)
    except services.AttendanceError as e:
        return _err(e.code, e.message, http=e.http_status, details=e.details)
    return Response({"data": BreakRecordSerializer(br).data}, status=201)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsActiveMember])
def break_end(request):
    try:
        br = services.break_end(membership=request.membership, company=request.company)
    except services.AttendanceError as e:
        return _err(e.code, e.message, http=e.http_status, details=e.details)
    return Response({"data": BreakRecordSerializer(br).data})


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveMember])
def records_list(request):
    try:
        limit = int(request.query_params.get("limit", "20"))
    except ValueError:
        limit = 20
    limit = max(1, min(limit, 100))

    qs = AttendanceRecord.objects.filter(membership=request.membership).order_by(
        "-created_at", "-id"
    )

    cursor = request.query_params.get("cursor")
    if cursor:
        try:
            iso, ident = _decode_cursor(cursor)
            qs = qs.filter(created_at__lte=iso).exclude(id=ident)
        except Exception:
            return _err("VALIDATION_ERROR", "잘못된 cursor 입니다.", http=422)

    items = list(qs[: limit + 1])
    has_more = len(items) > limit
    items = items[:limit]
    next_cursor = None
    if has_more and items:
        last = items[-1]
        next_cursor = _encode_cursor(last.created_at, last.id)
    return Response(
        {
            "data": AttendanceRecordSerializer(items, many=True).data,
            "meta": {"next_cursor": next_cursor, "has_more": has_more},
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveMember])
def records_detail(request, pk):
    try:
        rec = AttendanceRecord.objects.prefetch_related("breaks").get(
            id=pk, membership=request.membership
        )
    except AttendanceRecord.DoesNotExist:
        raise NotFound({"code": "RESOURCE_NOT_FOUND", "message": "기록을 찾을 수 없습니다."})
    return Response({"data": AttendanceRecordSerializer(rec).data})


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsActiveMember])
def manual_request(request):
    """Create a :class:`ManualClockInRequest` + matching :class:`ApprovalTask`.

    Spec §3.4 — the actual :class:`AttendanceRecord` is only materialized
    once an approver decides; on APPROVE the approval domain calls
    :func:`apps.attendance.services.materialize_manual_clock_in` using this
    persisted payload. Both rows are written in one transaction so the task
    can never reference a missing target_id.
    """
    ser = ManualRequestSerializer(data=request.data)
    if not ser.is_valid():
        return _err(
            "VALIDATION_ERROR", "입력 검증 실패", http=422, details={"fields": ser.errors}
        )
    data = ser.validated_data
    work_date = data.get("work_date") or services.work_date_for(
        request.company, django_tz.now()
    )
    approver = _pick_approver(request.membership)

    with transaction.atomic():
        manual_req = ManualClockInRequest.objects.create(
            company=request.company,
            membership=request.membership,
            work_date=work_date,
            kind=AttendanceRecord.Kind.MANUAL,
            reason=data["reason"],
            status=ManualClockInRequest.Status.PENDING,
        )
        task = ApprovalTask.objects.create(
            company=request.company,
            target_type=ApprovalTask.TargetType.MANUAL_CLOCK_IN,
            target_id=manual_req.id,
            requester=request.membership,
            approver=approver,
            status=ApprovalTask.Status.PENDING,
        )

    return Response(
        {
            "data": {
                "approval_task_id": str(task.id),
                "manual_request_id": str(manual_req.id),
                "status": task.status,
                "work_date": work_date.isoformat(),
                "reason": data["reason"],
            }
        },
        status=201,
    )
