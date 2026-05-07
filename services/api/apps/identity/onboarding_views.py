"""Onboarding endpoints — /v1/onboarding/* per docs/api/api-spec.md §2."""
from __future__ import annotations

import secrets
import string
from datetime import date, datetime, time

from django.db import transaction
from django.utils import timezone as django_tz
from rest_framework import permissions, serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from core.errors import Conflict, NotFound, Unprocessable
from core.permissions import HasRole, IsActiveMember, active_membership

from .models import (
    Company,
    CompanyJoinCode,
    Department,
    Location,
    Membership,
)
from .serializers import UserMeSerializer


def _gen_code(length: int = 6) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


# ─── 1. join-company ──────────────────────────────────────────
class JoinCompanySerializer(serializers.Serializer):
    code = serializers.CharField(max_length=12)
    employee_no = serializers.CharField(max_length=32, required=False, allow_blank=True)
    position = serializers.CharField(max_length=64, required=False, allow_blank=True)
    department_name = serializers.CharField(max_length=120, required=False, allow_blank=True)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def join_company(request):
    s = JoinCompanySerializer(data=request.data)
    s.is_valid(raise_exception=True)
    code = s.validated_data["code"].upper()

    join = CompanyJoinCode.objects.select_related("company").filter(code=code).first()
    if join is None:
        raise NotFound(code="JOIN_CODE_INVALID", message="유효하지 않은 회사 코드입니다.")
    if join.revoked_at is not None:
        raise Unprocessable(code="JOIN_CODE_REVOKED", message="회수된 회사 코드입니다.")
    if join.expires_at and join.expires_at < django_tz.now():
        raise Unprocessable(code="JOIN_CODE_EXPIRED", message="만료된 회사 코드입니다.")
    if join.max_uses is not None and join.used_count >= join.max_uses:
        raise Unprocessable(code="JOIN_CODE_EXHAUSTED", message="사용 한도를 초과한 코드입니다.")

    company = join.company

    if Membership.objects.filter(company=company, user=request.user).exists():
        raise Conflict(code="ALREADY_MEMBER", message="이미 가입된 회사입니다.")

    with transaction.atomic():
        dept = None
        if s.validated_data.get("department_name"):
            dept, _ = Department.objects.get_or_create(
                company=company,
                name=s.validated_data["department_name"],
                defaults={"path": f"/{s.validated_data['department_name']}"},
            )
        m = Membership.objects.create(
            company=company,
            user=request.user,
            department=dept,
            role=Membership.Role.EMPLOYEE,
            position=s.validated_data.get("position", ""),
            employee_no=s.validated_data.get("employee_no", ""),
            hired_at=django_tz.localdate(),
        )
        join.used_count += 1
        join.save(update_fields=["used_count"])

    return Response(
        {"data": {"membership_id": str(m.id), "company": {"id": str(company.id), "name": company.name}}},
        status=status.HTTP_201_CREATED,
    )


# ─── 2. profile ────────────────────────────────────────────────
class ProfileSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120, required=False)
    locale = serializers.CharField(max_length=8, required=False)
    position = serializers.CharField(max_length=64, required=False, allow_blank=True)
    employee_no = serializers.CharField(max_length=32, required=False, allow_blank=True)
    department_name = serializers.CharField(max_length=120, required=False, allow_blank=True)


@api_view(["PATCH"])
@permission_classes([IsActiveMember])
def profile(request):
    s = ProfileSerializer(data=request.data, partial=True)
    s.is_valid(raise_exception=True)
    user = request.user
    membership = active_membership(user)
    user_changed = False
    for f in ("name", "locale"):
        if f in s.validated_data:
            setattr(user, f, s.validated_data[f])
            user_changed = True
    if user_changed:
        user.save()

    m_update_fields: list[str] = []
    for f in ("position", "employee_no"):
        if f in s.validated_data:
            setattr(membership, f, s.validated_data[f])
            m_update_fields.append(f)
    if "department_name" in s.validated_data:
        dept_name = s.validated_data["department_name"].strip()
        if dept_name:
            dept, _ = Department.objects.get_or_create(
                company=membership.company,
                name=dept_name,
                defaults={"path": f"/{dept_name}"},
            )
            membership.department = dept
        else:
            membership.department = None
        m_update_fields.append("department")
    if m_update_fields:
        membership.save(update_fields=[*m_update_fields, "updated_at"])

    return Response({"data": UserMeSerializer(user).data})


# ─── 3. locations ──────────────────────────────────────────────
class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ("id", "kind", "label", "latitude", "longitude", "radius_m")
        read_only_fields = ("id",)


@api_view(["GET", "POST"])
@permission_classes([IsActiveMember])
def locations(request):
    membership = active_membership(request.user)
    if request.method == "GET":
        qs = Location.objects.filter(company=membership.company).order_by("kind", "label")
        return Response({"data": LocationSerializer(qs, many=True).data})

    s = LocationSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    loc = s.save(company=membership.company)
    return Response({"data": LocationSerializer(loc).data}, status=status.HTTP_201_CREATED)


