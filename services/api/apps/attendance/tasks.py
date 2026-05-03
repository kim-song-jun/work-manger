"""Celery tasks for the Attendance domain.

Schedules are configured via :mod:`apps.attendance.migrations.0003_seed_beat_schedule`.
"""
from __future__ import annotations

from datetime import timedelta

from celery import shared_task
from django.db import transaction
from django.utils import timezone as django_tz

from .builders import BreakSpan, ClockOutBuilder
from .models import AttendanceRecord, BreakRecord, WorkSchedule


# Stale-record thresholds (kept module-level + overridable so ops can tune).
STALE_AFTER_HOURS = 24  # records older than this become eligible for auto-close
DEFAULT_WORK_HOURS = 18  # auto-close at clock_in + this many hours


@shared_task(name="attendance.auto_clock_out")
def auto_clock_out_stale(
    *,
    stale_after_hours: int = STALE_AFTER_HOURS,
    default_work_hours: int = DEFAULT_WORK_HOURS,
) -> int:
    """Auto-close attendance rows that have been WORKING for too long.

    Idempotent — only acts on records whose ``status='WORKING'`` and whose
    ``clock_in_at`` is older than ``stale_after_hours``. Records already
    transitioned to COMPLETED are skipped, so re-running yields zero changes.

    For each closed record we compute:
      - clock_out_at = clock_in_at + default_work_hours
      - total_break_minutes / total_work_minutes via :class:`ClockOutBuilder`
      - is_early_leave True only if synthetic clock-out precedes scheduled end
    """
    cutoff = django_tz.now() - timedelta(hours=stale_after_hours)
    qs = (
        AttendanceRecord.objects.filter(
            status=AttendanceRecord.Status.WORKING,
            clock_in_at__lt=cutoff,
            clock_in_at__isnull=False,
        )
        .select_related("membership")
    )

    closed = 0
    for rec in qs:
        synthetic_out = rec.clock_in_at + timedelta(hours=default_work_hours)
        sched = WorkSchedule.objects.filter(membership=rec.membership).first()
        end_time = sched.end_time if sched is not None else None

        breaks = [
            BreakSpan(started_at=br.started_at, ended_at=br.ended_at)
            for br in BreakRecord.objects.filter(attendance_record=rec)
        ]
        builder = (
            ClockOutBuilder(rec.membership)
            .with_open_record(rec.clock_in_at, rec.status)
            .with_breaks(breaks)
            .with_schedule(end_time)
            .at(synthetic_out)
        )
        try:
            plan = builder.build()
        except Exception:
            # Skip rows that fail validation rather than abort the batch.
            continue

        with transaction.atomic():
            if plan.open_break_to_close is not None:
                BreakRecord.objects.filter(
                    attendance_record=rec,
                    started_at=plan.open_break_to_close.started_at,
                    ended_at__isnull=True,
                ).update(ended_at=plan.clock_out_at)

            # Re-check status under transaction to keep the task idempotent
            # against concurrent manual clock-out.
            updated = AttendanceRecord.objects.filter(
                id=rec.id,
                status=AttendanceRecord.Status.WORKING,
            ).update(
                clock_out_at=plan.clock_out_at,
                total_break_minutes=plan.total_break_minutes,
                total_work_minutes=plan.total_work_minutes,
                is_early_leave=plan.is_early_leave,
                status=AttendanceRecord.Status.COMPLETED,
            )
            if updated:
                closed += 1
    return closed


__all__ = ["auto_clock_out_stale"]
