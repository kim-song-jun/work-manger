"""Read-only audit log endpoint — GET /v1/admin/audit (ADMIN+)."""
from __future__ import annotations

import base64
import json
from datetime import datetime

from django.utils.dateparse import parse_datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from core.errors import Unprocessable
from core.permissions import HasRole, active_membership

from .models import AuditLog


def _encode_cursor(created_at: datetime, pk: str) -> str:
    raw = json.dumps({"t": created_at.isoformat(), "i": str(pk)})
    return base64.urlsafe_b64encode(raw.encode()).decode().rstrip("=")


def _decode_cursor(cursor: str) -> tuple[datetime, str]:
    pad = "=" * (-len(cursor) % 4)
    obj = json.loads(base64.urlsafe_b64decode(cursor + pad))
    return parse_datetime(obj["t"]), obj["i"]


@api_view(["GET"])
@permission_classes([HasRole.at_least("ADMIN")])
def list_audit(request):
    me = active_membership(request.user)
    qs = AuditLog.objects.filter(company=me.company).select_related("actor")

    if action := request.query_params.get("action"):
        qs = qs.filter(action=action)
    if actor := request.query_params.get("actor"):
        qs = qs.filter(actor_id=actor)
    if dt_from := request.query_params.get("from"):
        parsed = parse_datetime(dt_from)
        if parsed is None:
            raise Unprocessable(code="INVALID_DATE", message="from은 ISO-8601 형식이어야 합니다.")
        qs = qs.filter(created_at__gte=parsed)
    if dt_to := request.query_params.get("to"):
        parsed = parse_datetime(dt_to)
        if parsed is None:
            raise Unprocessable(code="INVALID_DATE", message="to는 ISO-8601 형식이어야 합니다.")
        qs = qs.filter(created_at__lte=parsed)

    qs = qs.order_by("-created_at", "-id")

    cursor = request.query_params.get("cursor")
    if cursor:
        try:
            ts, pk = _decode_cursor(cursor)
        except Exception:
            raise Unprocessable(code="INVALID_CURSOR", message="cursor가 잘못되었습니다.")
        qs = qs.filter(created_at__lt=ts) | qs.filter(created_at=ts, id__lt=pk)
        qs = qs.order_by("-created_at", "-id")

    try:
        limit = max(1, min(int(request.query_params.get("limit", 50)), 200))
    except ValueError:
        limit = 50

    rows = list(qs[: limit + 1])
    has_more = len(rows) > limit
    page = rows[:limit]

    items = [
        {
            "id": str(r.id),
            "action": r.action,
            "actor_id": str(r.actor_id) if r.actor_id else None,
            "target_type": r.target_type or None,
            "target_id": str(r.target_id) if r.target_id else None,
            "ip": r.ip,
            "user_agent": r.user_agent,
            "payload": r.payload_json,
            "created_at": r.created_at.isoformat(),
        }
        for r in page
    ]
    next_cursor = (
        _encode_cursor(page[-1].created_at, page[-1].id) if (has_more and page) else None
    )
    return Response({"data": items, "next_cursor": next_cursor})
