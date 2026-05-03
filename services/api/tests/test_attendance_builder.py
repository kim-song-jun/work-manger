"""Unit tests for the ClockInBuilder (no DB required where possible)."""
from __future__ import annotations

from datetime import datetime, time

import pytest
from django.utils import timezone as django_tz

from apps.attendance.builders import (
    ClockInBuilder,
    InvalidClockInPayload,
    LocationOutOfRange,
    haversine_m,
)
from tests.factories import LocationFactory, MembershipFactory

pytestmark = pytest.mark.django_db


def test_haversine_known_distance_seoul_busan():
    # Seoul ↔ Busan ~325 km. Allow generous tolerance.
    d = haversine_m(37.5665, 126.9780, 35.1796, 129.0756)
    assert 320_000 < d < 340_000


def test_builder_office_match():
    m = MembershipFactory()
    loc = LocationFactory(company=m.company, latitude=37.5, longitude=127.0, radius_m=100)
    plan = (
        ClockInBuilder(m)
        .at_location(37.50001, 127.00001, accuracy_m=10)
        .with_kind("OFFICE")
        .with_available_locations([loc])
        .build()
    )
    assert plan.matched_location_id if False else plan.matched_location.id == loc.id
    assert plan.kind == "OFFICE"
    assert plan.is_late is False  # no schedule supplied


def test_builder_office_out_of_range_raises():
    m = MembershipFactory()
    loc = LocationFactory(company=m.company, latitude=37.5, longitude=127.0, radius_m=50)
    with pytest.raises(LocationOutOfRange):
        (
            ClockInBuilder(m)
            .at_location(38.0, 128.0)
            .with_kind("OFFICE")
            .with_available_locations([loc])
            .build()
        )


def test_builder_office_requires_location():
    m = MembershipFactory()
    with pytest.raises(InvalidClockInPayload):
        ClockInBuilder(m).with_kind("OFFICE").with_available_locations([]).build()


def test_builder_manual_requires_allow_flag():
    m = MembershipFactory()
    with pytest.raises(InvalidClockInPayload):
        ClockInBuilder(m).with_kind("MANUAL").build()
    plan = ClockInBuilder(m).with_kind("MANUAL").allow_manual().build()
    assert plan.kind == "MANUAL"


def test_builder_late_detection():
    m = MembershipFactory()
    loc = LocationFactory(company=m.company)
    tz = django_tz.get_current_timezone()
    late_ts = django_tz.make_aware(datetime(2026, 5, 4, 9, 30, 0), tz)  # 30 min late
    plan = (
        ClockInBuilder(m)
        .at_location(float(loc.latitude), float(loc.longitude))
        .with_kind("OFFICE")
        .with_available_locations([loc])
        .with_schedule(time(9, 0))
        .at(late_ts)
        .build()
    )
    assert plan.is_late is True


def test_builder_within_grace_not_late():
    m = MembershipFactory()
    loc = LocationFactory(company=m.company)
    tz = django_tz.get_current_timezone()
    ts = django_tz.make_aware(datetime(2026, 5, 4, 9, 5, 0), tz)
    plan = (
        ClockInBuilder(m)
        .at_location(float(loc.latitude), float(loc.longitude))
        .with_kind("OFFICE")
        .with_available_locations([loc])
        .with_schedule(time(9, 0))
        .at(ts)
        .build()
    )
    assert plan.is_late is False


def test_builder_unknown_kind_rejected():
    m = MembershipFactory()
    with pytest.raises(InvalidClockInPayload):
        ClockInBuilder(m).with_kind("XYZ").build()
