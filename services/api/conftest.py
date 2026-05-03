"""Shared pytest fixtures."""
from __future__ import annotations

import pytest
from rest_framework.test import APIClient

from tests.factories import MembershipFactory, UserFactory


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def client_auth(db):
    """Returns a callable creating an authenticated APIClient with an active Membership."""
    def _make(role: str = "EMPLOYEE"):
        client = APIClient()
        user = UserFactory(password="TestPass!1")
        membership = MembershipFactory(user=user, role=role)
        r = client.post(
            "/v1/auth/login",
            {"email": user.email, "password": "TestPass!1"},
            format="json",
        )
        assert r.status_code == 200, r.content
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {r.json()['data']['access_token']}")
        return client, membership

    return _make
