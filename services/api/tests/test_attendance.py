from __future__ import annotations

import uuid
from datetime import date, datetime, timedelta, timezone

import pytest
from django.core.cache import cache
from django.utils import timezone as django_tz
from freezegun import freeze_time
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.attendance.models import AttendanceRecord, BreakRecord, OvertimeRequest
from apps.attendance import services as att_services
from apps.approval.models import ApprovalTask

from tests.factories import (
    AttendanceRecordFactory,
    CompanyFactory,
    LocationFactory,
    MembershipFactory,
    UserFactory,
    WorkScheduleFactory,
)

pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def _clear_cache():
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def client():
    return APIClient()


def _auth(client, user):
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return client


@pytest.fixture
def company():
    return CompanyFactory()


@pytest.fixture
def office_location(company):
    return LocationFactory(company=company, latitude="37.500000", longitude="127.000000", radius_m=150)


@pytest.fixture
def member(company):
    user = UserFactory()
    m = MembershipFactory(company=company, user=user)
    WorkScheduleFactory(membership=m)
    return m


@pytest.fixture
def auth_client(client, member):
    return _auth(client, member.user)


# ---------- Pure function tests ----------

def test_haversine_known_distance():
    # Roughly 111km between 1 degree of latitude
    d = att_services.haversine_m(37.0, 127.0, 38.0, 127.0)
    assert 110_000 < d < 112_000


def test_haversine_zero():
    assert att_services.haversine_m(37.5, 127.0, 37.5, 127.0) == pytest.approx(0.0, abs=1e-6)


# ---------- Clock-in success ----------

def test_clock_in_success_returns_201_with_record(auth_client, office_location):
    payload = {
        "kind": "OFFICE",
        "location": {"latitude": 37.5000, "longitude": 127.0000, "accuracy_m": 5},
    }
    r = auth_client.post("/v1/attendance/clock-in", payload, format="json")
    assert r.status_code == 201, r.content
    body = r.json()["data"]
    assert body["record_id"]
    assert body["matched_location"]["id"] == str(office_location.id)
    assert body["status"] == "WORKING"
    assert body["clock_in_at"] is not None


# ---------- Location out of range ----------

def test_clock_in_out_of_range_returns_422(auth_client, office_location):
    payload = {
        "kind": "OFFICE",
        "location": {"latitude": 35.0, "longitude": 125.0},
    }
    r = auth_client.post("/v1/attendance/clock-in", payload, format="json")
    assert r.status_code == 422, r.content
    err = r.json()["error"]
    assert err["code"] == "LOCATION_OUT_OF_RANGE"


def test_manual_request_creates_approval_task(auth_client, member):
    r = auth_client.post(
        "/v1/attendance/manual-request",
        {"reason": "회사 외부 출장"},
        format="json",
    )
    assert r.status_code == 201, r.content
    task_id = r.json()["data"]["approval_task_id"]
    task = ApprovalTask.objects.get(id=task_id)
    assert task.target_type == ApprovalTask.TargetType.MANUAL_CLOCK_IN
    assert task.requester_id == member.id
    assert task.status == ApprovalTask.Status.PENDING


# ---------- Duplicate clock-in ----------

def test_duplicate_clock_in_returns_409(auth_client, office_location):
    payload = {
        "kind": "OFFICE",
        "location": {"latitude": 37.5, "longitude": 127.0},
    }
    r1 = auth_client.post("/v1/attendance/clock-in", payload, format="json")
    assert r1.status_code == 201
    r2 = auth_client.post("/v1/attendance/clock-in", payload, format="json")
    assert r2.status_code == 409, r2.content
    assert r2.json()["error"]["code"] == "ALREADY_CLOCKED_IN"


# ---------- Idempotency replay ----------

def test_idempotency_replay_returns_same_record_id(auth_client, office_location):
    payload = {
        "kind": "OFFICE",
        "location": {"latitude": 37.5, "longitude": 127.0},
    }
    headers = {"HTTP_IDEMPOTENCY_KEY": str(uuid.uuid4())}
    r1 = auth_client.post("/v1/attendance/clock-in", payload, format="json", **headers)
    assert r1.status_code == 201, r1.content
    rid1 = r1.json()["data"]["record_id"]

    r2 = auth_client.post("/v1/attendance/clock-in", payload, format="json", **headers)
    assert r2.status_code == 200, r2.content
    rid2 = r2.json()["data"]["record_id"]
    assert rid1 == rid2
    assert AttendanceRecord.objects.filter(id=rid1).count() == 1


# ---------- Today endpoint ----------

def test_today_returns_null_when_no_record(auth_client):
    r = auth_client.get("/v1/attendance/today")
    assert r.status_code == 200
    assert r.json()["data"] is None


def test_today_returns_record_after_clock_in(auth_client, office_location):
    auth_client.post(
        "/v1/attendance/clock-in",
        {"kind": "OFFICE", "location": {"latitude": 37.5, "longitude": 127.0}},
        format="json",
    )
    r = auth_client.get("/v1/attendance/today")
    assert r.status_code == 200
    assert r.json()["data"]["status"] == "WORKING"


# ---------- Break flow ----------

