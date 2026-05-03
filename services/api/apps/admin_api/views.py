"""Admin endpoints — /v1/admin/* per docs/api/api-spec.md §8.

Permissions: ADMIN or OWNER required (HasRole.at_least('ADMIN')).
"""
from __future__ import annotations

from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone as django_tz
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.approval.models import ApprovalTask
from apps.attendance.models import AttendanceRecord
from apps.identity.models import Department, Membership
from apps.leave.models import LeaveBalance, LeaveRequest
from core.errors import NotFound, Unprocessable
from core.permissions import HasRole, active_membership

User = get_user_model()


# ─── /v1/admin/dashboard ──────────────────────────────────────
@api_view(["GET"])
@permission_classes([HasRole.at_least("ADMIN")])
def dashboard(request):
    me = active_membership(request.user)
    company = me.company
    today = django_tz.localdate()
    total_active = Membership.objects.filter(company=company, is_active=True).count()
    today_records = AttendanceRecord.objects.filter(company=company, work_date=today)
    clocked_in = today_records.exclude(clock_in_at__isnull=True).count()
    pending = ApprovalTask.objects.filter(company=company, status="PENDING").count()
    on_leave = LeaveRequest.objects.filter(
        company=company,
        status="APPROVED",
        start_date__lte=today,
        end_date__gte=today,
    ).count()
    return Response(
        {
            "data": {
                "date": today.isoformat(),
                "total_members": total_active,
                "clocked_in": clocked_in,
                "absent": max(0, total_active - clocked_in - on_leave),
                "on_leave": on_leave,
                "pending_approvals": pending,
            }
        }
    )


# ─── /v1/admin/employees ──────────────────────────────────────
class EmployeeSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source="user.email", read_only=True)
    name = serializers.CharField(source="user.name", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True, default=None)

    class Meta:
        model = Membership
        fields = (
            "id",
            "email",
            "name",
            "role",
            "position",
            "employee_no",
            "department_name",
            "hired_at",
            "is_active",
        )


@api_view(["GET"])
@permission_classes([HasRole.at_least("ADMIN")])
def list_employees(request):
    me = active_membership(request.user)
    qs = (
        Membership.objects.filter(company=me.company)
        .select_related("user", "department")
        .order_by("-is_active", "user__name")
    )
    q = request.query_params.get("q", "").strip()
    if q:
        qs = qs.filter(
            Q(user__name__icontains=q)
            | Q(user__email__icontains=q)
            | Q(employee_no__icontains=q)
        )
    role = request.query_params.get("role")
    if role:
        qs = qs.filter(role=role.upper())
    return Response({"data": EmployeeSerializer(qs[:500], many=True).data})


@api_view(["GET"])
@permission_classes([HasRole.at_least("ADMIN")])
def employee_detail(request, membership_id):
    me = active_membership(request.user)
    target = (
        Membership.objects.filter(id=membership_id, company=me.company)
        .select_related("user", "department")
        .first()
    )
    if target is None:
        raise NotFound()
    today = django_tz.localdate()
    last_30 = today - timedelta(days=30)
    recent = AttendanceRecord.objects.filter(
        membership=target, work_date__gte=last_30
    ).order_by("-work_date")[:30]
    bal_rows = LeaveBalance.objects.filter(membership=target)
    granted = sum((b.days for b in bal_rows if b.kind == "GRANTED"), 0)
    used = sum((-b.days for b in bal_rows if b.kind == "USED"), 0)
    return Response(
        {
            "data": {
                "employee": EmployeeSerializer(target).data,
                "leave": {
                    "granted": str(granted),
                    "used": str(used),
                    "remaining": str(granted - used),
                },
                "recent_attendance": [
                    {
                        "work_date": r.work_date.isoformat(),
                        "clock_in_at": r.clock_in_at.isoformat() if r.clock_in_at else None,
                        "clock_out_at": r.clock_out_at.isoformat() if r.clock_out_at else None,
                        "is_late": r.is_late,
                        "total_work_minutes": r.total_work_minutes,
                    }
                    for r in recent
                ],
            }
        }
    )


