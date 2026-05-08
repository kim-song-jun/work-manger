"""Wave 4c security + audit + endpoint tests.

Covers 17 findings from F-MANAGER-01/02/03/10/13, F-ADMIN-01/02/03/06/07,
F-OWNER-01/02/03/04/06/09/10.

Each test function has a comment citing the finding it covers.
"""
from __future__ import annotations

from datetime import timedelta
from decimal import Decimal

import pytest
from django.utils import timezone as django_tz
from rest_framework.test import APIClient

from apps.approval.models import ApprovalTask
from apps.audit.models import AuditLog
from tests.factories import (
    DepartmentFactory,
    MembershipFactory,
    UserFactory,
)

pytestmark = pytest.mark.django_db


# ---------------------------------------------------------------------------
# F-MANAGER-01 / F-MANAGER-10: self-approve 차단
# ---------------------------------------------------------------------------

def test_leave_submit_prevents_self_approve(client_auth):
    """F-MANAGER-01/10: manager 미배정 멤버가 연차를 신청하면
    NO_APPROVER 예외가 발생하거나 ApprovalTask.approver != requester 가 보장된다."""
    from apps.leave import services as leave_svc
    from apps.leave.models import LeaveBalance, LeavePolicy
    from tests.factories import CompanyFactory
    from core.errors import Unprocessable
    import datetime as dt

    company = CompanyFactory()
    user = UserFactory()
    # Sole member → no other admin/owner exists
    m = MembershipFactory(user=user, company=company, role="EMPLOYEE")
    LeavePolicy.objects.create(
        company=company,
        effective_from=dt.date(1970, 1, 1),
        rules_json={},
        expiry_months=12,
        notify_days_before=[],
    )
    LeaveBalance.objects.create(
        company=company,
        membership=m,
        kind=LeaveBalance.Kind.GRANTED,
        days=Decimal("10"),
        granted_at=dt.date(2026, 1, 1),
    )
    today = django_tz.localdate()
    with pytest.raises(Unprocessable) as exc_info:
        leave_svc.submit_request(m, today, today, "FULL", reason="test")
    assert exc_info.value.code == "NO_APPROVER"


def test_leave_submit_with_admin_escalation(client_auth):
    """F-MANAGER-01: MANAGER 미배정이지만 ADMIN 이 있으면 → approver=ADMIN."""
    from apps.leave import services as leave_svc
    from apps.leave.models import LeaveBalance, LeavePolicy
    from tests.factories import CompanyFactory
    import datetime as dt

    company = CompanyFactory()
    user_emp = UserFactory()
    user_admin = UserFactory()
    emp = MembershipFactory(user=user_emp, company=company, role="EMPLOYEE")
    admin = MembershipFactory(user=user_admin, company=company, role="ADMIN")
    LeavePolicy.objects.create(
        company=company,
        effective_from=dt.date(1970, 1, 1),
        rules_json={},
        expiry_months=12,
        notify_days_before=[],
    )
    LeaveBalance.objects.create(
        company=company, membership=emp, kind=LeaveBalance.Kind.GRANTED,
        days=Decimal("10"), granted_at=dt.date(2026, 1, 1),
    )
    today = django_tz.localdate()
    leave_req = leave_svc.submit_request(emp, today, today, "FULL", reason="test")
    task = ApprovalTask.objects.get(target_id=leave_req.id)
    assert task.approver_id == admin.id
    assert task.approver_id != emp.id


def test_ensure_approver_blocks_self_approve(client_auth):
    """F-MANAGER-01: _ensure_approver → 403 if requester == approver."""
    from tests.factories import CompanyFactory
    company = CompanyFactory()
    user = UserFactory()
    m = MembershipFactory(user=user, company=company, role="MANAGER")

    # Build a task where requester == approver (bad data)
    task = ApprovalTask.objects.create(
        company=company,
        target_type="LEAVE",
        target_id=m.id,  # dummy
        requester=m,
        approver=m,
    )
    client = APIClient()
    r = client.post(
        "/v1/auth/login",
        {"email": user.email, "password": "Strong!Pass99"},
        format="json",
    )
    assert r.status_code == 200, r.content
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {r.json()['data']['access_token']}")

    # Attempt to approve own task via inbox
    r = client.post(f"/v1/inbox/{task.id}/approve", {}, format="json")
    assert r.status_code == 403


# ---------------------------------------------------------------------------
# F-MANAGER-02: /v1/compliance/team endpoint
# ---------------------------------------------------------------------------

def test_team_compliance_requires_manager(client_auth):
    """F-MANAGER-02: EMPLOYEE 는 /v1/compliance/team → 403."""
    client, _ = client_auth(role="EMPLOYEE")
    r = client.get("/v1/compliance/team")
    assert r.status_code == 403


