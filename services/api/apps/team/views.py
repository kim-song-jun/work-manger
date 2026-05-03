"""Team status views — /v1/team/* per docs/api/api-spec.md §6."""
from __future__ import annotations

from datetime import date, datetime, timedelta

from django.db.models import Q
from django.utils import timezone as django_tz
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.attendance.models import AttendanceRecord
from apps.identity.models import Membership
from apps.leave.models import LeaveRequest
from core.errors import NotFound
from core.permissions import IsActiveMember, active_membership


def _status_for(record: AttendanceRecord | None, on_leave: bool) -> str:
    if on_leave:
        return "leave"
    if record is None or record.clock_in_at is None:
        return "off"
    if record.status == AttendanceRecord.Status.ON_BREAK:
        return "break"
    if record.status == AttendanceRecord.Status.COMPLETED:
        return "off"
    if record.clock_in_kind == AttendanceRecord.Kind.WFH:
        return "wfh"
    return "office"


def _today_data(company_id, today: date | None = None):
    today = today or django_tz.localdate()
    members = (
        Membership.objects.filter(company_id=company_id, is_active=True)
        .select_related("user", "department")
    )
    records = {
        r.membership_id: r
        for r in AttendanceRecord.objects.filter(company_id=company_id, work_date=today)
    }
    on_leave_ids = set(
        LeaveRequest.objects.filter(
            company_id=company_id,
            status=LeaveRequest.Status.APPROVED,
            start_date__lte=today,
            end_date__gte=today,
        ).values_list("membership_id", flat=True)
    )
    items = []
    for m in members:
        rec = records.get(m.id)
        items.append(
            {
                "membership_id": str(m.id),
                "name": m.user.name,
                "email": m.user.email,
                "department": m.department.name if m.department else None,
                "position": m.position,
                "status": _status_for(rec, m.id in on_leave_ids),
                "clock_in_at": rec.clock_in_at.isoformat() if rec and rec.clock_in_at else None,
                "clock_out_at": rec.clock_out_at.isoformat() if rec and rec.clock_out_at else None,
            }
        )
    return today, items


@api_view(["GET"])
@permission_classes([IsActiveMember])
def status_grid(request):
    membership = active_membership(request.user)
    today, items = _today_data(membership.company_id)
    return Response({"data": {"date": today.isoformat(), "items": items}, "meta": {"count": len(items)}})


@api_view(["GET"])
@permission_classes([IsActiveMember])
def status_grouped(request):
    membership = active_membership(request.user)
    today, items = _today_data(membership.company_id)
    groups: dict[str, list] = {}
    for it in items:
        key = it["department"] or "미배정"
        groups.setdefault(key, []).append(it)
    out = [
        {"department": k, "members": v, "count": len(v)}
        for k, v in sorted(groups.items())
    ]
    return Response({"data": {"date": today.isoformat(), "groups": out}})


@api_view(["GET"])
@permission_classes([IsActiveMember])
def status_timeline(request):
    membership = active_membership(request.user)
    qd = request.query_params.get("date")
    if qd:
        try:
            day = date.fromisoformat(qd)
        except ValueError:
            raise NotFound(code="INVALID_DATE", message="date 파라미터는 YYYY-MM-DD 형식이어야 합니다.")
    else:
        day = django_tz.localdate()
    records = AttendanceRecord.objects.filter(
        company_id=membership.company_id, work_date=day
    ).select_related("membership__user").order_by("clock_in_at")
    events = []
    for r in records:
        if r.clock_in_at:
            events.append({
                "ts": r.clock_in_at.isoformat(),
                "kind": "clock_in",
                "name": r.membership.user.name,
                "membership_id": str(r.membership_id),
            })
        if r.clock_out_at:
            events.append({
                "ts": r.clock_out_at.isoformat(),
                "kind": "clock_out",
                "name": r.membership.user.name,
                "membership_id": str(r.membership_id),
            })
    events.sort(key=lambda e: e["ts"])
    return Response({"data": {"date": day.isoformat(), "events": events}})


@api_view(["GET"])
@permission_classes([IsActiveMember])
def status_root(request):
    return status_grid(request._request) if False else status_grid(request)


@api_view(["GET"])
@permission_classes([IsActiveMember])
def member_detail(request, membership_id: str):
    me = active_membership(request.user)
    target = (
        Membership.objects.filter(id=membership_id, company=me.company, is_active=True)
        .select_related("user", "department")
        .first()
    )
    if target is None:
        raise NotFound()
    today = django_tz.localdate()
    rec = AttendanceRecord.objects.filter(membership=target, work_date=today).first()
    on_leave = LeaveRequest.objects.filter(
        membership=target,
        status=LeaveRequest.Status.APPROVED,
        start_date__lte=today,
        end_date__gte=today,
    ).exists()
    return Response({
        "data": {
            "membership_id": str(target.id),
            "name": target.user.name,
            "email": target.user.email,
            "department": target.department.name if target.department else None,
            "position": target.position,
            "status": _status_for(rec, on_leave),
            "today_clock_in": rec.clock_in_at.isoformat() if rec and rec.clock_in_at else None,
        }
    })
