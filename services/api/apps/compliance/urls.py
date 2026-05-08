from django.urls import path

from . import views

urlpatterns = [
    path("compliance/me", views.my_compliance),
    path("compliance/team", views.team_compliance),  # F-MANAGER-02
    path("admin/compliance/52h", views.admin_company_compliance),
]
