"""
Test: notice · CRUD + role gating + scoping
Type: Integration (real Postgres + DRF APIClient)
Why:  공지사항은 회사 전체에 노출되므로 (a) 다른 회사의 글이 새지 않아야 하고,
      (b) 일반 직원이 임의로 공지를 만들지 못해야 한다 (사칭/스팸 방지).
      pinned/category 필터 회귀가 깨지면 m-notice 헤더의 "필수" 섹션이 사라진다.
Covers:
  - apps.notice.services.list_for — company isolation, pinned 필터
  - POST /v1/notices — ADMIN 만 허용 (EMPLOYEE 403)
  - PATCH/POST archive — archived_at 설정
Out of scope:
  - 공지 알림 dispatch (별도 분기, 추후 추가)
  - 첨부파일 업로드 (파일 도메인 미구현)
Coverage target: ≥ 90% lines for apps/notice/{services,views}.py
"""
from __future__ import annotations

from datetime import date

import pytest
from rest_framework.test import APIClient

from apps.identity.models import Company, Membership, User
from apps.notice.models import Notice

pytestmark = pytest.mark.django_db


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def company(db):
    return Company.objects.create(
        name="ACME Notice",
        code="NOTI01",
        fiscal_year_start=date(2026, 1, 1),
        timezone="Asia/Seoul",
    )


@pytest.fixture
def other_company(db):
    return Company.objects.create(
        name="Other Inc",
        code="OTHR02",
        fiscal_year_start=date(2026, 1, 1),
        timezone="Asia/Seoul",
    )


def _make_user(email: str, name: str) -> User:
    return User.objects.create_user(
        email=email, password="Strong!Pass99", name=name
    )


@pytest.fixture
def admin_membership(db, company):
    return Membership.objects.create(
        company=company,
        user=_make_user("notice-admin@example.com", "Admin"),
        role=Membership.Role.ADMIN,
        hired_at=date(2020, 1, 1),
    )


@pytest.fixture
def employee_membership(db, company):
    return Membership.objects.create(
        company=company,
        user=_make_user("notice-emp@example.com", "Emp"),
        role=Membership.Role.EMPLOYEE,
        hired_at=date(2024, 1, 1),
    )


@pytest.fixture
def other_admin_membership(db, other_company):
    return Membership.objects.create(
        company=other_company,
        user=_make_user("other-admin@example.com", "Outsider"),
        role=Membership.Role.ADMIN,
        hired_at=date(2020, 1, 1),
    )


def _login_client(email: str) -> APIClient:
    client = APIClient()
    resp = client.post(
        "/v1/auth/login",
        {"email": email, "password": "Strong!Pass99"},
        format="json",
    )
    assert resp.status_code == 200, resp.content
    access = resp.json()["data"]["access_token"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    return client


# ---------------------------------------------------------------------------
# list / scope
# ---------------------------------------------------------------------------


def test_list_returns_only_own_company_notices(
    admin_membership, employee_membership, other_admin_membership, company, other_company
):
    """다른 회사의 공지가 GET /v1/notices 에 새지 않는다.
    이유: 멀티테넌시 누설은 가장 치명적인 데이터 사고.
    """
    Notice.objects.create(
        company=company, author=admin_membership, title="Ours", body="..."
    )
    Notice.objects.create(
        company=other_company,
        author=other_admin_membership,
        title="Theirs",
        body="...",
    )

    client = _login_client(employee_membership.user.email)
    resp = client.get("/v1/notices")
    assert resp.status_code == 200, resp.content
    titles = {row["title"] for row in resp.json()["data"]}
    assert titles == {"Ours"}


def test_pinned_only_filter(admin_membership, employee_membership, company):
    """?pinned=true 필터는 pinned=True 만 반환.
    이유: m-notice 헤더의 필수 섹션이 정확해야 한다.
    """
    Notice.objects.create(
        company=company, author=admin_membership, title="Pinned", pinned=True
    )
    Notice.objects.create(
        company=company, author=admin_membership, title="Plain", pinned=False
    )

    client = _login_client(employee_membership.user.email)
    resp = client.get("/v1/notices?pinned=true")
    assert resp.status_code == 200
    titles = {row["title"] for row in resp.json()["data"]}
    assert titles == {"Pinned"}


# ---------------------------------------------------------------------------
# create / role gating
# ---------------------------------------------------------------------------


def test_employee_cannot_create_notice_returns_403(employee_membership):
    """EMPLOYEE 가 POST /v1/notices 호출 시 403.
    이유: 사칭/스팸 공지를 누구나 올릴 수 있으면 안 된다.
    """
    client = _login_client(employee_membership.user.email)
    resp = client.post(
        "/v1/notices",
        {"title": "Stealth", "body": "...", "category": "general"},
        format="json",
    )
    assert resp.status_code == 403, resp.content


def test_admin_create_then_employee_read(
    admin_membership, employee_membership
):
    """ADMIN 가 작성 → EMPLOYEE 가 GET /v1/notices/{id} 로 읽기.
    이유: 가장 일반적인 사용자 경로. 깨지면 m-notice 가 빈 화면.
    """
    admin_client = _login_client(admin_membership.user.email)
    create_resp = admin_client.post(
        "/v1/notices",
        {
            "title": "정책 안내",
            "body": "본문",
            "category": "policy",
            "pinned": True,
        },
        format="json",
    )
    assert create_resp.status_code == 201, create_resp.content
    notice_id = create_resp.json()["data"]["id"]

    emp_client = _login_client(employee_membership.user.email)
    get_resp = emp_client.get(f"/v1/notices/{notice_id}")
    assert get_resp.status_code == 200
    body = get_resp.json()["data"]
    assert body["title"] == "정책 안내"
    assert body["pinned"] is True
    assert body["category"] == "policy"


# ---------------------------------------------------------------------------
# archive
# ---------------------------------------------------------------------------


def test_archive_sets_archived_at_and_hides_from_list(
    admin_membership, employee_membership, company
):
    """archive → archived_at 설정 + 기본 list 에서 사라짐.
    이유: 보관 처리한 공지는 m-notice 피드에서 자동으로 제거되어야 한다.
    """
    notice = Notice.objects.create(
        company=company, author=admin_membership, title="Sunset", body="..."
    )

    admin_client = _login_client(admin_membership.user.email)
    archive_resp = admin_client.post(f"/v1/notices/{notice.id}/archive")
    assert archive_resp.status_code == 200, archive_resp.content
    assert archive_resp.json()["data"]["archived_at"] is not None
    notice.refresh_from_db()
    assert notice.archived_at is not None

    emp_client = _login_client(employee_membership.user.email)
    list_resp = emp_client.get("/v1/notices")
    assert all(row["id"] != str(notice.id) for row in list_resp.json()["data"])
