"""
Test: team · /v1/team/status (alias root)
Type: Integration (real Postgres + JWT auth)
Why:  /v1/team/status 가 매니저 화면의 첫 진입점이라 500이면 데시보드 자체가
      뜨지 않는다. 기존 status_root 가 DRF Request 를 status_grid 의 wrapped
      뷰에 다시 통과시키며 AssertionError 를 던지던 회귀를 잡는다.
Covers:
  - GET /v1/team/status → 200 + {"data": {"date", "items"}, "meta": {"count"}}
  - 그리드와 동일한 페이로드를 반환 (alias 동등성)
Out of scope:
  - 권한 / 비활성 사용자 (test_health_auth.py 가 다룸)
Coverage target: ≥ 90% lines for apps/team/views.status_root
"""
from __future__ import annotations

import pytest

pytestmark = pytest.mark.django_db


def test_status_root_returns_200_with_grid_payload(client_auth):
    """`/v1/team/status` should return the same shape as `/v1/team/status/grid`.

    Why: 기존 회귀에서 status_root 가 status_grid(DRF Request) 를 호출하면
         두 번째 api_view 데코레이터가 HttpRequest 가 아니라며 AssertionError
         를 던져 500 을 응답했다. 이 테스트가 해당 회귀를 잡는다.
    """
    # Arrange — manager session with at least one active member (themselves).
    client, _me = client_auth(role="MANAGER")

    # Act
    r = client.get("/v1/team/status")

    # Assert
    assert r.status_code == 200, r.content
    body = r.json()
    assert "data" in body and "meta" in body
    assert "date" in body["data"] and "items" in body["data"]
    assert isinstance(body["data"]["items"], list)
    assert body["meta"]["count"] == len(body["data"]["items"])


def test_status_root_matches_grid(client_auth):
    """`/v1/team/status` and `/v1/team/status/grid` return identical payloads.

    Why: alias 의 등가성을 깨면 FE 의 두 클라이언트가 다른 응답을 받는다.
    """
    # Arrange
    client, _me = client_auth(role="MANAGER")

    # Act
    r_root = client.get("/v1/team/status")
    r_grid = client.get("/v1/team/status/grid")

    # Assert
    assert r_root.status_code == 200
    assert r_grid.status_code == 200
    assert r_root.json() == r_grid.json()
