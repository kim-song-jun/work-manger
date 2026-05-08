from django.urls import path

from . import views, views_bulk

urlpatterns = [
    path("admin/dashboard", views.dashboard),
    path("admin/employees", views.list_employees),
    path("admin/employees/bulk", views_bulk.bulk_employees),
    path("admin/employees/<uuid:membership_id>", views.employee_detail),
    path("admin/employees/<uuid:membership_id>/update", views.update_employee),
    path("admin/employees/<uuid:membership_id>/deactivate", views.deactivate_employee),
    path("admin/approvals", views.admin_approvals),
    path("admin/approvals/bulk", views_bulk.bulk_decide_approvals),
    path("admin/approvals/<uuid:task_id>", views_bulk.decide_approval),
    path("admin/leave/expiring", views_bulk.admin_expiring_leave),
    path("admin/reports/monthly", views.monthly_report),
    path("admin/reports/export", views_bulk.export_report),
    path("admin/settings", views_bulk.company_settings_get),
    path("admin/settings/update", views_bulk.company_settings_update),
]
