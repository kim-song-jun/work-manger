"""Notice domain HTTP endpoints — see docs/api/api-spec.md §12."""
from __future__ import annotations

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from core.errors import NotFound
from core.permissions import IsActiveMember, attach_membership

from . import services
from .models import Notice
from .serializers import (
    NoticePatchSerializer,
    NoticeSerializer,
    NoticeWriteSerializer,
)


def _truthy(raw: str | None) -> bool:
    return (raw or "").lower() in ("1", "true", "yes", "on")


@api_view(["GET", "POST"])
@permission_classes([IsActiveMember])
def notices_collection(request):
    membership = attach_membership(request)
    if request.method == "POST":
        ser = NoticeWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        notice = services.create(membership, dict(ser.validated_data))
        return Response(
            {"data": NoticeSerializer(notice).data},
            status=status.HTTP_201_CREATED,
        )

    pinned_only = _truthy(request.query_params.get("pinned"))
    category = request.query_params.get("category") or None
    q = request.query_params.get("q") or None
    include_archived = _truthy(request.query_params.get("include_archived"))
    notices = services.list_for(
        membership,
        pinned_only=pinned_only,
        category=category,
        q=q,
        include_archived=include_archived,
    )
    return Response(
        {
            "data": NoticeSerializer(notices, many=True).data,
            "meta": {"count": len(notices)},
        }
    )


@api_view(["GET", "PATCH"])
@permission_classes([IsActiveMember])
def notice_detail(request, notice_id):
    membership = attach_membership(request)
    if request.method == "PATCH":
        ser = NoticePatchSerializer(data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        notice = services.update(membership, notice_id, dict(ser.validated_data))
        return Response({"data": NoticeSerializer(notice).data})

    notice = Notice.objects.filter(
        id=notice_id, company=membership.company
    ).first()
    if notice is None:
        raise NotFound("NOTICE_NOT_FOUND", "공지를 찾을 수 없습니다.")
    return Response({"data": NoticeSerializer(notice).data})


@api_view(["POST"])
@permission_classes([IsActiveMember])
def notice_archive(request, notice_id):
    membership = attach_membership(request)
    notice = services.archive(membership, notice_id)
    return Response({"data": NoticeSerializer(notice).data})
