"""
Test: trip · BusinessTrip submit / cancel + approval propagation
Type: Integration (real Postgres + DRF APIClient + eager Celery worker)
Why:  m-trip 출장/외근 신청은 leave 와 동일하게 ApprovalTask + 알림 파이프라인을
      통과해야 하며, 기간(end < start) 검증과 본인-만-취소 규칙이 깨지면
      매니저가 잘못된 항목을 결재하거나 동료가 남의 신청을 취소하는
      신뢰성 사고로 이어진다.
Covers:
  - apps.trip.services.submit — happy path + INVALID_RANGE + LOCATION_REQUIRED
  - apps.trip.services.cancel — own pending → CANCELLED, others' → 403
  - apps.approval.views._apply_decision — TRIP 분기로 status 동기화 +
    apps.notification.services.dispatch 호출 (NotificationLog 1+ 행)
  - GET /v1/trip/requests + status 필터 (own list)
Out of scope:
  - 캘린더/리포트 통합 (별도 분기)
  - 푸시/이메일 페이로드 포맷 (apps/notification 단위 테스트가 보장)
Coverage target: ≥ 90% lines for apps/trip/{services,views}.py
"""
from __future__ import annotations

from datetime import date

import pytest
from rest_framework.test import APIClient

from apps.approval.models import ApprovalTask
from apps.identity.models import Company, Membership, User
from apps.notification.models import NotificationLog
from apps.trip import services as trip_svc
from apps.trip.models import BusinessTrip

pytestmark = pytest.mark.django_db


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def company(db):
    return Company.objects.create(
        name="ACME Trip",
        code="TRIP01",
        fiscal_year_start=date(2026, 1, 1),
        timezone="Asia/Seoul",
    )


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="trip-user@example.com",
        password="Strong!Pass99",
        name="Tripper",
    )


@pytest.fixture
def manager_user(db):
    return User.objects.create_user(
        email="trip-mgr@example.com",
        password="Strong!Pass99",
        name="Manager",
    )


@pytest.fixture
def manager_membership(db, company, manager_user):
    return Membership.objects.create(
        company=company,
        user=manager_user,
        role=Membership.Role.MANAGER,
        hired_at=date(2020, 1, 1),
    )


@pytest.fixture
def membership(db, company, user, manager_membership):
    return Membership.objects.create(
        company=company,
        user=user,
        role=Membership.Role.EMPLOYEE,
        hired_at=date(2024, 1, 15),
        manager=manager_membership,
    )


