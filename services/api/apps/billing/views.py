"""Billing read endpoints (iter13 T6 SKELETON).

Two GET endpoints, OWNER-only, no Stripe SDK calls. Future iter14 work
will add ``POST /v1/billing/checkout`` and a Stripe webhook receiver.
"""
from __future__ import annotations

from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.errors import NotFound
from core.permissions import IsActiveMember, attach_membership

from .models import CompanySubscription, Invoice
from .permissions import IsOwner
from .serializers import CompanySubscriptionSerializer, InvoiceSerializer


@extend_schema(
    summary="Current company subscription (OWNER only)",
    responses={
        200: CompanySubscriptionSerializer,
        404: OpenApiResponse(description="No subscription found for this company"),
    },
    tags=["billing"],
)
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveMember, IsOwner])
def subscription(request):
    """``GET /v1/billing/subscription`` — F-OWNER-07 view-only.

    Returns the latest subscription row for the OWNER's company. A 404
    is returned (not an empty body) when nothing has been provisioned
    yet so the FE can branch cleanly into a "Choose a plan" CTA.
    """
    membership = attach_membership(request)
    sub = (
        CompanySubscription.objects.filter(company=membership.company)
        .select_related("plan")
        .order_by("-created_at")
        .first()
    )
    if sub is None:
        raise NotFound("SUBSCRIPTION_NOT_FOUND", "구독 정보가 없습니다.")
    return Response({"data": CompanySubscriptionSerializer(sub).data})


@extend_schema(
    summary="Invoice history (OWNER only, paginated)",
    responses={200: InvoiceSerializer(many=True)},
    tags=["billing"],
)
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveMember, IsOwner])
def invoices(request):
    """``GET /v1/billing/invoices`` — newest first, capped at 100 rows.

    Pagination is intentionally simple (count-then-slice) for the
    skeleton; iter14 swaps to cursor pagination once Stripe webhook
    starts emitting more rows than fit in a single screen.
    """
    membership = attach_membership(request)
    qs = (
        Invoice.objects.filter(subscription__company=membership.company)
        .select_related("subscription")
        .order_by("-issued_at")[:100]
    )
    return Response({"data": InvoiceSerializer(qs, many=True).data})
