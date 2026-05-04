"""Seed the daily 09:30 KST cron for ``leave.promote_unused_leave``.

근로기준법 §61 사용 촉진 안내는 회계연도 종료 6개월/2개월 전 시점에
회사별 opt-in (``Company.leave_promotion_enabled``) 으로 발송된다.
"""
from __future__ import annotations

import json

from django.db import migrations


PROMOTION_TASK = "leave.promote_unused_leave"
PROMOTION_CRON = ("30", "9", "*", "*", "*")  # 09:30 daily, KST


def seed(apps, schema_editor):
    CrontabSchedule = apps.get_model("django_celery_beat", "CrontabSchedule")
    PeriodicTask = apps.get_model("django_celery_beat", "PeriodicTask")

    minute, hour, dom, moy, dow = PROMOTION_CRON
    cron, _ = CrontabSchedule.objects.get_or_create(
        minute=minute,
        hour=hour,
        day_of_month=dom,
        month_of_year=moy,
        day_of_week=dow,
        timezone="Asia/Seoul",
    )
    PeriodicTask.objects.update_or_create(
        name=PROMOTION_TASK,
        defaults={
            "task": PROMOTION_TASK,
            "crontab": cron,
            "enabled": True,
            "args": json.dumps([]),
            "kwargs": json.dumps({}),
        },
    )


def unseed(apps, schema_editor):
    PeriodicTask = apps.get_model("django_celery_beat", "PeriodicTask")
    PeriodicTask.objects.filter(name=PROMOTION_TASK).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("leave", "0003_leavepromotionlog"),
        ("django_celery_beat", "0019_alter_periodictasks_options"),
    ]

    operations = [
        migrations.RunPython(seed, reverse_code=unseed),
    ]
