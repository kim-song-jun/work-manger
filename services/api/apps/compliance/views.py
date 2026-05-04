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
