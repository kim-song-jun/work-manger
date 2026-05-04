from django.urls import path

from . import views

urlpatterns = [
    path("trip/requests", views.trip_collection),
    path("trip/requests/<uuid:request_id>", views.trip_detail),
    path("trip/requests/<uuid:request_id>/cancel", views.trip_cancel),
]