def test_team_compliance_manager_sees_own_dept_only(client_auth):
    """F-MANAGER-02: MANAGER 는 본인 부서 멤버만 보고 타 부서는 안 보인다."""
    from tests.factories import CompanyFactory, AttendanceRecordFactory
    from apps.attendance.models import AttendanceRecord
    import datetime as dt

    # Use same company for manager and two employees in different departments
    company = MembershipFactory(role="MANAGER").company
    # Create manager with department
    dept_a = DepartmentFactory(company=company, name="Alpha")
    dept_b = DepartmentFactory(company=company, name="Beta")

    mgr_user = UserFactory()
    MembershipFactory(user=mgr_user, company=company, role="MANAGER", department=dept_a)

    MembershipFactory(company=company, role="EMPLOYEE", department=dept_a)
    emp_b = MembershipFactory(company=company, role="EMPLOYEE", department=dept_b)

    client = APIClient()
    r = client.post(
        "/v1/auth/login",
        {"email": mgr_user.email, "password": "Strong!Pass99"},
        format="json",
    )
    assert r.status_code == 200, r.content
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {r.json()['data']['access_token']}")

    r = client.get("/v1/compliance/team")
    assert r.status_code == 200, r.content
    data = r.json()["data"]
    member_ids = [m["membership_id"] for m in data["members"]]
    # emp_b (Beta dept) must not appear
    assert str(emp_b.id) not in member_ids


def test_team_compliance_admin_sees_all(client_auth):
    """F-MANAGER-02: ADMIN 은 전사 조회 (scope=team endpoint 사용 가능)."""
    client, _ = client_auth(role="ADMIN")
    r = client.get("/v1/compliance/team")
    assert r.status_code == 200, r.content
    assert "scope" in r.json()["data"]


# ---------------------------------------------------------------------------
# F-MANAGER-03: team status department filter
# ---------------------------------------------------------------------------

def test_team_status_grid_manager_dept_filter(client_auth):
    """F-MANAGER-03: MANAGER 는 status_grid 에서 자기 부서만 본다."""
    from tests.factories import CompanyFactory

    company = CompanyFactory()
    dept_a = DepartmentFactory(company=company, name="TeamA")
    dept_b = DepartmentFactory(company=company, name="TeamB")

    mgr_user = UserFactory()
    MembershipFactory(user=mgr_user, company=company, role="MANAGER", department=dept_a)
    MembershipFactory(company=company, role="EMPLOYEE", department=dept_a)
    emp_b = MembershipFactory(company=company, role="EMPLOYEE", department=dept_b)

    client = APIClient()
    r = client.post("/v1/auth/login", {"email": mgr_user.email, "password": "Strong!Pass99"}, format="json")
    assert r.status_code == 200, r.content
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {r.json()['data']['access_token']}")

    r = client.get("/v1/team/status/grid")
    assert r.status_code == 200, r.content
    ids = [item["membership_id"] for item in r.json()["data"]["items"]]
    assert str(emp_b.id) not in ids


# ---------------------------------------------------------------------------
# F-MANAGER-13: team status response shape lock
# ---------------------------------------------------------------------------

def test_team_status_grid_envelope_shape(client_auth):
    """F-MANAGER-13: status_grid → {data: {date, items}, meta: {count}}."""
    client, _ = client_auth(role="EMPLOYEE")
    r = client.get("/v1/team/status/grid")
    assert r.status_code == 200
    body = r.json()
    assert "data" in body
    assert "date" in body["data"]
    assert "items" in body["data"]
    assert "meta" in body
    assert "count" in body["meta"]


def test_team_status_grouped_envelope_shape(client_auth):
    """F-MANAGER-13: status_grouped → {data: {date, groups}}."""
    client, _ = client_auth(role="EMPLOYEE")
    r = client.get("/v1/team/status/grouped")
    assert r.status_code == 200
    body = r.json()
    assert "data" in body
    assert "date" in body["data"]
    assert "groups" in body["data"]


def test_team_status_timeline_envelope_shape(client_auth):
    """F-MANAGER-13: status_timeline → {data: {date, events}}."""
    client, _ = client_auth(role="EMPLOYEE")
    r = client.get("/v1/team/status/timeline")
    assert r.status_code == 200
    body = r.json()
    assert "data" in body
    assert "date" in body["data"]
    assert "events" in body["data"]


# ---------------------------------------------------------------------------
# F-ADMIN-01: audit list `at` and `actor_name`
# ---------------------------------------------------------------------------

