from django.urls import path

from . import views

urlpatterns = [
    path("admin/dashboard", views.dashboard),
    path("admin/employees", views.list_employees),
    path("admin/employees/<uuid:membership_id>", views.employee_detail),
    path("admin/employees/<uuid:membership_id>/update", views.update_employee),
    path("admin/employees/<uuid:membership_id>/deactivate", views.deactivate_employee),
    path("admin/approvals", views.admin_approvals),
    path("admin/reports/monthly", views.monthly_report),
]
