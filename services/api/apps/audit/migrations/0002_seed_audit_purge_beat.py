"""Migration: register `audit.purge_old_audit_logs` Celery Beat PeriodicTask.

Runs daily at 03:00 KST (= 18:00 UTC previous day).
F-ADMIN-07 / F-OWNER-06 — operations-guide §11 audit log 90-day retention policy.
"""
from __future__ import annotations

from django.db import migrations


def _register_beat(apps, schema_editor):
    """Create (or update) the PeriodicTask using django-celery-beat models."""
    try:
        CrontabSchedule = apps.get_model("django_celery_beat", "CrontabSchedule")
        PeriodicTask = apps.get_model("django_celery_beat", "PeriodicTask")
    except LookupError:
        # django-celery-beat not migrated yet (unlikely in normal flow); skip gracefully.
        return

    # 18:00 UTC == 03:00 KST (UTC+9)
    schedule, _ = CrontabSchedule.objects.get_or_create(
        minute="0",
        hour="18",
        day_of_week="*",
        day_of_month="*",
        month_of_year="*",
        defaults={"timezone": "UTC"},
    )
    PeriodicTask.objects.update_or_create(
        name="audit.purge_old_audit_logs",
        defaults={
            "crontab": schedule,
            "task": "audit.purge_old_audit_logs",
            "enabled": True,
            "description": "Daily 03:00 KST — delete AuditLog rows older than AUDIT_LOG_RETENTION_DAYS",
        },
    )


def _deregister_beat(apps, schema_editor):
    """Rollback: remove the PeriodicTask (leave CrontabSchedule in place)."""
    try:
        PeriodicTask = apps.get_model("django_celery_beat", "PeriodicTask")
    except LookupError:
        return
    PeriodicTask.objects.filter(name="audit.purge_old_audit_logs").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("audit", "0001_initial"),
        # Ensure django-celery-beat tables exist before we insert rows.
        # We depend on the lowest known migration — beat's own chain handles the rest.
        ("django_celery_beat", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(_register_beat, reverse_code=_deregister_beat),
    ]
