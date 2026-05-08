"""Team status views — /v1/team/* per docs/api/api-spec.md §6."""
from __future__ import annotations

from datetime import date, datetime, timedelta

from django.utils import timezone as django_tz
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.attendance.models import AttendanceRecord
from apps.identity.models import Membership
from apps.leave.models import LeaveRequest
from core.errors import NotFound, Unprocessable
from core.permissions import ROLE_RANK, IsActiveMember, active_membership


def _manager_dept_id(membership):
    """F-MANAGER-03: return department_id to filter by for MANAGER-role members.

    ADMIN/OWNER/EMPLOYEE → None (no filter, see all).
    MANAGER with a department → that department_id.
    MANAGER without a department → None (allow all — best-effort).
    """
    if ROLE_RANK.get(membership.role, 0) == ROLE_RANK["MANAGER"]:
        return membership.department_id  # may be None
    return None


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


def _today_data(company_id, today: date | None = None, department_id=None):
    """Return (today_date, items_list).

    F-MANAGER-03: optional department_id narrows to one department.
    """
    today = today or django_tz.localdate()
    members_qs = Membership.objects.filter(company_id=company_id, is_active=True)
    if department_id is not None:
        members_qs = members_qs.filter(department_id=department_id)
    members = members_qs.select_related("user", "department")
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
    dept_id = _manager_dept_id(membership)
    today, items = _today_data(membership.company_id, department_id=dept_id)
    return Response({"data": {"date": today.isoformat(), "items": items}, "meta": {"count": len(items)}})


@api_view(["GET"])
@permission_classes([IsActiveMember])
def status_grouped(request):
    membership = active_membership(request.user)
    dept_id = _manager_dept_id(membership)
    today, items = _today_data(membership.company_id, department_id=dept_id)
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
    # F-MANAGER-03: filter timeline events to manager's department
    dept_id = _manager_dept_id(membership)
    records_qs = AttendanceRecord.objects.filter(
        company_id=membership.company_id, work_date=day
    ).select_related("membership__user")
    if dept_id is not None:
        records_qs = records_qs.filter(membership__department_id=dept_id)
    records = records_qs.order_by("clock_in_at")
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
    """`/v1/team/status` — alias for the grid view.

    Calls the inner ``_today_data`` helper directly (NOT the wrapped
    ``status_grid`` view, which would receive a DRF ``Request`` and a
    second time pass it through ``api_view`` causing
    ``AssertionError: The `request` argument must be an instance of
    `django.http.HttpRequest```).
    """
    membership = active_membership(request.user)
    dept_id = _manager_dept_id(membership)
    today, items = _today_data(membership.company_id, department_id=dept_id)
    return Response(
        {"data": {"date": today.isoformat(), "items": items}, "meta": {"count": len(items)}}
    )


def _matrix_status(rec: AttendanceRecord | None, on_leave: bool) -> str:
    """Per-day status for the matrix view (office|wfh|leave|break|off)."""
    if on_leave:
        return "leave"
    if rec is None or rec.clock_in_at is None:
        return "off"
    if rec.status == AttendanceRecord.Status.ON_BREAK:
        return "break"
    if rec.clock_in_kind == AttendanceRecord.Kind.WFH:
        return "wfh"
    if rec.status == AttendanceRecord.Status.COMPLETED:
        # Completed days reflect where they worked from
        if rec.clock_in_kind == AttendanceRecord.Kind.WFH:
            return "wfh"
        return "office"
    return "office"


@api_view(["GET"])
@permission_classes([IsActiveMember])
def calendar_matrix(request):
    """Dense matrix of statuses per member per day.

    GET /v1/team/calendar/matrix?from=YYYY-MM-DD&to=YYYY-MM-DD&group_by=team|all
    """
    me = active_membership(request.user)
    today = django_tz.localdate()

    def _parse(raw: str | None, default: date) -> date:
        if not raw:
            return default
        try:
            return datetime.strptime(raw, "%Y-%m-%d").date()
        except ValueError as exc:
            raise Unprocessable(
                code="INVALID_DATE",
                message="from/to 파라미터는 YYYY-MM-DD 형식이어야 합니다.",
            ) from exc

    start = _parse(request.query_params.get("from"), today - timedelta(days=6))
    end = _parse(request.query_params.get("to"), today)
    if end < start:
        raise Unprocessable(code="INVALID_RANGE", message="to는 from 이후여야 합니다.")

    days_count = (end - start).days + 1
    day_keys = [start + timedelta(days=i) for i in range(days_count)]

    members = list(
        Membership.objects.filter(company=me.company, is_active=True)
        .select_related("user", "department")
        .order_by("department__name", "user__name")
    )

    records = AttendanceRecord.objects.filter(
        company=me.company, work_date__gte=start, work_date__lte=end
    ).select_related("membership")
    rec_map: dict = {}
    for r in records:
        rec_map[(r.membership_id, r.work_date)] = r

    leaves = LeaveRequest.objects.filter(
        company=me.company,
        status=LeaveRequest.Status.APPROVED,
        start_date__lte=end,
        end_date__gte=start,
    )
    leave_set: set = set()
    for lv in leaves:
        d = max(lv.start_date, start)
        last = min(lv.end_date, end)
        while d <= last:
            leave_set.add((lv.membership_id, d))
            d = d + timedelta(days=1)

    rows = []
    for m in members:
        rows.append(
            {
                "membership_id": str(m.id),
                "name": m.user.name,
                "department": m.department.name if m.department else None,
                "days": [
                    {
                        "date": dk.isoformat(),
                        "status": _matrix_status(
                            rec_map.get((m.id, dk)),
                            (m.id, dk) in leave_set,
                        ),
                    }
                    for dk in day_keys
                ],
            }
        )

    group_by = (request.query_params.get("group_by") or "all").lower()
    payload: dict = {
        "from": start.isoformat(),
        "to": end.isoformat(),
        "rows": rows,
    }
    if group_by == "team":
        groups: dict[str, list] = {}
        for r in rows:
            key = r.get("department") or "미배정"
            groups.setdefault(key, []).append(r)
        payload["groups"] = [
            {"department": k, "rows": v, "count": len(v)}
            for k, v in sorted(groups.items())
        ]
    return Response({"data": payload, "meta": {"count": len(rows), "days": days_count}})


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
