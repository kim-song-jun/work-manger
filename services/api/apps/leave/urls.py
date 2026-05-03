from django.urls import path

from . import views

urlpatterns = [
    path("leave/balance", views.balance),
    path("leave/policy", views.policy),
    path("leave/requests", views.requests_collection),
    path("leave/requests/<uuid:request_id>", views.request_detail),
    path("leave/requests/<uuid:request_id>/cancel", views.request_cancel),
    path("leave/team-calendar", views.team_calendar),
]