class UpdateEmployeeSerializer(serializers.Serializer):
    role = serializers.ChoiceField(
        choices=("EMPLOYEE", "MANAGER", "ADMIN", "OWNER"), required=False
    )
    department_name = serializers.CharField(required=False, allow_blank=True)
    position = serializers.CharField(required=False, allow_blank=True)
    is_active = serializers.BooleanField(required=False)


@api_view(["PATCH"])
@permission_classes([HasRole.at_least("ADMIN")])
def update_employee(request, membership_id):
    me = active_membership(request.user)
    target = Membership.objects.filter(id=membership_id, company=me.company).first()
    if target is None:
        raise NotFound()
    s = UpdateEmployeeSerializer(data=request.data, partial=True)
    s.is_valid(raise_exception=True)
    if "role" in s.validated_data:
        target.role = s.validated_data["role"]
    if "position" in s.validated_data:
        target.position = s.validated_data["position"]
    if "is_active" in s.validated_data:
        target.is_active = s.validated_data["is_active"]
    if "department_name" in s.validated_data:
        name = s.validated_data["department_name"]
        if name:
            d, _ = Department.objects.get_or_create(
                company=me.company, name=name, defaults={"path": f"/{name}"}
            )
            target.department = d
        else:
            target.department = None
    target.save()
    return Response({"data": EmployeeSerializer(target).data})


@api_view(["POST"])
@permission_classes([HasRole.at_least("ADMIN")])
def deactivate_employee(request, membership_id):
    me = active_membership(request.user)
    target = Membership.objects.filter(id=membership_id, company=me.company).first()
    if target is None:
        raise NotFound()
    target.is_active = False
    target.deleted_at = django_tz.now()
    target.save(update_fields=["is_active", "deleted_at", "updated_at"])
    return Response({"data": {"deactivated": True}})


# ─── /v1/admin/approvals ──────────────────────────────────────
@api_view(["GET"])
@permission_classes([HasRole.at_least("ADMIN")])
def admin_approvals(request):
    me = active_membership(request.user)
    qs = ApprovalTask.objects.filter(company=me.company).select_related(
        "requester__user", "approver__user"
    )
    st = request.query_params.get("status")
    if st:
        qs = qs.filter(status=st.upper())
    qs = qs.order_by("-created_at")[:200]
    items = [
        {
            "id": str(t.id),
            "target_type": t.target_type,
            "target_id": str(t.target_id),
            "status": t.status,
            "requester_name": t.requester.user.name,
            "approver_name": t.approver.user.name,
            "created_at": t.created_at.isoformat(),
        }
        for t in qs
    ]
    return Response({"data": items})


# ─── /v1/admin/reports/monthly ───────────────────────────────
@api_view(["GET"])
@permission_classes([HasRole.at_least("ADMIN")])
def monthly_report(request):
    me = active_membership(request.user)
    ym = request.query_params.get("ym")  # YYYY-MM
    if not ym:
        today = django_tz.localdate()
        ym = today.strftime("%Y-%m")
    try:
        y, m_ = ym.split("-")
        year, month = int(y), int(m_)
        month_start = date(year, month, 1)
    except (ValueError, AttributeError):
        raise Unprocessable(code="INVALID_YM", message="ym 파라미터는 YYYY-MM 형식이어야 합니다.")
    if month == 12:
        month_end = date(year + 1, 1, 1)
    else:
        month_end = date(year, month + 1, 1)

    rows = (
        AttendanceRecord.objects.filter(
            company=me.company,
            work_date__gte=month_start,
            work_date__lt=month_end,
        )
        .select_related("membership__user", "membership__department")
    )
    by_member: dict[str, dict] = {}
    for r in rows:
        key = str(r.membership_id)
        m = by_member.setdefault(
            key,
            {
                "membership_id": key,
                "name": r.membership.user.name,
                "department": r.membership.department.name if r.membership.department else None,
                "days": 0,
                "late_days": 0,
                "total_minutes": 0,
            },
        )
        m["days"] += 1
        m["late_days"] += 1 if r.is_late else 0
        m["total_minutes"] += r.total_work_minutes or 0
    return Response(
        {
            "data": {
                "ym": ym,
                "members": list(by_member.values()),
                "totals": {
                    "members": len(by_member),
                    "total_minutes": sum(v["total_minutes"] for v in by_member.values()),
                    "late_days": sum(v["late_days"] for v in by_member.values()),
                },
            }
        }
    )
