from django.urls import path

from . import views

urlpatterns = [
    path("compliance/me", views.my_compliance),
    path("admin/compliance/52h", views.admin_company_compliance),
]
