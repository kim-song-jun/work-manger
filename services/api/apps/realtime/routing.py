"""URL routing for WebSocket consumers (mounted in work_manager/asgi.py)."""
from __future__ import annotations

from django.urls import path

from .consumers import AdminConsumer, InboxConsumer, TeamConsumer

websocket_urlpatterns = [
    path("v1/ws/team", TeamConsumer.as_asgi()),
    path("v1/ws/inbox", InboxConsumer.as_asgi()),
    path("v1/ws/admin", AdminConsumer.as_asgi()),
]
