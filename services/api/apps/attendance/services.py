"""
Pure-ish service functions for the Attendance domain.

Conventions
-----------
- All datetimes stored as UTC (settings.USE_TZ=True).
- Business rule comparisons (late, work_date) are done in the company timezone.
- Idempotency via Django cache (Redis-backed in deployed envs):
    key = f"idem:clock-in:{membership_id}:{key_header}"
    value = {"record_id": "<uuid>"}
    ttl = 24h
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
from typing import Optional
from zoneinfo import ZoneInfo

from django.core.cache import cache
from django.db import IntegrityError, transaction
from django.utils import timezone as django_tz

from apps.identity.models import Company, Location, Membership

from .builders import (
    BreakSpan,
    ClockInBuilder,
    ClockOutBuilder,
    InvalidClockInPayload as BuilderInvalidPayload,
    InvalidClockOutPayload as BuilderInvalidClockOut,
    LocationOutOfRange as BuilderLocationOutOfRange,
    NoOpenAttendance as BuilderNoOpenAttendance,
)
from .models import AttendanceRecord, BreakRecord, WorkSchedule

IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24  # 24h
LATE_GRACE_MINUTES = 10
LOCATION_DEFAULT_RADIUS_M = 100


def _broadcast_team_status(company: Company, membership: Membership, record: "AttendanceRecord") -> None:
    """Best-effort WS push to ``team:{company_id}`` after clock-in/out."""
    try:
        from apps.realtime import broadcast as _ws_broadcast

        if record.status == AttendanceRecord.Status.COMPLETED:
            new_status = "off"
        elif record.status == AttendanceRecord.Status.ON_BREAK:
            new_status = "break"
        elif record.clock_in_kind == AttendanceRecord.Kind.WFH:
            new_status = "wfh"
        else:
            new_status = "office"
        _ws_broadcast.notify_team(
            company,
            "team.status.changed",
            {
                "membership_id": str(membership.id),
                "status": new_status,
                "clock_in_at": record.clock_in_at.isoformat() if record.clock_in_at else None,
                "clock_out_at": record.clock_out_at.isoformat() if record.clock_out_at else None,
            },
        )
    except Exception:  # noqa: BLE001
        pass


# ---------- Errors ----------

class AttendanceError(Exception):
    code = "ATTENDANCE_ERROR"
    http_status = 400
    message = ""

    def __init__(self, message: str = "", details: Optional[dict] = None):
        super().__init__(message or self.message)
        self.message = message or self.message
        self.details = details or {}


class AlreadyClockedIn(AttendanceError):
    code = "ALREADY_CLOCKED_IN"
    http_status = 409
    message = "이미 오늘 출근 기록이 있습니다."


class LocationOutOfRange(AttendanceError):
    code = "LOCATION_OUT_OF_RANGE"
    http_status = 422
    message = "등록된 위치 반경을 벗어났습니다."


class ManualApprovalRequired(AttendanceError):
    code = "MANUAL_APPROVAL_REQUIRED"
    http_status = 409
    message = "수동 출근 승인이 필요합니다."


class IdempotencyKeyConflict(AttendanceError):
    code = "IDEMPOTENCY_KEY_CONFLICT"
    http_status = 409
    message = "동일 키에 다른 페이로드가 사용되었습니다."


class NoActiveAttendance(AttendanceError):
    code = "NO_ACTIVE_ATTENDANCE"
    http_status = 409
    message = "진행 중인 근무 기록이 없습니다."


class InvalidState(AttendanceError):
    code = "INVALID_STATE"
    http_status = 409
    message = "현재 상태에서 수행할 수 없습니다."


# ---------- Geo / location ----------

def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in meters between two lat/lon points."""
    r = 6_371_000.0  # earth radius m
    p1 = math.radians(lat1)
    p2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


@dataclass
class LocationMatch:
    location: Optional[Location]
    distance_m: Optional[float]
    in_range: bool


def find_matching_location(
    company: Company,
    *,
    latitude: float,
    longitude: float,
    kind: str,
) -> LocationMatch:
    """Return the closest registered location of given kind, with in-range flag."""
    qs = company.locations.filter(kind=kind)
    best: Optional[Location] = None
    best_dist: Optional[float] = None
    for loc in qs:
        d = haversine_m(latitude, longitude, float(loc.latitude), float(loc.longitude))
        if best_dist is None or d < best_dist:
            best_dist = d
            best = loc
    if best is None:
        return LocationMatch(None, None, False)
    radius = best.radius_m or LOCATION_DEFAULT_RADIUS_M
    return LocationMatch(best, best_dist, (best_dist or 0) <= radius)


# ---------- Time / schedule ----------

def company_tz(company: Company) -> ZoneInfo:
    return ZoneInfo(company.timezone or "Asia/Seoul")


def local_now(company: Company) -> datetime:
    return django_tz.now().astimezone(company_tz(company))


def work_date_for(company: Company, when_utc: datetime) -> date:
    return when_utc.astimezone(company_tz(company)).date()


