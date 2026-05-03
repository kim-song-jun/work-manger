from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)


def health(_request):
    return JsonResponse({"status": "ok", "service": "work-manager-api"})


def version(_request):
    return JsonResponse({"version": "0.1.0"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("v1/health", health),
    path("v1/version", version),
    path("v1/", include("apps.identity.urls")),
    path("v1/", include("apps.attendance.urls")),
    path("v1/", include("apps.leave.urls")),
    path("v1/", include("apps.approval.urls")),
    path("v1/", include("apps.team.urls")),
    path("v1/", include("apps.notification.urls")),
    path("v1/", include("apps.admin_api.urls")),
    path("v1/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "v1/schema/swagger/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]
