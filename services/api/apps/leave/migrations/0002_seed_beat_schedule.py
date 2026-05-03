"""Seed django-celery-beat PeriodicTask rows for the Leave domain.

Cron times are KST (Asia/Seoul); the celery beat scheduler resolves them via
``CELERY_TIMEZONE`` configured in ``work_manager.settings.base``.
"""
from __future__ import annotations

import json

from django.db import migrations


# (task name, cron tuple) — minute, hour, day_of_month, month_of_year, day_of_week
LEAVE_SCHEDULES = [
    ("leave.grant_monthly", ("5", "0", "*", "*", "*")),
    # grant_annual fires daily at 00:10; the task itself filters to fiscal_year_start.
    ("leave.grant_annual", ("10", "0", "*", "*", "*")),
    ("leave.notify_expiring", ("0", "9", "*", "*", "*")),
    ("leave.expire", ("30", "0", "*", "*", "*")),
]


def seed(apps, schema_editor):
    CrontabSchedule = apps.get_model("django_celery_beat", "CrontabSchedule")
    PeriodicTask = apps.get_model("django_celery_beat", "PeriodicTask")

    for task_name, (minute, hour, dom, moy, dow) in LEAVE_SCHEDULES:
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
    PeriodicTask.objects.filter(name__in=[t for t, _ in LEAVE_SCHEDULES]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("leave", "0001_initial"),
        ("django_celery_beat", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed, reverse_code=unseed),
    ]