def get_or_default_schedule(membership: Membership) -> WorkSchedule:
    sched = WorkSchedule.objects.filter(membership=membership).first()
    if sched is not None:
        return sched
    # ephemeral default if not configured (do NOT persist here)
    return WorkSchedule(
        membership=membership,
        start_time=time(9, 0),
        end_time=time(18, 0),
        break_minutes=60,
        work_days=[1, 2, 3, 4, 5],
    )


def is_late(schedule: WorkSchedule, clock_in_local: datetime) -> bool:
    grace_end = (
        datetime.combine(clock_in_local.date(), schedule.start_time)
        + timedelta(minutes=LATE_GRACE_MINUTES)
    )
    return clock_in_local.replace(tzinfo=None) > grace_end


def is_early_leave(schedule: WorkSchedule, clock_out_local: datetime) -> bool:
    end_dt = datetime.combine(clock_out_local.date(), schedule.end_time)
    return clock_out_local.replace(tzinfo=None) < end_dt


# ---------- Break aggregation / work minutes ----------

def aggregate_break_minutes(record: AttendanceRecord) -> int:
    total = 0
    # bypass any prefetch cache for fresh aggregation
    for br in BreakRecord.objects.filter(attendance_record=record):
        if br.started_at and br.ended_at:
            total += int((br.ended_at - br.started_at).total_seconds() // 60)
    return total


def compute_total_work_minutes(record: AttendanceRecord) -> Optional[int]:
    if not record.clock_in_at or not record.clock_out_at:
        return None
    span_min = int((record.clock_out_at - record.clock_in_at).total_seconds() // 60)
    return max(0, span_min - (record.total_break_minutes or 0))


# ---------- Idempotency ----------

def _idem_key(membership_id, key_header: str) -> str:
    return f"idem:clock-in:{membership_id}:{key_header}"


def get_idempotent_record(membership_id, key_header: str) -> Optional[AttendanceRecord]:
    if not key_header:
        return None
    cached = cache.get(_idem_key(membership_id, key_header))
    if not cached:
        return None
    rid = cached.get("record_id") if isinstance(cached, dict) else None
    if not rid:
        return None
    return AttendanceRecord.objects.filter(id=rid).first()


def store_idempotent_record(membership_id, key_header: str, record_id) -> None:
    if not key_header:
        return
    cache.set(
        _idem_key(membership_id, key_header),
        {"record_id": str(record_id)},
        timeout=IDEMPOTENCY_TTL_SECONDS,
    )


# ---------- Clock-in / out / break ----------

@dataclass
class ClockInResult:
    record: AttendanceRecord
    matched_location: Optional[Location]
    replayed: bool = False


def clock_in(
    *,
    membership: Membership,
    company: Company,
    latitude: Optional[float],
    longitude: Optional[float],
    kind: str,
    client_time: Optional[datetime] = None,
    idempotency_key: str = "",
    allow_manual: bool = False,
) -> ClockInResult:
    """
    Idempotent clock-in.

    - `kind`: OFFICE | WFH | MANUAL
    - When kind == MANUAL, location validation is skipped (caller must have
      an approved manual request OR pass allow_manual=True for staff-side flows).
    - Otherwise: validate against company locations of `kind`. If out of range,
      raises LocationOutOfRange (caller can then call manual-request flow).
    """
    # 1) replay check
    replayed = get_idempotent_record(membership.id, idempotency_key)
    if replayed is not None:
        return ClockInResult(
            record=replayed,
            matched_location=replayed.clock_in_location,
            replayed=True,
        )

    # 2) Pre-validate kind and location matching at the service layer to
    #    preserve existing error details (nearest_location_id / distance_m)
    #    and the closest-pick semantics. The Builder is then handed an
    #    already-narrowed candidate list so its match is identical.
    available_locations: list[Location] = []
    if kind in (AttendanceRecord.Kind.OFFICE, AttendanceRecord.Kind.WFH):
        if latitude is None or longitude is None:
            raise LocationOutOfRange("위치 정보가 필요합니다.")
        match = find_matching_location(
            company, latitude=latitude, longitude=longitude, kind=kind
        )
        if not match.in_range:
            raise LocationOutOfRange(
                "등록된 위치 반경을 벗어났습니다.",
                details={
                    "nearest_location_id": str(match.location.id) if match.location else None,
                    "distance_m": match.distance_m,
                },
            )
        available_locations = [match.location] if match.location else []
    elif kind == AttendanceRecord.Kind.MANUAL:
        if not allow_manual:
            raise ManualApprovalRequired()
    else:
        raise AttendanceError("지원하지 않는 출근 종류입니다.")

    # 3) Compose the validated plan via the Builder. Builder must NOT touch
    #    the DB; it returns a ClockInPlan value object.
    schedule = get_or_default_schedule(membership)
    builder = (
        ClockInBuilder(membership)
        .with_kind(kind)
        .with_schedule(schedule.start_time)
        .allow_manual(allow_manual)
    )
    if latitude is not None and longitude is not None:
        builder = builder.at_location(latitude, longitude)
    if available_locations:
        builder = builder.with_available_locations(available_locations)
    if client_time is not None:
        builder = builder.at(client_time)

    try:
        plan = builder.build()
    except BuilderLocationOutOfRange as exc:
        # Preserve existing service-level error semantics / HTTP code.
        raise LocationOutOfRange(str(exc) or LocationOutOfRange.message) from exc
    except BuilderInvalidPayload as exc:
        raise InvalidState(str(exc) or InvalidState.message) from exc

    # 4) Persist within transaction; preserve uniqueness -> AlreadyClockedIn.
    #    Recompute is_late at the service layer to keep prior semantics
    #    (server clock + grace), independent of any client_time supplied.
    now = django_tz.now()
    work_date = work_date_for(company, now)
    clock_in_local = now.astimezone(company_tz(company))
    late = is_late(schedule, clock_in_local)
    matched = plan.matched_location

    try:
        with transaction.atomic():
            record = AttendanceRecord.objects.create(
                company=company,
                membership=membership,
                work_date=work_date,
                clock_in_at=now,
                clock_in_location=matched,
                clock_in_kind=plan.kind,
                is_late=late,
                status=AttendanceRecord.Status.WORKING,
            )
    except IntegrityError as exc:
        raise AlreadyClockedIn() from exc

    store_idempotent_record(membership.id, idempotency_key, record.id)
    _broadcast_team_status(company, membership, record)
    return ClockInResult(record=record, matched_location=matched, replayed=False)


def get_today_record(membership: Membership, company: Company) -> Optional[AttendanceRecord]:
    today = work_date_for(company, django_tz.now())
    return (
        AttendanceRecord.objects.filter(membership=membership, work_date=today)
        .prefetch_related("breaks")
        .first()
    )


def clock_out(*, membership: Membership, company: Company) -> AttendanceRecord:
    """Idempotent-ish clock-out using :class:`ClockOutBuilder`.

    The builder owns the validation + computation; this service:
      1. resolves today's record + break list,
      2. composes the builder, mapping its errors to the existing service codes,
      3. persists the resulting :class:`ClockOutPlan` inside one transaction.
    """
    rec = get_today_record(membership, company)
    if rec is None or rec.clock_in_at is None:
        raise NoActiveAttendance()

    schedule = get_or_default_schedule(membership)
    break_rows = list(BreakRecord.objects.filter(attendance_record=rec))
    spans = [BreakSpan(started_at=br.started_at, ended_at=br.ended_at) for br in break_rows]

    builder = (
        ClockOutBuilder(membership)
        .with_open_record(rec.clock_in_at, rec.status)
        .with_breaks(spans)
        .with_schedule(schedule.end_time)
        .at(django_tz.now())
    )
    try:
        plan = builder.build()
    except BuilderNoOpenAttendance as exc:
        raise NoActiveAttendance() from exc
    except BuilderInvalidClockOut as exc:
        if "completed" in str(exc):
            raise InvalidState("이미 퇴근 처리되었습니다.") from exc
        raise InvalidState(str(exc) or InvalidState.message) from exc

    with transaction.atomic():
        if plan.open_break_to_close is not None:
            BreakRecord.objects.filter(
                attendance_record=rec,
                started_at=plan.open_break_to_close.started_at,
                ended_at__isnull=True,
            ).update(ended_at=plan.clock_out_at)

        rec.clock_out_at = plan.clock_out_at
        rec.total_break_minutes = plan.total_break_minutes
        rec.total_work_minutes = plan.total_work_minutes
        rec.is_early_leave = plan.is_early_leave
        rec.status = AttendanceRecord.Status.COMPLETED
        rec.save(
            update_fields=[
                "clock_out_at",
                "total_break_minutes",
                "total_work_minutes",
                "is_early_leave",
                "status",
                "updated_at",
            ]
        )
    _broadcast_team_status(company, membership, rec)
    return rec


def break_start(*, membership: Membership, company: Company) -> BreakRecord:
    rec = get_today_record(membership, company)
    if rec is None or rec.clock_in_at is None:
        raise NoActiveAttendance()
    if rec.status != AttendanceRecord.Status.WORKING:
        raise InvalidState("현재 근무 중이 아닙니다.")
    if rec.breaks.filter(ended_at__isnull=True).exists():
        raise InvalidState("이미 진행 중인 휴게가 있습니다.")
    br = BreakRecord.objects.create(attendance_record=rec, started_at=django_tz.now())
    rec.status = AttendanceRecord.Status.ON_BREAK
    rec.save(update_fields=["status", "updated_at"])
    return br


def break_end(*, membership: Membership, company: Company) -> BreakRecord:
    rec = get_today_record(membership, company)
    if rec is None:
        raise NoActiveAttendance()
    if rec.status != AttendanceRecord.Status.ON_BREAK:
        raise InvalidState("진행 중인 휴게가 없습니다.")
    br = rec.breaks.filter(ended_at__isnull=True).order_by("-started_at").first()
    if br is None:
        raise InvalidState("진행 중인 휴게가 없습니다.")
    br.ended_at = django_tz.now()
    br.save(update_fields=["ended_at"])
    rec.total_break_minutes = aggregate_break_minutes(rec)
    rec.status = AttendanceRecord.Status.WORKING
    rec.save(update_fields=["status", "total_break_minutes", "updated_at"])
    return br
