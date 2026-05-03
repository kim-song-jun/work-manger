"""Attendance domain builders — Builder pattern.

Encapsulates the construction + validation of `AttendanceRecord` for clock-in
and clock-out. Service layer composes these with idempotency, persistence, and
notifications.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, time
from decimal import Decimal
from math import asin, cos, radians, sin, sqrt
from typing import Optional

from django.utils import timezone as django_tz

from apps.identity.models import Location, Membership

from core.builders import Builder


# ─── Errors local to the builder ──────────────────────────────
class LocationOutOfRange(ValueError):
    pass


class InvalidClockInPayload(ValueError):
    pass


# ─── Validated value object returned by build_clock_in ────────
@dataclass(frozen=True)
class ClockInPlan:
    """Pure value object describing what should be persisted.

    The Service layer turns this into ORM rows inside a transaction.
    Keeping this as a dataclass keeps the Builder decoupled from the DB.
    """

    membership: Membership
    work_date: object  # date
    clock_in_at: datetime
    matched_location: Optional[Location]
    kind: str  # 'OFFICE' | 'WFH' | 'MANUAL'
    is_late: bool


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6_371_000  # earth radius m
    p1, p2 = radians(lat1), radians(lat2)
    dphi = radians(lat2 - lat1)
    dlmb = radians(lon2 - lon1)
    a = sin(dphi / 2) ** 2 + cos(p1) * cos(p2) * sin(dlmb / 2) ** 2
    return 2 * R * asin(sqrt(a))


class ClockInBuilder(Builder[ClockInPlan]):
    """Fluent construction of a validated clock-in plan.

        plan = (
            ClockInBuilder(membership)
              .at_location(lat, lon, accuracy_m=20)
              .with_kind("OFFICE")
              .at(client_time)
              .build()
        )
    """

    def __init__(self, membership: Membership) -> None:
        self._membership = membership
        self._lat: float | None = None
        self._lon: float | None = None
        self._accuracy: float | None = None
        self._kind: str = "OFFICE"
        self._client_time: datetime | None = None
        self._allow_manual: bool = False
        self._scheduled_start: time | None = None
        self._available_locations: list[Location] | None = None

    # ── chainable setters ───────────────────────────────────
    def at_location(self, latitude: float, longitude: float, accuracy_m: float | None = None):
        self._lat, self._lon = float(latitude), float(longitude)
        self._accuracy = float(accuracy_m) if accuracy_m is not None else None
        return self

    def with_kind(self, kind: str):
        self._kind = kind
        return self

    def at(self, when: datetime | None):
        if when is not None and django_tz.is_naive(when):
            when = django_tz.make_aware(when, django_tz.get_current_timezone())
        self._client_time = when
        return self

    def allow_manual(self, flag: bool = True):
        self._allow_manual = flag
        return self

    def with_schedule(self, start: time | None):
        self._scheduled_start = start
        return self

    def with_available_locations(self, locations: list[Location]):
        self._available_locations = list(locations)
        return self

    # ── validation ──────────────────────────────────────────
    def _validate(self) -> None:
        if self._kind not in ("OFFICE", "WFH", "MANUAL"):
            raise InvalidClockInPayload(f"unknown kind: {self._kind}")
        if self._kind == "MANUAL" and not self._allow_manual:
            raise InvalidClockInPayload("manual clock-in requires approval")
        if self._kind == "OFFICE":
            if self._lat is None or self._lon is None:
                raise InvalidClockInPayload("office clock-in requires location")
            if self._available_locations is None:
                raise InvalidClockInPayload("available locations not provided")

    # ── build ───────────────────────────────────────────────
    def _build(self) -> ClockInPlan:
        ts = self._client_time or django_tz.now()
        matched: Location | None = None
        if self._kind == "OFFICE":
            matched = self._match_location()
            if matched is None:
                raise LocationOutOfRange("no office location within radius")
        elif self._kind == "WFH":
            # Allow optional WFH match for analytics
            matched = self._match_location(kind_filter="WFH")

        is_late = False
        if self._scheduled_start is not None:
            tz = django_tz.get_current_timezone()
            local_ts = ts.astimezone(tz)
            scheduled = local_ts.replace(
                hour=self._scheduled_start.hour,
                minute=self._scheduled_start.minute,
                second=0,
                microsecond=0,
            )
            grace = 10 * 60  # 10 min grace
            is_late = (local_ts - scheduled).total_seconds() > grace

        return ClockInPlan(
            membership=self._membership,
            work_date=django_tz.localdate(ts),
            clock_in_at=ts,
            matched_location=matched,
            kind=self._kind,
            is_late=is_late,
        )

    def _match_location(self, kind_filter: str | None = None) -> Location | None:
        if self._lat is None or self._lon is None:
            return None
        candidates = self._available_locations or []
        if kind_filter is not None:
            candidates = [l for l in candidates if l.kind == kind_filter]
        for loc in candidates:
            d = haversine_m(self._lat, self._lon, float(loc.latitude), float(loc.longitude))
            if d <= loc.radius_m + (self._accuracy or 0):
                return loc
        return None


# ─── Clock-out ────────────────────────────────────────────────


class NoOpenAttendance(ValueError):
    pass


class InvalidClockOutPayload(ValueError):
    pass


@dataclass(frozen=True)
class BreakSpan:
    """Lightweight projection of a BreakRecord used by the builder.

    Service layer feeds these in via :meth:`ClockOutBuilder.with_breaks` so the
    builder stays decoupled from the ORM.
    """

    started_at: datetime
    ended_at: datetime | None


@dataclass(frozen=True)
class ClockOutPlan:
    """Pure value object describing a validated clock-out outcome.

    Fields:
      - ``clock_out_at``: timezone-aware datetime to persist
      - ``total_break_minutes``: aggregated from supplied :class:`BreakSpan` rows
      - ``total_work_minutes``: span(in→out) − breaks, clamped at 0
      - ``is_early_leave``: True iff clock-out is strictly before scheduled end
      - ``open_break_to_close``: an open BreakSpan the service must close, if any
    """

    membership: Membership
    clock_in_at: datetime
    clock_out_at: datetime
    total_break_minutes: int
    total_work_minutes: int
    is_early_leave: bool
    open_break_to_close: BreakSpan | None


class ClockOutBuilder(Builder[ClockOutPlan]):
    """Fluent construction of a validated clock-out plan.

        plan = (
            ClockOutBuilder(membership)
              .with_open_record(clock_in_at, status)
              .with_breaks(break_spans)
              .with_schedule(end_time)
              .at(now)
              .build()
        )

    Validation rules (mirror the service layer):
      - An "open" attendance record must exist (clock_in_at set, status != COMPLETED).
      - clock_out_at must be ≥ clock_in_at.
      - is_early_leave is True iff clock_out (in company tz) < scheduled end of day.
    """

    def __init__(self, membership: Membership) -> None:
        self._membership = membership
        self._clock_in_at: datetime | None = None
        self._status: str | None = None
        self._client_time: datetime | None = None
        self._breaks: list[BreakSpan] = []
        self._scheduled_end: time | None = None

    # ── chainable setters ───────────────────────────────────
    def with_open_record(self, clock_in_at: datetime | None, status: str | None):
        self._clock_in_at = clock_in_at
        self._status = status
        return self

    def with_breaks(self, breaks):
        self._breaks = list(breaks or [])
        return self

    def with_schedule(self, end: time | None):
        self._scheduled_end = end
        return self

    def at(self, when: datetime | None):
        if when is not None and django_tz.is_naive(when):
            when = django_tz.make_aware(when, django_tz.get_current_timezone())
        self._client_time = when
        return self

    # ── validation ──────────────────────────────────────────
    def _validate(self) -> None:
        if self._clock_in_at is None:
            raise NoOpenAttendance("no active clock-in record")
        if self._status == "COMPLETED":
            raise InvalidClockOutPayload("attendance already completed")

    # ── build ───────────────────────────────────────────────
    def _build(self) -> ClockOutPlan:
        out_at = self._client_time or django_tz.now()
        in_at = self._clock_in_at  # type: ignore[assignment]
        if out_at < in_at:  # type: ignore[operator]
            raise InvalidClockOutPayload("clock_out precedes clock_in")

        # Aggregate break minutes; an open break (no ended_at) is treated as
        # closing at clock-out time.
        open_to_close: BreakSpan | None = None
        total_break = 0
        for br in self._breaks:
            ended = br.ended_at
            if ended is None:
                ended = out_at
                open_to_close = br
            if br.started_at and ended:
                delta = int((ended - br.started_at).total_seconds() // 60)
                total_break += max(0, delta)

        span_min = int((out_at - in_at).total_seconds() // 60)
        total_work = max(0, span_min - total_break)

        is_early = False
        if self._scheduled_end is not None:
            tz = django_tz.get_current_timezone()
            local_out = out_at.astimezone(tz)
            scheduled_end_dt = local_out.replace(
                hour=self._scheduled_end.hour,
                minute=self._scheduled_end.minute,
                second=0,
                microsecond=0,
            )
            is_early = local_out < scheduled_end_dt

        return ClockOutPlan(
            membership=self._membership,
            clock_in_at=in_at,
            clock_out_at=out_at,
            total_break_minutes=total_break,
            total_work_minutes=total_work,
            is_early_leave=is_early,
            open_break_to_close=open_to_close,
        )