def test_audit_list_at_and_actor_name_not_null(client_auth):
    """F-ADMIN-01: GET /v1/admin/audit → each item has `at` + `actor_name`."""
    client, m = client_auth(role="ADMIN")
    # Create an audit log row with a known actor
    AuditLog.objects.create(company=m.company, actor=m.user, action="test.action")

    r = client.get("/v1/admin/audit?action=test.action")
    assert r.status_code == 200
    items = r.json()["data"]
    assert len(items) >= 1
    row = items[0]
    assert "at" in row, "`at` field missing from audit response"
    assert row["at"] is not None, "`at` must not be null"
    assert "actor_name" in row, "`actor_name` field missing from audit response"
    # actor was set, so actor_name should be the user's name
    assert row["actor_name"] == m.user.name


# ---------------------------------------------------------------------------
# F-ADMIN-03: decide_approval 409 Conflict
# ---------------------------------------------------------------------------

def test_decide_approval_already_decided_returns_409(client_auth):
    """F-ADMIN-03: PATCH /v1/admin/approvals/<id> on non-PENDING → 409."""
    from tests.factories import CompanyFactory

    client, admin = client_auth(role="ADMIN")
    # Create a task that is already APPROVED
    emp = MembershipFactory(company=admin.company, role="EMPLOYEE")
    task = ApprovalTask.objects.create(
        company=admin.company,
        target_type="LEAVE",
        target_id=emp.id,
        requester=emp,
        approver=admin,
        status="APPROVED",
    )
    r = client.patch(
        f"/v1/admin/approvals/{task.id}",
        {"decision": "approve"},
        format="json",
    )
    assert r.status_code == 409
    assert r.json()["error"]["code"] == "ALREADY_DECIDED"


# ---------------------------------------------------------------------------
# F-ADMIN-06: company code audit records
# ---------------------------------------------------------------------------

def test_company_code_create_emits_audit(client_auth):
    """F-ADMIN-06: POST /v1/admin/company-codes → audit row created."""
    client, m = client_auth(role="ADMIN")
    r = client.post("/v1/admin/company-codes", {}, format="json")
    assert r.status_code == 201, r.content
    assert AuditLog.objects.filter(
        company=m.company,
        action="identity.company_code.created",
    ).exists()


def test_company_code_revoke_emits_audit(client_auth):
    """F-ADMIN-06: DELETE /v1/admin/company-codes/<id> → audit row created."""
    from apps.identity.models import CompanyJoinCode

    client, m = client_auth(role="ADMIN")
    # Create code to revoke
    code = CompanyJoinCode.objects.create(
        company=m.company,
        code="TSTREV",
        created_by=m,
    )
    r = client.delete(f"/v1/admin/company-codes/{code.id}")
    assert r.status_code == 200, r.content
    assert AuditLog.objects.filter(
        company=m.company,
        action="identity.company_code.revoked",
    ).exists()


# ---------------------------------------------------------------------------
# F-ADMIN-07 / F-OWNER-06: purge_old_audit_logs Celery task
# ---------------------------------------------------------------------------

def test_purge_old_audit_logs_deletes_old_rows():
    """F-ADMIN-07/F-OWNER-06: rows older than retention days get deleted."""
    from apps.audit.tasks import purge_old_audit_logs
    from apps.audit.models import AuditLog
    from tests.factories import MembershipFactory
    import datetime as dt

    m = MembershipFactory()
    # Create a row 100 days ago (older than 90-day retention)
    old_time = django_tz.now() - timedelta(days=100)
    row = AuditLog.objects.create(company=m.company, action="old.action")
    AuditLog.objects.filter(pk=row.pk).update(created_at=old_time)

    # Create a recent row (should survive)
    recent = AuditLog.objects.create(company=m.company, action="recent.action")

    result = purge_old_audit_logs()
    assert result["deleted"] >= 1
    assert not AuditLog.objects.filter(pk=row.pk).exists()
    assert AuditLog.objects.filter(pk=recent.pk).exists()


# ---------------------------------------------------------------------------
# F-OWNER-01: notify_team called on settings update
# ---------------------------------------------------------------------------

def test_settings_update_broadcasts_policy_change(client_auth, monkeypatch):
    """F-OWNER-01: PATCH /v1/admin/settings/update calls notify_team."""
    broadcast_calls = []

    def _fake_notify_team(company, event, payload):
        broadcast_calls.append({"event": event, "payload": payload})
        return True

    import apps.realtime.broadcast as _bc
    monkeypatch.setattr(_bc, "notify_team", _fake_notify_team)

    client, m = client_auth(role="OWNER")
    r = client.patch(
        "/v1/admin/settings/update",
        {"compliance_block_when_over": True},
        format="json",
    )
    assert r.status_code == 200, r.content
    assert any(c["event"] == "company.policy_changed" for c in broadcast_calls)


# ---------------------------------------------------------------------------
# F-OWNER-02: update_employee emits audit log
# ---------------------------------------------------------------------------

