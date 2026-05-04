from django.urls import path

from . import views

urlpatterns = [
    path("auth/oauth/<str:provider>/start", views.start),
    path("auth/oauth/<str:provider>/callback", views.callback),
]
