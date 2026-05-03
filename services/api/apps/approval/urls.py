from django.urls import path

from . import views

urlpatterns = [
    path("inbox", views.inbox),
    path("inbox/<uuid:task_id>/approve", views.approve),
    path("inbox/<uuid:task_id>/reject", views.reject),
]
