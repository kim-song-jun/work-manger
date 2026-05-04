"""
Test: notification · web-push provider (VAPID)
Type: Unit (pywebpush.webpush monkeypatched; real network never touched)
Why:  ADR-006 — Web Push 는 자체 호스팅 푸시 스택의 핵심 채널 (브라우저 +
      Electron + Flutter WebView). 발송 결과 마커가 어긋나면 outbox 가
      잘못 retry/DEAD 처리되어 사용자에게 알림이 누락된다.
      본 테스트는 web_push.send 가 (a) 정상 발송 시 success=True,
      (b) HTTP 410 Gone 시 DeviceToken 자동 삭제 + transient,
      (c) HTTP 5xx 시 transient (재시도 가능) 응답을 정확히 만들어 회귀
      보호한다.
Covers:
  - apps.notification.providers.web_push.send (200 → success)
  - apps.notification.providers.web_push.send (410 → DeviceToken deleted, transient)
  - apps.notification.providers.web_push.send (503 → transient)
  - apps.notification.providers.web_push.send (no devices → transient)
  - apps.notification.providers.web_push._parse_subscription (malformed JSON)
Out of scope:
  - 실제 푸시 게이트웨이 호출 (운영 환경에서 검증)
  - VAPID 키 발급 (manage.py generate_vapid_keys 별도 검증)
Coverage target: ≥ 85% lines for apps/notification/providers/web_push.py
"""
from __future__ import annotations

import json
import sys
import types
from typing import Any

import pytest

from apps.notification.models import DeviceToken
from apps.notification.providers import web_push
from tests.factories import MembershipFactory

pytestmark = pytest.mark.django_db


_VALID_SUB = {
    "endpoint": "https://fcm.googleapis.com/fcm/send/abc",
    "keys": {"p256dh": "BPub", "auth": "auth-secret"},
}


class _FakeResponse:
    def __init__(self, status_code: int) -> None:
        self.status_code = status_code


class _FakeWebPushException(Exception):
    """Mirrors pywebpush.WebPushException (carries .response.status_code)."""

    def __init__(self, message: str, status_code: int) -> None:
        super().__init__(message)
        self.response = _FakeResponse(status_code)


def _install_fake_pywebpush(monkeypatch: pytest.MonkeyPatch, behavior):
    """Inject a fake pywebpush module so the provider's lazy import resolves."""
    fake = types.ModuleType("pywebpush")

    def _webpush(**kwargs: Any) -> dict[str, Any]:
        return behavior(**kwargs)

    fake.webpush = _webpush  # type: ignore[attr-defined]
    fake.WebPushException = _FakeWebPushException  # type: ignore[attr-defined]
    monkeypatch.setitem(sys.modules, "pywebpush", fake)


def _configure(settings) -> None:
    settings.NOTIFICATION_PROVIDER_MODE = "real"
    settings.WEB_PUSH_VAPID_PRIVATE_KEY = "fake-private-key-pem"
    settings.WEB_PUSH_VAPID_SUBJECT = "mailto:test@work-manager.molcube.com"


# ----- happy path ------------------------------------------------------------


def test_web_push_200_returns_success(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """Successful POST → success=True with a fan-out provider_message_id.
    Why: outbox transitions to SENT and stores the count for observability.
    """
    _configure(settings)
    captured: dict[str, Any] = {}

    def _ok(**kwargs: Any) -> dict[str, Any]:
        captured.update(kwargs)
        return {"status_code": 201}

    _install_fake_pywebpush(monkeypatch, _ok)

    member = MembershipFactory()
    DeviceToken.objects.create(
        membership=member, platform="WEB", token=json.dumps(_VALID_SUB)
    )

    result = web_push.send(payload={"title": "T", "body": "B"}, membership=member)

    assert result.success is True
    assert result.provider_message_id is not None
    assert "1/1" in result.provider_message_id
    sent_data = json.loads(captured["data"])
    assert sent_data["title"] == "T"
    assert sent_data["body"] == "B"
    assert captured["vapid_private_key"] == "fake-private-key-pem"


# ----- 410 Gone: subscription expired ----------------------------------------


def test_web_push_410_deletes_subscription_and_returns_transient(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """410 Gone → DeviceToken row deleted (ops guide §5.1) AND transient marker.
    Why: an expired subscription must not be retried forever; the next send
    can pick a different device or escalate to email.
    """
    _configure(settings)

    def _gone(**_: Any) -> dict[str, Any]:
        raise _FakeWebPushException("gone", 410)

    _install_fake_pywebpush(monkeypatch, _gone)

    member = MembershipFactory()
    dead = DeviceToken.objects.create(
        membership=member, platform="WEB", token=json.dumps(_VALID_SUB)
    )

    result = web_push.send(payload={"title": "x"}, membership=member)

    assert result.success is False
    assert result.error is not None
    assert not result.error.startswith(web_push.TERMINAL_PREFIX)
    assert not DeviceToken.objects.filter(id=dead.id).exists()


# ----- 5xx transient ---------------------------------------------------------


def test_web_push_503_returns_transient_without_deletion(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """503 → transient, DeviceToken kept (push gateway hiccup, not a dead sub).
    Why: outbox should retry with backoff; the subscription is still valid.
    """
    _configure(settings)

    def _busy(**_: Any) -> dict[str, Any]:
        raise _FakeWebPushException("busy", 503)

    _install_fake_pywebpush(monkeypatch, _busy)

    member = MembershipFactory()
    alive = DeviceToken.objects.create(
        membership=member, platform="WEB", token=json.dumps(_VALID_SUB)
    )

    result = web_push.send(payload={"title": "x"}, membership=member)

    assert result.success is False
    assert result.error is not None
    assert not result.error.startswith(web_push.TERMINAL_PREFIX)
    assert DeviceToken.objects.filter(id=alive.id).exists()


# ----- no subscription -------------------------------------------------------


def test_web_push_returns_transient_when_no_subscription(settings) -> None:
    """Membership has no WEB/DESKTOP token → transient, no DB writes.
    Why: the FE may not have opted in yet; outbox should retry once a token lands.
    """
    _configure(settings)
    member = MembershipFactory()

    result = web_push.send(payload={"title": "x"}, membership=member)

    assert result.success is False
    assert "no web/desktop subscription" in (result.error or "")


# ----- malformed token row ---------------------------------------------------


def test_web_push_drops_malformed_subscription_row(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """Token column contains non-JSON garbage → row is deleted, not retried.
    Why: bad data must be evicted so subsequent attempts don't hit the same wall.
    """
    _configure(settings)
    _install_fake_pywebpush(monkeypatch, lambda **_: {"status_code": 201})

    member = MembershipFactory()
    bad = DeviceToken.objects.create(
        membership=member, platform="WEB", token="not-json"
    )

    result = web_push.send(payload={"title": "x"}, membership=member)

    assert result.success is False
    assert not DeviceToken.objects.filter(id=bad.id).exists()