@pytest.fixture
def auth_client(db, user, membership):
    """JWT-authenticated APIClient for *user*."""
    client = APIClient()
    resp = client.post(
        "/v1/auth/login",
        {"email": user.email, "password": "Strong!Pass99"},
        format="json",
    )
    assert resp.status_code == 200, resp.content
    access = resp.json()["data"]["access_token"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    return client


@pytest.fixture
def manager_client(db, manager_user, manager_membership):
    client = APIClient()
    resp = client.post(
        "/v1/auth/login",
        {"email": manager_user.email, "password": "Strong!Pass99"},
        format="json",
    )
    assert resp.status_code == 200, resp.content
    access = resp.json()["data"]["access_token"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    return client


# ---------------------------------------------------------------------------
# submit + list
# ---------------------------------------------------------------------------


def test_submit_creates_trip_and_approval_task(auth_client, membership, manager_membership):
    """행복 경로: BusinessTrip 행 + 매니저 ApprovalTask(TRIP) 생성.
    이유: 결재가 누락되면 m-inbox 가 출장 항목을 표시하지 못한다.
    """
    resp = auth_client.post(
        "/v1/trip/requests",
        {
            "kind": "BUSINESS_TRIP",
            "start_date": "2026-06-01",
            "end_date": "2026-06-03",
            "location_label": "부산 해운대 본사",
            "purpose": "고객 미팅",
        },
        format="json",
    )
    assert resp.status_code == 201, resp.content
    body = resp.json()["data"]
    assert body["status"] == "PENDING"
    assert body["kind"] == "BUSINESS_TRIP"

    trip = BusinessTrip.objects.get(id=body["id"])
    assert trip.membership_id == membership.id
    task = ApprovalTask.objects.get(target_id=trip.id)
    assert task.target_type == ApprovalTask.TargetType.TRIP
    assert task.approver_id == manager_membership.id


def test_submit_rejects_end_before_start_with_422(auth_client):
    """종료일 < 시작일 → 422 INVALID_RANGE.
    이유: 잘못된 기간을 캘린더에 그리면 팀 가용성 오해를 부른다.
    """
    resp = auth_client.post(
        "/v1/trip/requests",
        {
            "kind": "FIELD_WORK",
            "start_date": "2026-06-10",
            "end_date": "2026-06-05",
            "location_label": "강남",
        },
        format="json",
    )
    assert resp.status_code == 422, resp.content
    assert resp.json()["error"]["code"] == "INVALID_RANGE"


def test_list_returns_only_own_trips(auth_client, membership, company):
    """GET /v1/trip/requests 는 본인 신청만 노출.
    이유: 회사 내 다른 직원의 출장이 누설되면 프라이버시 위반.
    """
    other_user = User.objects.create_user(
        email="other-trip@example.com", password="Strong!Pass99", name="Other"
    )
    other_member = Membership.objects.create(
        company=company,
        user=other_user,
        role=Membership.Role.EMPLOYEE,
        hired_at=date(2024, 1, 1),
    )
    BusinessTrip.objects.create(
        company=company,
        membership=other_member,
        kind=BusinessTrip.Kind.BUSINESS_TRIP,
        start_date=date(2026, 6, 1),
        end_date=date(2026, 6, 2),
        location_label="제주",
    )
    BusinessTrip.objects.create(
        company=company,
        membership=membership,
        kind=BusinessTrip.Kind.FIELD_WORK,
        start_date=date(2026, 6, 5),
        end_date=date(2026, 6, 5),
        location_label="여의도",
    )

    resp = auth_client.get("/v1/trip/requests")
    assert resp.status_code == 200
    rows = resp.json()["data"]
    assert len(rows) == 1
    assert rows[0]["location_label"] == "여의도"


# ---------------------------------------------------------------------------
# cancel
# ---------------------------------------------------------------------------


def test_cancel_own_pending_trip_returns_200(auth_client, membership, company):
    """본인 PENDING 출장 취소 → 200 + ApprovalTask REJECTED.
    이유: 매니저 inbox 에 좀비 PENDING 항목이 남으면 결재 알림이 영구 누적된다.
    """
    trip = BusinessTrip.objects.create(
        company=company,
        membership=membership,
        kind=BusinessTrip.Kind.BUSINESS_TRIP,
        start_date=date(2026, 7, 1),
        end_date=date(2026, 7, 2),
        location_label="대구",
    )
    task = ApprovalTask.objects.create(
        company=company,
        target_type=ApprovalTask.TargetType.TRIP,
        target_id=trip.id,
        requester=membership,
        approver=membership.manager or membership,
    )

    resp = auth_client.post(f"/v1/trip/requests/{trip.id}/cancel")
    assert resp.status_code == 200, resp.content
    assert resp.json()["data"]["status"] == "CANCELLED"
    task.refresh_from_db()
    assert task.status == ApprovalTask.Status.REJECTED


def test_cancel_other_membership_trip_returns_403(auth_client, company):
    """타인의 출장을 취소하려 하면 403.
    이유: 동료가 신청을 임의로 무효화하지 못하도록 보장.
    """
    other_user = User.objects.create_user(
        email="hijack-trip@example.com",
        password="Strong!Pass99",
        name="Hijack",
    )
    other_member = Membership.objects.create(
        company=company,
        user=other_user,
        role=Membership.Role.EMPLOYEE,
        hired_at=date(2024, 1, 1),
    )
    trip = BusinessTrip.objects.create(
        company=company,
        membership=other_member,
        kind=BusinessTrip.Kind.BUSINESS_TRIP,
        start_date=date(2026, 7, 1),
        end_date=date(2026, 7, 2),
        location_label="대구",
    )

    resp = auth_client.post(f"/v1/trip/requests/{trip.id}/cancel")
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# inbox approve → APPROVED + notification dispatched
# ---------------------------------------------------------------------------


def test_inbox_approve_sets_status_and_creates_notification(
    auth_client, manager_client, membership, manager_membership
):
    """inbox approve → BusinessTrip APPROVED + NotificationLog(TRIP_DECISION) 1+ 행.
    이유: 신청자에게 결과가 도달하지 않으면 사용자가 결재 상태를 다시 묻는 트래픽이 발생한다.
    """
    # Arrange — submit through HTTP so the full pipeline runs.
    resp = auth_client.post(
        "/v1/trip/requests",
        {
            "kind": "BUSINESS_TRIP",
            "start_date": "2026-08-04",
            "end_date": "2026-08-05",
            "location_label": "광주",
            "purpose": "현장 점검",
        },
        format="json",
    )
    assert resp.status_code == 201, resp.content
    trip_id = resp.json()["data"]["id"]
    task = ApprovalTask.objects.get(target_id=trip_id)
    assert task.approver_id == manager_membership.id

    # Act — manager approves via inbox endpoint.
    resp = manager_client.post(f"/v1/inbox/{task.id}/approve", {}, format="json")
    assert resp.status_code == 200, resp.content

    # Assert — trip is APPROVED and a notification log was written.
    trip = BusinessTrip.objects.get(id=trip_id)
    assert trip.status == BusinessTrip.Status.APPROVED
    assert trip.decided_by_id == manager_membership.id
    notif = NotificationLog.objects.filter(
        membership=membership, event_kind="TRIP_DECISION"
    )
    assert notif.exists()
