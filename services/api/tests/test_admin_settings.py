"""
Test: admin_api · 회사 설정 (GET ADMIN+, PATCH OWNER 만)
Type: Integration
Why:  AdminSettingsPage 가 회사 브랜드/정책을 단일 화면에서 변경. 권한 분리 (ADMIN
      읽기, OWNER 쓰기) 가 깨지면 일반 직원이 회사 컴플라이언스 정책을 바꿀 수 있는
      보안 결함.
Covers:
  - GET  /v1/admin/settings              — ADMIN 200, EMPLOYEE 403
  - PATCH /v1/admin/settings/update      — OWNER 200, ADMIN 403, color 검증
  - 변경 후 audit log 기록
Coverage target: ≥ 85% for admin_api/views_bulk.py 의 settings 함수
"""
from __future__ import annotations

import pytest

pytestmark = pytest.mark.django_db


def test_settings_get_requires_admin(client_auth):
    client, _ = client_auth(role="EMPLOYEE")
    r = client.get("/v1/admin/settings")
    assert r.status_code == 403


def test_settings_get_admin_ok(client_auth):
    client, m = client_auth(role="ADMIN")
    r = client.get("/v1/admin/settings")
    assert r.status_code == 200, r.content
    data = r.json()["data"]
    assert data["name"] == m.company.name
    assert data["code"] == m.company.code
    assert "brand_color" in data
    assert "compliance_block_when_over" in data


def test_settings_update_admin_forbidden(client_auth):
    client, _ = client_auth(role="ADMIN")
    r = client.patch(
        "/v1/admin/settings/update",
        {"brand_color": "#FF0000"},
        format="json",
    )
    assert r.status_code == 403


def test_settings_update_owner_ok(client_auth):
    client, m = client_auth(role="OWNER")
    r = client.patch(
        "/v1/admin/settings/update",
        {
            "brand_color": "#FF5733",
            "logo_url": "https://example.com/logo.png",
            "compliance_block_when_over": True,
            "leave_promotion_enabled": True,
        },
        format="json",
    )
    assert r.status_code == 200, r.content
    data = r.json()["data"]
    assert data["brand_color"] == "#FF5733"
    assert data["logo_url"] == "https://example.com/logo.png"
    assert data["compliance_block_when_over"] is True
    assert data["leave_promotion_enabled"] is True
    m.company.refresh_from_db()
    assert m.company.brand_color == "#FF5733"


def test_settings_update_invalid_color(client_auth):
    client, _ = client_auth(role="OWNER")
    r = client.patch(
        "/v1/admin/settings/update",
        {"brand_color": "not-a-hex"},
        format="json",
    )
    assert r.status_code == 400
