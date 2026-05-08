"""Aggregated attendance statistics endpoints (F-EMPLOYEE-012).

Provides FE-friendly aggregations that the home dashboard needs without
forcing the client to issue N range queries:

- ``GET /v1/attendance/stats/weekly`` — current ISO week (Mon..Sun in
  the company timezone). Sums ``total_work_minutes`` / break minutes
  across the user's :class:`AttendanceRecord` rows; derives overtime by
  subtracting the user's :class:`WorkSchedule` daily regular minutes
  from each day's worked minutes.

- ``GET /v1/attendance/stats/today`` — same shape as
  :func:`apps.attendance.views.today` but flattened to the keys the FE
  consumes (``work_minutes`` instead of ``total_work_minutes`` etc.) so
  the m-home page can read a stable contract regardless of internal
  serializer changes.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, time, timedelta

from django.utils import timezone as django_tz
from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import services
from .models import AttendanceRecord, BreakRecord, WorkSchedule
from .permissions import IsActiveMember

# ---------- Response serializers (drf-spectacular schema only) ----------


class WeeklyStatsResponseSerializer(serializers.Serializer):
    week_start = serializers.DateField()
    week_end = serializers.DateField()
    regular_minutes = serializers.IntegerField()
    overtime_minutes = serializers.IntegerField()
    break_minutes = serializers.IntegerField()
    days_worked = serializers.IntegerField()


class TodayStatsResponseSerializer(serializers.Serializer):
    clock_in_at = serializers.DateTimeField(allow_null=True)
    clock_out_at = serializers.DateTimeField(allow_null=True)
    work_minutes = serializers.IntegerField()
    break_minutes = serializers.IntegerField()
    is_clocked_in = serializers.BooleanField()


# ---------- Helpers ----------


@dataclass
class WeeklyAggregate:
    week_start: date
    week_end: date
    regular_minutes: int
    overtime_minutes: int
    break_minutes: int
    days_worked: int

    def to_dict(self) -> dict:
        return {
            "week_start": self.week_start.isoformat(),
            "week_end": self.week_end.isoformat(),
            "regular_minutes": self.regular_minutes,
            "overtime_minutes": self.overtime_minutes,
            "break_minutes": self.break_minutes,
            "days_worked": self.days_worked,
        }


def _iso_week_bounds(local_today: date) -> tuple[date, date]:
    """Return (Mon, Sun) in the same locale as ``local_today``.

    ``date.weekday()`` returns 0=Mon..6=Sun so the offset to Monday is
    ``weekday()`` itself.
    """
    monday = local_today - timedelta(days=local_today.weekday())
    sunday = monday + timedelta(days=6)
    return monday, sunday


def _schedule_daily_regular_minutes(schedule: WorkSchedule) -> int:
    """Regular minutes per scheduled work day = end - start - break."""
    start = schedule.start_time or time(9, 0)
    end = schedule.end_time or time(18, 0)
    span = (
        datetime.combine(date.today(), end) - datetime.combine(date.today(), start)
    )
    minutes = int(span.total_seconds() // 60) - (schedule.break_minutes or 0)
    return max(0, minutes)


def _record_work_minutes(rec: AttendanceRecord) -> int:
    """Best-effort worked minutes for a record, regardless of clock-out state.

    Completed records have ``total_work_minutes`` materialized; in-progress
    records (still WORKING / ON_BREAK at week boundary or for current day)
    fall back to a live computation against ``django_tz.now()``.
    """
    if rec.total_work_minutes is not None:
        return rec.total_work_minutes
    if rec.clock_in_at is None:
        return 0
    end = rec.clock_out_at or django_tz.now()
    span_min = int((end - rec.clock_in_at).total_seconds() // 60)
    return max(0, span_min - (rec.total_break_minutes or 0))


def _record_break_minutes(rec: AttendanceRecord) -> int:
    """Total break minutes including any in-flight break (capped at now).

    Falls back to the persisted ``total_break_minutes`` when no live
    aggregation is needed (e.g. completed records).
    """
    if rec.status == AttendanceRecord.Status.COMPLETED:
        return rec.total_break_minutes or 0
    total = 0
    now = django_tz.now()
    for br in BreakRecord.objects.filter(attendance_record=rec):
        if not br.started_at:
            continue
        ended = br.ended_at or now
        total += max(0, int((ended - br.started_at).total_seconds() // 60))
    # Persisted total_break_minutes already captures finished breaks; the
    # live loop subsumes them, so prefer the live number when it is non-zero.
    return total or (rec.total_break_minutes or 0)


def aggregate_weekly(membership, company) -> WeeklyAggregate:
    """Aggregate the current ISO week (company tz) for ``membership``."""
    local_today = services.local_now(company).date()
    week_start, week_end = _iso_week_bounds(local_today)

    schedule = services.get_or_default_schedule(membership)
    daily_regular = _schedule_daily_regular_minutes(schedule)

    qs = AttendanceRecord.objects.filter(
        membership=membership,
        work_date__gte=week_start,
        work_date__lte=week_end,
    )

    regular = 0
    overtime = 0
    breaks = 0
    days_worked = 0

    for rec in qs:
        worked = _record_work_minutes(rec)
        if worked <= 0 and rec.clock_in_at is None:
            continue
        days_worked += 1
        breaks += _record_break_minutes(rec)
        if daily_regular > 0 and worked > daily_regular:
            regular += daily_regular
            overtime += worked - daily_regular
        else:
            regular += worked

    return WeeklyAggregate(
        week_start=week_start,
        week_end=week_end,
        regular_minutes=regular,
        overtime_minutes=overtime,
        break_minutes=breaks,
        days_worked=days_worked,
    )


# ---------- Endpoints ----------


@extend_schema(
    summary="Weekly attendance aggregate (current ISO week, company tz)",
    responses={200: WeeklyStatsResponseSerializer},
    tags=["attendance-stats"],
)
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveMember])
def weekly_stats(request):
    """``GET /v1/attendance/stats/weekly`` — F-EMPLOYEE-012 KPI source.

    Returns regular / overtime / break minutes and days worked for the
    current ISO week (Mon..Sun in the company timezone). Empty weeks
    return all zeros so the FE can render dashes safely.
    """
    agg = aggregate_weekly(request.membership, request.company)
    return Response({"data": agg.to_dict()})


@extend_schema(
    summary="Today's attendance stats (FE-flat shape)",
    responses={200: TodayStatsResponseSerializer},
    tags=["attendance-stats"],
)
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveMember])
def today_stats(request):
    """``GET /v1/attendance/stats/today`` — flat KPI shape for m-home.

    Mirrors the contract used by the FE MSW handler: ``work_minutes`` /
    ``break_minutes`` flat fields plus an ``is_clocked_in`` boolean
    derived from record status. Returns zeros / nulls when the user has
    not yet clocked in today.
    """
    rec = services.get_today_record(request.membership, request.company)
    if rec is None:
        return Response(
            {
                "data": {
                    "clock_in_at": None,
                    "clock_out_at": None,
                    "work_minutes": 0,
                    "break_minutes": 0,
                    "is_clocked_in": False,
                }
            }
        )
    return Response(
        {
            "data": {
                "clock_in_at": rec.clock_in_at.isoformat() if rec.clock_in_at else None,
                "clock_out_at": rec.clock_out_at.isoformat() if rec.clock_out_at else None,
                "work_minutes": _record_work_minutes(rec),
                "break_minutes": _record_break_minutes(rec),
                "is_clocked_in": rec.status != AttendanceRecord.Status.COMPLETED
                and rec.clock_in_at is not None,
            }
        }
    )
