"""
Test: notification · provider stubs (FCM/APNs/SES/in-app)
Type: Unit (provider stubs are pure Python, no network)
Why:  실제 네트워크 호출은 stage 환경에서 검증한다. 본 테스트는 stub 자체가
      ProviderResult 의 success/error 필드를 정확히 채워서 outbox 상태
      전이를 결정짓는 입력을 만들어 주는지를 회귀 보호한다.
      _force_fail 플래그가 outbox 테스트의 결정성을 보장하므로 핵심.
Covers:
  - apps.notification.providers.send (router)        — 채널별 라우팅 + 알 수 없는 채널 거부
  - apps.notification.providers.email.send           — 성공 / _force_fail / 수신자 없음
  - apps.notification.providers.push.send            — 토큰 있음 / 없음 / _force_fail
  - apps.notification.providers.inapp.send           — 항상 성공 / _force_fail
Out of scope:
  - 실제 SES / FCM / APNs SDK 호출 (Phase 2 통합 테스트)
  - 결과 외 outbox 상태 전이 (test_outbox.py 가 다룸)
Coverage target: ≥ 95% lines for apps/notification/providers/*.py
"""
from __future__ import annotations

import pytest

from apps.notification import providers
from apps.notification.models import DeviceToken
from tests.factories import MembershipFactory

pytestmark = pytest.mark.django_db


# ----- router -----------------------------------------------------------------


def test_router_dispatches_to_inapp_provider():
    """providers.send('INAPP', ...) returns a successful ProviderResult."""
    m = MembershipFactory()
    res = providers.send("INAPP", {}, m)
    assert res.success is True
    assert res.error is None
    assert res.provider_message_id and res.provider_message_id.startswith("inapp-stub-")


def test_router_rejects_unknown_channel():
    """Unknown channels are config bugs — raise to surface them."""
    m = MembershipFactory()
    with pytest.raises(ValueError):
        providers.send("SMS", {}, m)


# ----- email -----------------------------------------------------------------


def test_email_provider_success():
    """SES stub returns success + provider_message_id when recipient present."""
    m = MembershipFactory()
    res = providers.send("EMAIL", {}, m)
    assert res.success is True
    assert res.provider_message_id and res.provider_message_id.startswith("ses-stub-")


def test_email_provider_force_fail_returns_failure():
    """_force_fail flag yields a deterministic failure for testing retries."""
    m = MembershipFactory()
    res = providers.send("EMAIL", {"_force_fail": True}, m)
    assert res.success is False
    assert res.error and "forced failure" in res.error


def test_email_provider_missing_recipient_fails():
    """A user without an email address cannot receive — provider returns failure."""
    m = MembershipFactory()
    m.user.email = ""
    m.user.save(update_fields=["email"])
    res = providers.send("EMAIL", {}, m)
    assert res.success is False
    assert res.error and "missing recipient" in res.error


# ----- push ------------------------------------------------------------------


def test_push_provider_success_when_token_registered():
    """Picks the most-recent DeviceToken and reports success."""
    m = MembershipFactory()
    DeviceToken.objects.create(membership=m, platform="ANDROID", token="tok-push-1")
    res = providers.send("PUSH", {}, m)
    assert res.success is True
    assert res.provider_message_id and res.provider_message_id.startswith("push-stub-ANDROID")


def test_push_provider_no_token_fails():
    """No DeviceToken registered → failure (transient; outbox will retry)."""
    m = MembershipFactory()
    res = providers.send("PUSH", {}, m)
    assert res.success is False
    assert res.error and "no device token" in res.error


def test_push_provider_force_fail_overrides_token_presence():
    """_force_fail takes precedence over token presence."""
    m = MembershipFactory()
    DeviceToken.objects.create(membership=m, platform="WEB", token="tok-push-x")
    res = providers.send("PUSH", {"_force_fail": True}, m)
    assert res.success is False
    assert res.error and "forced failure" in res.error


# ----- inapp -----------------------------------------------------------------


def test_inapp_provider_always_succeeds_without_force_fail():
    """In-app delivery is the DB row itself; there's no transport to fail."""
    m = MembershipFactory()
    res = providers.send("INAPP", {"id": "x"}, m)
    assert res.success is True


def test_inapp_provider_force_fail_returns_failure():
    """_force_fail must work for inapp too so outbox tests can drive failure paths."""
    m = MembershipFactory()
    res = providers.send("INAPP", {"_force_fail": True}, m)
    assert res.success is False
    assert res.error and "forced failure" in res.error
