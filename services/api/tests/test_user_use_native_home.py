import pytest
from django.contrib.auth import get_user_model

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
