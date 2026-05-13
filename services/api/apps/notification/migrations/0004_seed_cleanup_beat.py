"""Seed django-celery-beat schedule for stale device-token GC (B-CODE-08).

Daily at 03:15 KST (= 18:15 UTC) — off-peak, avoids the 03:00 audit / leave
batch slots. Idempotent: ``update_or_create`` on ``name``.
"""
from __future__ import annotations

import json

from django.db import migrations


CRON_SCHEDULE = {
    "minute": "15",
    "hour": "18",  # UTC; KST 03:15
    "day_of_week": "*",
    "day_of_month": "*",
    "month_of_year": "*",
}


def seed(apps, schema_editor):
    CrontabSchedule = apps.get_model("django_celery_beat", "CrontabSchedule")
    PeriodicTask = apps.get_model("django_celery_beat", "PeriodicTask")

    cron, _ = CrontabSchedule.objects.get_or_create(**CRON_SCHEDULE)
    PeriodicTask.objects.update_or_create(
        name="notification.cleanup_stale_device_tokens",
        defaults={
            "task": "notification.cleanup_stale_device_tokens",
            "crontab": cron,
            "enabled": True,
            "args": json.dumps([]),
            "kwargs": json.dumps({}),
        },
    )


def unseed(apps, schema_editor):
    PeriodicTask = apps.get_model("django_celery_beat", "PeriodicTask")
    PeriodicTask.objects.filter(name="notification.cleanup_stale_device_tokens").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("notification", "0003_seed_outbox_beat"),
        ("django_celery_beat", "0019_alter_periodictasks_options"),
    ]

    operations = [
        migrations.RunPython(seed, reverse_code=unseed),
    ]
