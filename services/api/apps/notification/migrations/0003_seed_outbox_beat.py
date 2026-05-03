"""Seed django-celery-beat schedule for the notification outbox sweep.

Drives :func:`apps.notification.outbox.dispatch_due` every 60 seconds. Beat is
the safety net: ``process_one`` is invoked inline at enqueue-time for the happy
path, but rows that fail and need to wait for backoff (or rows orphaned by a
worker crash) are picked up by this periodic sweep.
"""
from __future__ import annotations

import json

from django.db import migrations


SCHEDULES = [
    # (task name, every_n, period)
    ("notification.outbox.dispatch_due", 60, "seconds"),
]


def seed(apps, schema_editor):
    IntervalSchedule = apps.get_model("django_celery_beat", "IntervalSchedule")
    PeriodicTask = apps.get_model("django_celery_beat", "PeriodicTask")

    for task_name, every, period in SCHEDULES:
        interval, _ = IntervalSchedule.objects.get_or_create(every=every, period=period)
        PeriodicTask.objects.update_or_create(
            name=task_name,
            defaults={
                "task": task_name,
                "interval": interval,
                "enabled": True,
                "args": json.dumps([]),
                "kwargs": json.dumps({}),
            },
        )


def unseed(apps, schema_editor):
    PeriodicTask = apps.get_model("django_celery_beat", "PeriodicTask")
    PeriodicTask.objects.filter(name__in=[t for t, _, _ in SCHEDULES]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("notification", "0002_notificationoutbox"),
        ("django_celery_beat", "0019_alter_periodictasks_options"),
    ]

    operations = [
        migrations.RunPython(seed, reverse_code=unseed),
    ]
