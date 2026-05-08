from django.urls import path

from . import overtime_views, stats_views, views

urlpatterns = [
    # Attendance
    path("attendance/today", views.today),
    path("attendance/clock-in", views.clock_in),
    path("attendance/clock-out", views.clock_out),
    path("attendance/break/start", views.break_start),
    path("attendance/break/end", views.break_end),
    path("attendance/records", views.records_list),
    path("attendance/records/<uuid:pk>", views.records_detail),
    path("attendance/manual-request", views.manual_request),
    # Stats (F-EMPLOYEE-012)
    path("attendance/stats/weekly", stats_views.weekly_stats),
    path("attendance/stats/today", stats_views.today_stats),
    # Overtime
    path("overtime/requests", overtime_views.overtime_requests),
    path("overtime/requests/<uuid:pk>", overtime_views.overtime_detail),
    path("overtime/requests/<uuid:pk>/cancel", overtime_views.overtime_cancel),
    path("overtime/history", overtime_views.overtime_history),
    path("overtime/settings", overtime_views.overtime_settings),
]
