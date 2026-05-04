"""Notification + Inbox endpoints — /v1/notifications, /v1/notifications/devices."""
from __future__ import annotations

from django.conf import settings
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from core.errors import NotFound
from core.permissions import IsActiveMember, active_membership

from . import services
from .models import DeviceToken, NotificationLog


@api_view(["GET"])
@permission_classes([AllowAny])
def vapid_public_key(request):
    """Return the active VAPID public key for FE Web Push subscription.

    Public on purpose: it's the same key embedded in static FE bundles via
    ``VITE_VAPID_PUBLIC_KEY``. Exposing the runtime endpoint lets ops rotate
    the key without rebuilding FE artefacts.
    """
    return Response(
        {"data": {"public_key": getattr(settings, "WEB_PUSH_VAPID_PUBLIC_KEY", "")}}
    )


class NotificationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationLog
        fields = (
            "id",
            "event_kind",
            "channel",
            "payload_json",
            "delivered_at",
            "failed_at",
            "read_at",
            "created_at",
        )


@api_view(["GET"])
@permission_classes([IsActiveMember])
def list_notifications(request):
    membership = active_membership(request.user)
    items = services.list_for(membership)
    return Response({"data": NotificationLogSerializer(items, many=True).data})


@api_view(["POST"])
@permission_classes([IsActiveMember])
def mark_read(request, log_id):
    membership = active_membership(request.user)
    n = services.mark_read(membership, [log_id])
    if n == 0:
        # already read or not found
        if not NotificationLog.objects.filter(id=log_id, membership=membership).exists():
            raise NotFound()
    return Response({"data": {"updated": n}})


@api_view(["POST"])
@permission_classes([IsActiveMember])
def mark_all_read(request):
    membership = active_membership(request.user)
    n = services.mark_all_read(membership)
    return Response({"data": {"updated": n}})


class DeviceTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceToken
        fields = ("id", "platform", "token", "last_seen_at")
        read_only_fields = ("id", "last_seen_at")


@api_view(["POST"])
@permission_classes([IsActiveMember])
def register_device(request):
    membership = active_membership(request.user)
    s = DeviceTokenSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    obj, _ = DeviceToken.objects.update_or_create(
        platform=s.validated_data["platform"],
        token=s.validated_data["token"],
        defaults={"membership": membership},
    )
    return Response({"data": DeviceTokenSerializer(obj).data}, status=201)


@api_view(["DELETE"])
@permission_classes([IsActiveMember])
def unregister_device(request, device_id):
    membership = active_membership(request.user)
    obj = DeviceToken.objects.filter(id=device_id, membership=membership).first()
    if obj is None:
        raise NotFound()
    obj.delete()
    return Response({"data": {"removed": True}})