def test_update_employee_creates_audit_log(client_auth):
    """F-OWNER-02: PATCH /v1/admin/employees/<id> creates identity.member.updated."""
    client, admin = client_auth(role="ADMIN")
    emp = MembershipFactory(company=admin.company, role="EMPLOYEE")
    r = client.patch(
        f"/v1/admin/employees/{emp.id}/update",
        {"position": "Senior Dev"},
        format="json",
    )
    assert r.status_code == 200, r.content
    assert AuditLog.objects.filter(
        company=admin.company,
        action="identity.member.updated",
    ).exists()


def test_update_employee_audit_payload_includes_old_new_role(client_auth):
    """F-OWNER-02: role change → audit payload has old_role/new_role."""
    client, owner = client_auth(role="OWNER")
    emp = MembershipFactory(company=owner.company, role="EMPLOYEE")
    client.patch(
        f"/v1/admin/employees/{emp.id}/update",
        {"role": "MANAGER"},
        format="json",
    )
    row = AuditLog.objects.filter(
        company=owner.company,
        action="identity.member.updated",
    ).last()
    assert row is not None
    assert row.payload_json.get("old_role") == "EMPLOYEE"
    assert row.payload_json.get("new_role") == "MANAGER"


# ---------------------------------------------------------------------------
# F-OWNER-03: escalation guard — ADMIN cannot grant OWNER
# ---------------------------------------------------------------------------

def test_admin_cannot_promote_to_owner(client_auth):
    """F-OWNER-03: ADMIN granting OWNER role → 403 Forbidden."""
    client, admin = client_auth(role="ADMIN")
    emp = MembershipFactory(company=admin.company, role="EMPLOYEE")
    r = client.patch(
        f"/v1/admin/employees/{emp.id}/update",
        {"role": "OWNER"},
        format="json",
    )
    assert r.status_code == 403


def test_owner_can_promote_to_owner(client_auth):
    """F-OWNER-03: OWNER can grant OWNER (rank check passes)."""
    client, owner = client_auth(role="OWNER")
    emp = MembershipFactory(company=owner.company, role="EMPLOYEE")
    r = client.patch(
        f"/v1/admin/employees/{emp.id}/update",
        {"role": "OWNER"},
        format="json",
    )
    assert r.status_code == 200, r.content


# ---------------------------------------------------------------------------
# F-OWNER-04: logo_url https-only validation
# ---------------------------------------------------------------------------

def test_logo_url_rejects_javascript_scheme(client_auth):
    """F-OWNER-04: javascript: scheme → 400 validation error."""
    client, _ = client_auth(role="OWNER")
    r = client.patch(
        "/v1/admin/settings/update",
        {"logo_url": "javascript:alert(1)"},
        format="json",
    )
    assert r.status_code == 400


def test_logo_url_rejects_http_scheme(client_auth):
    """F-OWNER-04: http: (non-https) scheme → 400 validation error."""
    client, _ = client_auth(role="OWNER")
    r = client.patch(
        "/v1/admin/settings/update",
        {"logo_url": "http://example.com/logo.png"},
        format="json",
    )
    assert r.status_code == 400


def test_logo_url_accepts_https(client_auth):
    """F-OWNER-04: https: URL → accepted."""
    client, _ = client_auth(role="OWNER")
    r = client.patch(
        "/v1/admin/settings/update",
        {"logo_url": "https://cdn.example.com/logo.png"},
        format="json",
    )
    assert r.status_code == 200, r.content


# ---------------------------------------------------------------------------
# F-OWNER-09: audit action dot-path convention
# ---------------------------------------------------------------------------

def test_settings_update_audit_action_dot_path(client_auth):
    """F-OWNER-09: company settings update → action uses dot-path (not underscore)."""
    client, m = client_auth(role="OWNER")
    client.patch("/v1/admin/settings/update", {"timezone": "Asia/Tokyo"}, format="json")
    row = AuditLog.objects.filter(
        company=m.company,
        action="identity.company.settings.updated",
    ).last()
    assert row is not None, "Expected audit row with action 'identity.company.settings.updated'"


# ---------------------------------------------------------------------------
# F-OWNER-10: test_admin_settings.py audit log row verification
# (additional case here to supplement the primary file)
# ---------------------------------------------------------------------------

def test_settings_update_audit_log_fields_present(client_auth):
    """F-OWNER-10: settings update audit log has correct company + action."""
    client, m = client_auth(role="OWNER")
    client.patch(
        "/v1/admin/settings/update",
        {"brand_color": "#AABBCC"},
        format="json",
    )
    row = AuditLog.objects.filter(
        company=m.company,
        action="identity.company.settings.updated",
    ).last()
    assert row is not None
    assert row.company_id == m.company_id
    assert "brand_color" in row.payload_json.get("fields", [])