def test_break_flow_aggregates_minutes(auth_client, member, office_location):
    # clock-in
    r = auth_client.post(
        "/v1/attendance/clock-in",
        {"kind": "OFFICE", "location": {"latitude": 37.5, "longitude": 127.0}},
        format="json",
    )
    assert r.status_code == 201
    rid = r.json()["data"]["record_id"]

    # break start
    r2 = auth_client.post("/v1/attendance/break/start", {}, format="json")
    assert r2.status_code == 201, r2.content
    br_id = r2.json()["data"]["id"]

    # manually shift the started_at backwards to simulate elapsed time
    br = BreakRecord.objects.get(id=br_id)
    br.started_at = django_tz.now() - timedelta(minutes=20)
    br.save(update_fields=["started_at"])

    r3 = auth_client.post("/v1/attendance/break/end", {}, format="json")
    assert r3.status_code == 200, r3.content

    rec = AttendanceRecord.objects.get(id=rid)
    assert rec.status == "WORKING"
    assert 19 <= rec.total_break_minutes <= 21


def test_break_start_requires_active_clock_in(auth_client):
    r = auth_client.post("/v1/attendance/break/start", {}, format="json")
    assert r.status_code == 409
    assert r.json()["error"]["code"] == "NO_ACTIVE_ATTENDANCE"


# ---------- Clock-out total work minutes ----------

def test_clock_out_computes_work_minutes(auth_client, office_location):
    r = auth_client.post(
        "/v1/attendance/clock-in",
        {"kind": "OFFICE", "location": {"latitude": 37.5, "longitude": 127.0}},
        format="json",
    )
    rid = r.json()["data"]["record_id"]

    # shift clock-in 8 hours back
    rec = AttendanceRecord.objects.get(id=rid)
    rec.clock_in_at = django_tz.now() - timedelta(hours=8)
    rec.save(update_fields=["clock_in_at"])

    # add a 30 min break in the past
    BreakRecord.objects.create(
        attendance_record=rec,
        started_at=django_tz.now() - timedelta(hours=4),
        ended_at=django_tz.now() - timedelta(hours=4) + timedelta(minutes=30),
    )

    r2 = auth_client.post("/v1/attendance/clock-out", {}, format="json")
    assert r2.status_code == 200, r2.content
    body = r2.json()["data"]
    assert body["status"] == "COMPLETED"
    # ~ 8*60 - 30 = 450 (allow ~1 minute slack from clock skew during call)
    assert 448 <= body["total_work_minutes"] <= 452


def test_clock_out_without_clock_in_returns_409(auth_client):
    r = auth_client.post("/v1/attendance/clock-out", {}, format="json")
    assert r.status_code == 409
    assert r.json()["error"]["code"] == "NO_ACTIVE_ATTENDANCE"


# ---------- Records list / detail / cursor ----------

def test_records_list_and_detail(auth_client, member):
    today = date.today()
    for i in range(3):
        AttendanceRecordFactory(
            membership=member,
            company=member.company,
            work_date=today - timedelta(days=i + 1),
            clock_in_at=django_tz.now() - timedelta(days=i + 1),
        )
    r = auth_client.get("/v1/attendance/records?limit=2")
    assert r.status_code == 200
    body = r.json()
    assert len(body["data"]) == 2
    assert body["meta"]["has_more"] is True

    next_cur = body["meta"]["next_cursor"]
    r2 = auth_client.get(f"/v1/attendance/records?limit=2&cursor={next_cur}")
    assert r2.status_code == 200
    assert len(r2.json()["data"]) >= 1

    rid = body["data"][0]["id"]
    r3 = auth_client.get(f"/v1/attendance/records/{rid}")
    assert r3.status_code == 200
    assert r3.json()["data"]["id"] == rid


# ---------- Permissions ----------

def test_endpoints_require_active_membership(client):
    user = UserFactory()
    _auth(client, user)
    r = client.get("/v1/attendance/today")
    assert r.status_code == 403


def test_endpoints_require_authentication(client):
    r = client.get("/v1/attendance/today")
    assert r.status_code == 401


# ---------- Overtime ----------

def test_overtime_create_and_list(auth_client, member):
    r = auth_client.post(
        "/v1/overtime/requests",
        {"requested_minutes": 90, "reason": "장애 대응"},
        format="json",
    )
    assert r.status_code == 201, r.content
    ot_id = r.json()["data"]["id"]
    assert OvertimeRequest.objects.filter(id=ot_id).exists()
    # An ApprovalTask should be enqueued
    assert ApprovalTask.objects.filter(
        target_type=ApprovalTask.TargetType.OVERTIME, target_id=ot_id
    ).exists()

    r2 = auth_client.get("/v1/overtime/requests")
    assert r2.status_code == 200
    assert any(item["id"] == ot_id for item in r2.json()["data"])


def test_overtime_cancel(auth_client):
    r = auth_client.post(
        "/v1/overtime/requests",
        {"requested_minutes": 60},
        format="json",
    )
    ot_id = r.json()["data"]["id"]
    r2 = auth_client.post(f"/v1/overtime/requests/{ot_id}/cancel", {}, format="json")
    assert r2.status_code == 200
    assert r2.json()["data"]["status"] == "CANCELLED"


# ---------- Late detection ----------

def test_is_late_after_grace_period(member):
    sched = att_services.get_or_default_schedule(member)
    # 9:11 local time (after 9:10 grace)
    local_dt = datetime(2026, 5, 4, 9, 11, tzinfo=att_services.company_tz(member.company))
    assert att_services.is_late(sched, local_dt) is True


def test_is_not_late_within_grace(member):
    sched = att_services.get_or_default_schedule(member)
    local_dt = datetime(2026, 5, 4, 9, 5, tzinfo=att_services.company_tz(member.company))
    assert att_services.is_late(sched, local_dt) is False
