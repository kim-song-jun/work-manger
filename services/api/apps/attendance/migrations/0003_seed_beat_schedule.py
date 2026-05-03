"""Seed django-celery-beat PeriodicTask rows for the Attendance domain.

Cron times are KST (Asia/Seoul); the beat scheduler resolves them via
``CELERY_TIMEZONE`` configured in ``work_manager.settings.base``.
"""
from __future__ import annotations

import json

from django.db import migrations


# (task name, interval kind, value)
ATTENDANCE_INTERVAL_SCHEDULES = [
    # Every hour, on the hour. Picks up rows whose clock-in is older than 24h.
    ("attendance.auto_clock_out", ("0", "*", "*", "*", "*")),
]


def seed(apps, schema_editor):
    CrontabSchedule = apps.get_model("django_celery_beat", "CrontabSchedule")
    PeriodicTask = apps.get_model("django_celery_beat", "PeriodicTask")

    for task_name, (minute, hour, dom, moy, dow) in ATTENDANCE_INTERVAL_SCHEDULES:
        cron, _ = CrontabSchedule.objects.get_or_create(
            minute=minute,
            hour=hour,
            day_of_month=dom,
            month_of_year=moy,
            day_of_week=dow,
            timezone="Asia/Seoul",
        )
        PeriodicTask.objects.update_or_create(
            name=task_name,
            defaults={
                "task": task_name,
                "crontab": cron,
                "enabled": True,
                "args": json.dumps([]),
                "kwargs": json.dumps({}),
            },
        )


def unseed(apps, schema_editor):
    PeriodicTask = apps.get_model("django_celery_beat", "PeriodicTask")
    PeriodicTask.objects.filter(
        name__in=[t for t, _ in ATTENDANCE_INTERVAL_SCHEDULES]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("attendance", "0002_initial"),
        # Need timezone field on CrontabSchedule (added in 0016).
        ("django_celery_beat", "0019_alter_periodictasks_options"),
    ]

    operations = [
        migrations.RunPython(seed, reverse_code=unseed),
    ]
