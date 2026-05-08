"""Compliance HTTP endpoints — /v1/compliance/me, /v1/admin/compliance/52h."""
from __future__ import annotations

from datetime import date, datetime

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from core.errors import Unprocessable
from core.permissions import HasRole, IsActiveMember, active_membership

from . import services


def _parse_week(raw: str | None, default: date) -> date:
    """Parse a YYYY-MM-DD anchor and return the Monday of that week."""
    if not raw:
        return services.week_start_for(default)
    try:
        anchor = datetime.strptime(raw, "%Y-%m-%d").date()
    except ValueError as exc:
        raise Unprocessable("INVALID_DATE", "week 파라미터는 YYYY-MM-DD 형식이어야 합니다.") from exc
    return services.week_start_for(anchor)


@api_view(["GET"])
@permission_classes([IsActiveMember])
def my_compliance(request):
    membership = active_membership(request.user)
    week_start = _parse_week(request.query_params.get("week"), date.today())
    status = services.weekly_status(membership, week_start)
    return Response({"data": services.status_to_dict(status)})


@api_view(["GET"])
@permission_classes([HasRole.at_least("ADMIN")])
def admin_company_compliance(request):
    me = active_membership(request.user)
    week_start = _parse_week(request.query_params.get("week"), date.today())
    rows = services.company_overview(me.company, week_start)
    return Response(
        {
            "data": {
                "week_start": week_start.isoformat(),
                "threshold_hours": "52",
                "members": rows,
            },
            "meta": {"count": len(rows)},
        }
    )


@api_view(["GET"])
@permission_classes([HasRole.at_least("MANAGER")])
def team_compliance(request):
    """GET /v1/compliance/team?week=YYYY-MM-DD — MANAGER+ 팀 단위 52h 현황.

    F-MANAGER-02: MANAGER 는 본인 부서 멤버만, ADMIN/OWNER 는 전사 조회.
    """
    me = active_membership(request.user)
    week_start = _parse_week(request.query_params.get("week"), date.today())
    rows = services.company_overview(me.company, week_start)

    # Filter to own department for MANAGER role (ADMIN/OWNER see all)
    from core.permissions import ROLE_RANK
    if ROLE_RANK.get(me.role, 0) < ROLE_RANK["ADMIN"]:
        my_dept = me.department.name if me.department else None
        if my_dept:
            rows = [r for r in rows if r.get("department") == my_dept]
        else:
            # Manager with no department: only show self
            rows = [r for r in rows if r.get("membership_id") == str(me.id)]

    return Response(
        {
            "data": {
                "week_start": week_start.isoformat(),
                "threshold_hours": "52",
                "members": rows,
                "scope": "team",
            },
            "meta": {"count": len(rows)},
        }
    )
