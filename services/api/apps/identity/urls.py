from django.urls import path

from . import views

urlpatterns = [
    path("auth/signup", views.signup),
    path("auth/login", views.login),
    path("auth/refresh", views.refresh),
    path("me", views.me),
]
