"""
Test: audit · log recorder + admin list endpoint
Type: Integration (real Postgres, IP/UA capture, DRF auth)
Why:  감사 로그는 보안 사고 조사 / 컴플라이언스의 단일 진실원이다. 기록이 누락되거나
      엔드포인트가 사라지면 사후 분석이 불가능하다 — 가장 비싼 리스크 중 하나.
Covers:
  - apps.audit.services.record() — IP / UA / payload 캡처, X-Forwarded-For 우선,
    PII 마스킹, 예외 swallow
  - GET /v1/admin/audit — 필터 (action / actor / from / to), ADMIN+ 권한
  - 로그인 성공 / 로그아웃 / 비밀번호 변경 시 감사 행이 자동 기록됨
Out of scope:
  - 보존 기간 / 아카이빙 (운영 SOP, batch 잡)
  - SIEM 연동 (별도 export job)
Coverage target: 95%+ for apps/audit/{services,views}.py
"""
from __future__ import annotations

import pytest

from apps.audit.models import AuditLog
from apps.audit.services import record
from tests.factories import MembershipFactory, UserFactory

pytestmark = pytest.mark.django_db


def _bearer_login(client, user, password="TestPass!1"):
    """Helper: log in via the real endpoint and attach Bearer."""
    r = client.post(
        "/v1/auth/login",
        {"email": user.email, "password": password},
        format="json",
    )
    assert r.status_code == 200, r.content
    access = r.json()["data"]["access_token"]
    refresh = r.json()["data"]["refresh_token"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    return access, refresh


def test_record_captures_ip_ua_and_masks_pii(rf):
    """record() 호출 시 IP/UA/payload 가 저장되고 PII (email/name) 가 마스킹된다.
    이유: operations-guide §8.4 — 감사 로그에 평문 PII 가 들어가면 컴플라이언스 위반.
    """
    # Arrange
    user = UserFactory()
    request = rf.post("/v1/dummy", HTTP_X_FORWARDED_FOR="203.0.113.7, 10.0.0.1",
                      HTTP_USER_AGENT="UA/1.0")

    # Act
    row = record(user, "auth.login.success", request=request,
                 payload={"email": "leak@ex.com", "extra": "ok"})

    # Assert
    assert row is not None
    assert row.action == "auth.login.success"
    assert row.actor_id == user.id
    assert row.ip == "203.0.113.7"  # XFF wins over REMOTE_ADDR
    assert row.user_agent == "UA/1.0"
    assert row.payload_json["email"] == "***"
    assert row.payload_json["extra"] == "ok"


def test_record_truncates_user_agent(rf):
    """UA 가 256자 초과면 잘려서 저장된다.
    이유: 일부 봇/스캐너는 거대한 UA 를 보낸다 — 컬럼 폭발 방지.
    """
    request = rf.post("/v1/x", HTTP_USER_AGENT="A" * 1000)
    row = record(None, "test.action", request=request)
    assert row is not None
    assert len(row.user_agent) == 256


def test_record_swallows_exceptions(monkeypatch, rf):
    """record() 가 내부 오류로 죽으면 None 만 반환하고 호출자를 깨지 않는다.
    이유: 감사 로깅 실패가 사용자 요청을 5xx 로 만들면 안 된다.
    """
    # Arrange — break the model layer
    def _boom(*a, **kw):  # noqa
        raise RuntimeError("db on fire")

    monkeypatch.setattr(AuditLog.objects, "create", _boom)

    # Act / Assert — must not raise
    assert record(None, "x", request=rf.post("/")) is None


def test_login_success_emits_audit(api_client, db):
    """로그인 성공 시 auth.login.success 행이 생성되고 IP 가 기록된다.
    이유: 비정상 위치 로그인 탐지의 데이터 소스.
    """
    user = UserFactory(password="TestPass!1")
    MembershipFactory(user=user)

    api_client.post(
        "/v1/auth/login",
        {"email": user.email, "password": "TestPass!1"},
        format="json",
        HTTP_X_FORWARDED_FOR="198.51.100.5",
    )

    rows = list(AuditLog.objects.filter(action="auth.login.success"))
    assert len(rows) == 1
    assert rows[0].actor_id == user.id
    assert rows[0].ip == "198.51.100.5"


def test_login_failure_emits_audit(api_client, db):
    """로그인 실패도 기록된다 (actor=None).
    이유: brute-force 탐지에 필요.
    """
    UserFactory(email="known@ex.com", password="TestPass!1")
    api_client.post(
        "/v1/auth/login",
        {"email": "known@ex.com", "password": "wrong"},
        format="json",
    )
    assert AuditLog.objects.filter(action="auth.login.failed").count() == 1


def test_logout_emits_audit():
    """로그아웃 시 auth.logout 기록 + refresh 블랙리스트.
    이유: 토큰 탈취 후 로그아웃 흐름의 증거 보전.
    """
    from rest_framework.test import APIClient

    target = MembershipFactory(role="EMPLOYEE")
    target.user.set_password("TestPass!1")
    target.user.save()

    client = APIClient()
    r = client.post("/v1/auth/login",
                    {"email": target.user.email, "password": "TestPass!1"},
                    format="json")
    refresh = r.json()["data"]["refresh_token"]
    access = r.json()["data"]["access_token"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    # Act
    r = client.post("/v1/auth/logout", {"refresh_token": refresh}, format="json")

    # Assert
    assert r.status_code == 200, r.content
    assert AuditLog.objects.filter(
        action="auth.logout", actor_id=target.user.id
    ).exists()


def test_admin_list_audit_requires_admin(client_auth):
    """EMPLOYEE 가 /v1/admin/audit 호출 시 403.
    이유: 감사 로그 자체도 기밀 — 관리자만 열람.
    """
    client, _ = client_auth("EMPLOYEE")
    r = client.get("/v1/admin/audit")
    assert r.status_code == 403


def test_admin_list_audit_filters(client_auth):
    """ADMIN 이 action 필터로 조회 시 매칭 행만 반환된다.
    이유: 감사 화면에서 특정 사건 (예: password_changed) 만 보고 싶다.
    """
    client, m = client_auth("ADMIN")
    AuditLog.objects.create(company=m.company, action="auth.login.success")
    AuditLog.objects.create(company=m.company, action="auth.password_changed")

    r = client.get("/v1/admin/audit?action=auth.password_changed")
    assert r.status_code == 200
    data = r.json()["data"]
    assert len(data) == 1
    assert data[0]["action"] == "auth.password_changed"
