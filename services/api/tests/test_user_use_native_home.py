import pytest
from io import StringIO
from django.contrib.auth import get_user_model
from django.core.management import call_command
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


@pytest.mark.django_db
def test_me_settings_patch_sets_true():
    user = User.objects.create_user(email="p1@example.com", password="pw12345!", name="P1")
    client = _auth_client(user)
    resp = client.patch("/v1/me/settings", data={"use_native_home": True}, format="json")
    assert resp.status_code == 200
    assert resp.json() == {"data": {"use_native_home": True}}
    user.refresh_from_db()
    assert user.use_native_home is True


@pytest.mark.django_db
def test_me_settings_patch_sets_false():
    user = User.objects.create_user(email="p2@example.com", password="pw12345!", name="P2", use_native_home=True)
    client = _auth_client(user)
    resp = client.patch("/v1/me/settings", data={"use_native_home": False}, format="json")
    assert resp.status_code == 200
    assert resp.json() == {"data": {"use_native_home": False}}
    user.refresh_from_db()
    assert user.use_native_home is False


@pytest.mark.django_db
def test_me_settings_patch_rejects_invalid_type():
    user = User.objects.create_user(email="p3@example.com", password="pw12345!", name="P3")
    client = _auth_client(user)
    resp = client.patch("/v1/me/settings", data={"use_native_home": "not-a-bool"}, format="json")
    assert resp.status_code == 400
    assert "use_native_home" in resp.json().get("error", {}).get("details", {})


@pytest.mark.django_db
def test_me_settings_patch_requires_auth():
    client = APIClient()
    resp = client.patch("/v1/me/settings", data={"use_native_home": True}, format="json")
    assert resp.status_code == 401


@pytest.mark.django_db
def test_set_user_setting_command_single_user():
    user = User.objects.create_user(email="cmd1@example.com", password="pw12345!", name="CMD1")
    out = StringIO()
    call_command(
        "set_user_setting",
        "--user-id", str(user.id),
        "--key", "use_native_home",
        "--value", "true",
        stdout=out,
    )
    user.refresh_from_db()
    assert user.use_native_home is True
    assert "1 user" in out.getvalue()


@pytest.mark.django_db
def test_set_user_setting_command_bulk():
    User.objects.create_user(email="b1@example.com", password="pw12345!", name="B1")
    User.objects.create_user(email="b2@example.com", password="pw12345!", name="B2")
    out = StringIO()
    call_command(
        "set_user_setting",
        "--bulk",
        "--key", "use_native_home",
        "--value", "true",
        stdout=out,
    )
    assert User.objects.filter(use_native_home=True).count() == 2
    assert "2 user" in out.getvalue()


@pytest.mark.django_db
def test_set_user_setting_command_rejects_unknown_key():
    user = User.objects.create_user(email="cmd2@example.com", password="pw12345!", name="CMD2")
    with pytest.raises(Exception) as exc:
        call_command(
            "set_user_setting",
            "--user-id", str(user.id),
            "--key", "no_such_setting",
            "--value", "true",
        )
    assert "Unknown key" in str(exc.value) or "unknown" in str(exc.value).lower()
