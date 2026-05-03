from __future__ import annotations

import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


@pytest.fixture
def client():
    return APIClient()


def test_health(client):
    resp = client.get("/v1/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_signup_then_login_then_me(client):
    payload = {
        "email": "alice@example.com",
        "password": "Strong!Pass99",
        "name": "Alice",
        "locale": "ko",
    }
    r = client.post("/v1/auth/signup", payload, format="json")
    assert r.status_code == 201, r.content

    r = client.post(
        "/v1/auth/login",
        {"email": payload["email"], "password": payload["password"]},
        format="json",
    )
    assert r.status_code == 200, r.content
    access = r.json()["data"]["access_token"]
    assert access

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    r = client.get("/v1/me")
    assert r.status_code == 200
    assert r.json()["data"]["email"] == payload["email"]


def test_login_invalid(client):
    r = client.post(
        "/v1/auth/login",
        {"email": "no@example.com", "password": "wrong"},
        format="json",
    )
    assert r.status_code == 400
