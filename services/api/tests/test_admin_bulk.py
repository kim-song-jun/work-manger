"""
Test: admin_api.bulk · CSV 일괄 직원 등록 (POST /v1/admin/employees/bulk)
Type: Integration (real Postgres, JWT auth, real Membership/User writes)
Why:  도입기 고객은 수십~수백 명을 한 번에 등록한다. 일부 오류 행 때문에
      전체가 롤백되면 운영팀이 CSV를 손으로 잘라야 한다 → per-row tx + 명확한
      errors[] 분기를 회귀 테스트로 보호.
Covers:
  - happy path                : 10행 → 10명 created
  - dry-run                   : 영속화 0건, 단 result.created 는 10건
  - 멱등성                    : 두 번째 실행은 모두 SKIPPED
  - bad row                   : email 누락 행만 errors[], 나머지는 정상 처리
  - 권한 게이트               : EMPLOYEE → 403
Out of scope:
  - 비동기 큐잉 (현재 동기 처리; 향후 Celery 위임 시 별도 케이스)
  - 부서 트리 구조 (parent path)
Coverage target: ≥ 85% for apps/admin_api/services_bulk.py
"""
from __future__ import annotations

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from apps.identity.models import Membership

pytestmark = pytest.mark.django_db


HEADER = "email,name,role,department_name,employee_no,position,hired_at,locale\n"


def _csv(rows: list[str]) -> bytes:
    return (HEADER + "".join(rows)).encode("utf-8")


def _row(email: str, name: str = "Tester", role: str = "EMPLOYEE", hired: str = "2026-01-15") -> str:
    return f"{email},{name},{role},Engineering,E0001,Dev,{hired},ko\n"


def _upload(client, body: bytes, dry_run: bool = False):
    payload = {"file": SimpleUploadedFile("staff.csv", body, content_type="text/csv")}
    if dry_run:
        payload["dry_run"] = "true"
    return client.post("/v1/admin/employees/bulk", payload, format="multipart")


def test_bulk_happy_path_creates_10(client_auth):
    """10행 CSV → 10 created, errors=0, skipped=0. 모든 user가 unusable_password."""
    client, admin = client_auth(role="ADMIN")
    rows = [_row(f"new{i}@example.com", name=f"User {i}") for i in range(10)]
    r = _upload(client, _csv(rows))
    assert r.status_code == 200, r.content
    d = r.json()["data"]
    assert d["count_created"] == 10
    assert d["count_errors"] == 0
    assert d["count_skipped"] == 0
    assert Membership.objects.filter(company=admin.company).count() >= 11  # 10 + admin self
    # New users must require password reset on first login.
    from django.contrib.auth import get_user_model

    User = get_user_model()
    u = User.objects.get(email="new0@example.com")
    assert not u.has_usable_password()


def test_bulk_dry_run_persists_nothing(client_auth):
    """dry_run=true → DB unchanged, but result.created lists 10 emails."""
    client, admin = client_auth(role="ADMIN")
    rows = [_row(f"dry{i}@example.com") for i in range(10)]
    before = Membership.objects.filter(company=admin.company).count()
    r = _upload(client, _csv(rows), dry_run=True)
    assert r.status_code == 200, r.content
    d = r.json()["data"]
    assert d["count_created"] == 10
    assert d["dry_run"] is True
    after = Membership.objects.filter(company=admin.company).count()
    assert after == before  # nothing persisted


def test_bulk_idempotent_second_run_all_skipped(client_auth):
    """두 번째 실행은 ALREADY_MEMBER로 모두 SKIPPED."""
    client, admin = client_auth(role="ADMIN")
    rows = [_row(f"dup{i}@example.com") for i in range(3)]
    body = _csv(rows)
    r1 = _upload(client, body)
    assert r1.json()["data"]["count_created"] == 3
    r2 = _upload(client, body)
    d = r2.json()["data"]
    assert d["count_created"] == 0
    assert d["count_skipped"] == 3
    assert all(s["reason"] == "ALREADY_MEMBER" for s in d["skipped"])


def test_bulk_bad_row_isolated(client_auth):
    """email 누락 행은 errors[]에만 들어가고 나머지 2행은 created."""
    client, _admin = client_auth(role="ADMIN")
    rows = [
        _row("ok1@example.com"),
        ",NoEmail,EMPLOYEE,Engineering,E,Dev,2026-01-15,ko\n",  # missing email
        _row("ok2@example.com"),
    ]
    r = _upload(client, _csv(rows))
    assert r.status_code == 200
    d = r.json()["data"]
    assert d["count_created"] == 2
    assert d["count_errors"] == 1
    assert d["errors"][0]["message"] == "INVALID_EMAIL"


def test_bulk_employee_forbidden(client_auth):
    """EMPLOYEE 권한은 403."""
    client, _m = client_auth(role="EMPLOYEE")
    r = _upload(client, _csv([_row("x@example.com")]))
    assert r.status_code == 403
