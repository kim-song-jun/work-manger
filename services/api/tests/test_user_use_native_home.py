import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


@pytest.mark.django_db
def test_user_use_native_home_defaults_false():
    user = User.objects.create_user(email="t1@example.com", password="pw12345!", name="T1")
    assert user.use_native_home is False


@pytest.mark.django_db
def test_user_use_native_home_can_be_set_true():
    user = User.objects.create_user(email="t2@example.com", password="pw12345!", name="T2")
    user.use_native_home = True
    user.save()
    user.refresh_from_db()
    assert user.use_native_home is True


def _auth_client(user):
    client = APIClient()
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


@pytest.mark.django_db
def test_me_settings_get_requires_auth():
    client = APIClient()
    resp = client.get("/v1/me/settings")
    assert resp.status_code == 401


@pytest.mark.django_db
def test_me_settings_get_returns_default_false():
    user = User.objects.create_user(email="g1@example.com", password="pw12345!", name="G1")
    client = _auth_client(user)
    resp = client.get("/v1/me/settings")
    assert resp.status_code == 200
    assert resp.json() == {"data": {"use_native_home": False}}
