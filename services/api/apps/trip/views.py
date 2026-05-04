"""Trip domain HTTP endpoints — see docs/api/api-spec.md §11."""
from __future__ import annotations

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from core.errors import NotFound
from core.permissions import IsActiveMember, attach_membership

from . import services
from .models import BusinessTrip
from .serializers import TripCreateSerializer, TripSerializer


@api_view(["GET", "POST"])
@permission_classes([IsActiveMember])
def trip_collection(request):
    membership = attach_membership(request)
    if request.method == "POST":
        ser = TripCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        trip = services.submit(
            membership,
            kind=ser.validated_data["kind"],
            start_date=ser.validated_data["start_date"],
            end_date=ser.validated_data["end_date"],
            location_label=ser.validated_data["location_label"],
            purpose=ser.validated_data.get("purpose", ""),
        )
        return Response(
            {"data": TripSerializer(trip).data},
            status=status.HTTP_201_CREATED,
        )

    qs = BusinessTrip.objects.filter(membership=membership).order_by("-start_date")
    status_filter = request.query_params.get("status")
    if status_filter:
        qs = qs.filter(status=status_filter.upper())
    return Response({"data": TripSerializer(qs, many=True).data})


@api_view(["GET"])
@permission_classes([IsActiveMember])
def trip_detail(request, request_id):
    membership = attach_membership(request)
    trip = BusinessTrip.objects.filter(
        id=request_id, company=membership.company
    ).first()
    if trip is None:
        raise NotFound("TRIP_NOT_FOUND", "신청 데이터를 찾을 수 없습니다.")
    if trip.membership_id != membership.id and membership.role not in (
        "MANAGER",
        "ADMIN",
        "OWNER",
    ):
        from core.errors import Forbidden

        raise Forbidden()
    return Response({"data": TripSerializer(trip).data})


@api_view(["POST"])
@permission_classes([IsActiveMember])
def trip_cancel(request, request_id):
    membership = attach_membership(request)
    trip = BusinessTrip.objects.filter(
        id=request_id, company=membership.company
    ).first()
    if trip is None:
        raise NotFound("TRIP_NOT_FOUND", "신청 데이터를 찾을 수 없습니다.")
    services.cancel(trip, membership)
    return Response({"data": TripSerializer(trip).data})
