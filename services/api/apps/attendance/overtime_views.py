from __future__ import annotations

from base64 import urlsafe_b64decode, urlsafe_b64encode
from datetime import date, timedelta

from django.utils import timezone as django_tz
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.approval.models import ApprovalTask

from . import services
from .models import OvertimeRequest
from .permissions import IsActiveMember
from .serializers import OvertimeCreateSerializer, OvertimeRequestSerializer
from .views import _err, _pick_approver


def _encode_cursor(created_at, ident) -> str:
    raw = f"{created_at.isoformat()}|{ident}".encode("utf-8")
    return urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def _decode_cursor(token: str):
    pad = "=" * (-len(token) % 4)
    raw = urlsafe_b64decode((token + pad).encode("ascii")).decode("utf-8")
    iso, ident = raw.split("|", 1)
    return iso, ident


@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated, IsActiveMember])
def overtime_requests(request):
    if request.method == "POST":
        return _create(request)
    return _list(request)


def _create(request):
    ser = OvertimeCreateSerializer(data=request.data)
    if not ser.is_valid():
        return _err(
            "VALIDATION_ERROR", "입력 검증 실패", http=422, details={"fields": ser.errors}
        )
    data = ser.validated_data
    work_date = data.get("work_date") or services.work_date_for(
        request.company, django_tz.now()
    )
    ot = OvertimeRequest.objects.create(
        company=request.company,
        membership=request.membership,
        work_date=work_date,
        requested_minutes=data["requested_minutes"],
        reason=data.get("reason", ""),
        auto_generated=False,
        status=OvertimeRequest.Status.PENDING,
    )
    # F-MANAGER-01: _pick_approver never returns self; fallback for dev/single-user
    approver = _pick_approver(request.membership) or request.membership
    task = ApprovalTask.objects.create(
        company=request.company,
        target_type=ApprovalTask.TargetType.OVERTIME,
        target_id=ot.id,
        requester=request.membership,
        approver=approver,
        status=ApprovalTask.Status.PENDING,
    )
    try:
        from apps.realtime import broadcast as ws_broadcast

        ws_broadcast.notify_inbox(
            approver,
            "inbox.task.created",
            {
                "task_id": str(task.id),
                "target_type": task.target_type,
                "target_id": str(task.target_id),
                "requester_id": str(task.requester_id),
                "created_at": task.created_at.isoformat(),
            },
        )
    except Exception:  # noqa: BLE001
        pass
    return Response(
        {"data": OvertimeRequestSerializer(ot).data},
        status=status.HTTP_201_CREATED,
    )


def _list(request):
    try:
        limit = int(request.query_params.get("limit", "20"))
    except ValueError:
        limit = 20
    limit = max(1, min(limit, 100))
    qs = OvertimeRequest.objects.filter(membership=request.membership).order_by(
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
            "data": OvertimeRequestSerializer(items, many=True).data,
            "meta": {"next_cursor": next_cursor, "has_more": has_more},
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveMember])
def overtime_detail(request, pk):
    try:
        ot = OvertimeRequest.objects.get(id=pk, membership=request.membership)
    except OvertimeRequest.DoesNotExist:
        raise NotFound({"code": "RESOURCE_NOT_FOUND", "message": "신청을 찾을 수 없습니다."})
    return Response({"data": OvertimeRequestSerializer(ot).data})


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsActiveMember])
def overtime_cancel(request, pk):
    try:
        ot = OvertimeRequest.objects.get(id=pk, membership=request.membership)
    except OvertimeRequest.DoesNotExist:
        raise NotFound({"code": "RESOURCE_NOT_FOUND", "message": "신청을 찾을 수 없습니다."})
    if ot.status != OvertimeRequest.Status.PENDING:
        return _err("INVALID_STATE", "취소할 수 없는 상태입니다.", http=409)
    ot.status = OvertimeRequest.Status.CANCELLED
    ot.save(update_fields=["status", "updated_at"])
    # Cancel any pending ApprovalTask
    ApprovalTask.objects.filter(
        target_type=ApprovalTask.TargetType.OVERTIME,
        target_id=ot.id,
        status=ApprovalTask.Status.PENDING,
    ).update(status=ApprovalTask.Status.REJECTED, decided_at=django_tz.now())
    return Response({"data": OvertimeRequestSerializer(ot).data})


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveMember])
def overtime_history(request):
    """Monthly aggregates for current and past months."""
    membership = request.membership
    today = services.work_date_for(request.company, django_tz.now())
    months = []
    cursor = date(today.year, today.month, 1)
    for _ in range(6):
        next_month = (cursor.replace(day=28) + timedelta(days=4)).replace(day=1)
        agg = OvertimeRequest.objects.filter(
            membership=membership,
            work_date__gte=cursor,
            work_date__lt=next_month,
            status=OvertimeRequest.Status.APPROVED,
        )
        total = sum(o.requested_minutes for o in agg)
        months.append(
            {
                "ym": cursor.strftime("%Y-%m"),
                "approved_minutes": total,
                "approved_count": agg.count(),
            }
        )
        # walk back one month
        prev_last = cursor - timedelta(days=1)
        cursor = date(prev_last.year, prev_last.month, 1)
    return Response({"data": {"months": months}})


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated, IsActiveMember])
def overtime_settings(request):
    """Stub — auto-request thresholds. Stored on Company in future; static for now."""
    if request.method == "GET":
        return Response(
            {
                "data": {
                    "auto_request_enabled": True,
                    "trigger_after_minutes": 10,
                    "max_weekly_minutes": 12 * 60,
                }
            }
        )
    # PATCH: accept and echo back (no persistence yet)
    return Response({"data": request.data})
