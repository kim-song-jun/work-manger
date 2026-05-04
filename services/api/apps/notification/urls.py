from django.urls import path

from . import views

urlpatterns = [
    path("notifications", views.list_notifications),
    path("notifications/<uuid:log_id>/read", views.mark_read),
    path("notifications/read-all", views.mark_all_read),
    path("notifications/devices", views.register_device),
    path("notifications/devices/<uuid:device_id>", views.unregister_device),
    path("notifications/vapid-public-key", views.vapid_public_key),
]
