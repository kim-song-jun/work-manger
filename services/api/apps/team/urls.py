from django.urls import path

from . import views

urlpatterns = [
    path("team/status", views.status_root),
    path("team/status/grid", views.status_grid),
    path("team/status/grouped", views.status_grouped),
    path("team/status/timeline", views.status_timeline),
    path("team/calendar/matrix", views.calendar_matrix),
    path("team/members/<uuid:membership_id>", views.member_detail),
]