# ─── 4. schedule ───────────────────────────────────────────────
class ScheduleSerializer(serializers.Serializer):
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    break_minutes = serializers.IntegerField(min_value=0, max_value=480, required=False, default=60)
    work_days = serializers.ListField(
        child=serializers.IntegerField(min_value=1, max_value=7), required=False
    )


@api_view(["PATCH"])
@permission_classes([IsActiveMember])
def schedule(request):
    from apps.attendance.models import WorkSchedule

    s = ScheduleSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    membership = active_membership(request.user)
    obj, _ = WorkSchedule.objects.update_or_create(
        membership=membership,
        defaults={
            "start_time": s.validated_data["start_time"],
            "end_time": s.validated_data["end_time"],
            "break_minutes": s.validated_data.get("break_minutes", 60),
            "work_days": s.validated_data.get("work_days", [1, 2, 3, 4, 5]),
        },
    )
    return Response(
        {
            "data": {
                "start_time": str(obj.start_time),
                "end_time": str(obj.end_time),
                "break_minutes": obj.break_minutes,
                "work_days": obj.work_days,
            }
        }
    )


# ─── 5. notifications preference ───────────────────────────────
class NotifPrefSerializer(serializers.Serializer):
    push_enabled = serializers.BooleanField(required=False)
    email_enabled = serializers.BooleanField(required=False)


@api_view(["PATCH"])
@permission_classes([IsActiveMember])
def notifications_pref(request):
    from apps.notification.models import NotificationPreference

    s = NotifPrefSerializer(data=request.data, partial=True)
    s.is_valid(raise_exception=True)
    membership = active_membership(request.user)
    out: dict = {}
    for ch_field, ch in (("push_enabled", "PUSH"), ("email_enabled", "EMAIL")):
        if ch_field not in s.validated_data:
            continue
        for ek in ("OVERTIME_REQUEST", "LEAVE_DECISION", "LEAVE_EXPIRING"):
            NotificationPreference.objects.update_or_create(
                membership=membership,
                channel=ch,
                event_kind=ek,
                defaults={"enabled": bool(s.validated_data[ch_field])},
            )
        out[ch_field] = bool(s.validated_data[ch_field])
    return Response({"data": out})


# ─── 6. complete ──────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([IsActiveMember])
def complete(request):
    return Response({"data": {"completed": True}})


# ─── ADMIN: company join codes ─────────────────────────────────
class CompanyCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyJoinCode
        fields = (
            "id",
            "code",
            "expires_at",
            "max_uses",
            "used_count",
            "created_at",
            "revoked_at",
        )
        read_only_fields = ("id", "code", "used_count", "created_at", "revoked_at")


class CompanyCodeCreateSerializer(serializers.Serializer):
    expires_at = serializers.DateTimeField(required=False, allow_null=True)
    max_uses = serializers.IntegerField(min_value=1, required=False, allow_null=True)


@api_view(["GET", "POST"])
@permission_classes([HasRole.at_least("ADMIN")])
def company_codes(request):
    membership = active_membership(request.user)
    if request.method == "GET":
        qs = CompanyJoinCode.objects.filter(company=membership.company).order_by("-created_at")
        return Response({"data": CompanyCodeSerializer(qs, many=True).data})

    s = CompanyCodeCreateSerializer(data=request.data)
    s.is_valid(raise_exception=True)

    # Generate unique code
    for _ in range(10):
        code = _gen_code(6)
        if not CompanyJoinCode.objects.filter(code=code).exists():
            break
    else:
        raise Unprocessable(code="CODE_GENERATION_FAILED", message="코드 생성에 실패했습니다.")

    obj = CompanyJoinCode.objects.create(
        company=membership.company,
        code=code,
        expires_at=s.validated_data.get("expires_at"),
        max_uses=s.validated_data.get("max_uses"),
        created_by=membership,
    )
    return Response({"data": CompanyCodeSerializer(obj).data}, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@permission_classes([HasRole.at_least("ADMIN")])
def revoke_company_code(request, code_id: str):
    membership = active_membership(request.user)
    obj = CompanyJoinCode.objects.filter(id=code_id, company=membership.company).first()
    if obj is None:
        raise NotFound()
    if obj.revoked_at is None:
        obj.revoked_at = django_tz.now()
        obj.save(update_fields=["revoked_at"])
    return Response({"data": {"revoked": True}})


# ─── DEV bootstrap (creates demo company so CLI testing works) ─
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def dev_bootstrap_company(request):
    """Create a company + make current user the OWNER. Dev-only convenience."""
    from django.conf import settings as dj_settings

    if not dj_settings.DEBUG:
        raise NotFound()

    name = request.data.get("name", "Demo Company")
    company, _ = Company.objects.get_or_create(
        code=_gen_code(6),
        defaults={
            "name": name,
            "fiscal_year_start": date(django_tz.now().year, 1, 1),
        },
    )
    m, created = Membership.objects.get_or_create(
        company=company,
        user=request.user,
        defaults={"role": Membership.Role.OWNER, "hired_at": django_tz.localdate()},
    )
    if not created and m.role != Membership.Role.OWNER:
        m.role = Membership.Role.OWNER
        m.save(update_fields=["role"])
    return Response(
        {"data": {"company": {"id": str(company.id), "code": company.code, "name": company.name}}},
        status=status.HTTP_201_CREATED,
    )
