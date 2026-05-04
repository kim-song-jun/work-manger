from django.urls import path

from . import views

urlpatterns = [
    path("notices", views.notices_collection),
    path("notices/<uuid:notice_id>", views.notice_detail),
    path("notices/<uuid:notice_id>/archive", views.notice_archive),
]
