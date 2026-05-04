"""
Test: notification · ntfy provider (self-hosted Android push)
Type: Unit (urllib.request.urlopen monkeypatched; real network never touched)
Why:  ADR-006 — ntfy 가 Android 채널이라 발송 결과 마커가 어긋나면
      Android 사용자에게 알림이 안 가거나 outbox 가 잘못 DEAD 된다.
      본 테스트는 (a) 200 → success, (b) 401 → terminal: (재시도 안 함),
      (c) 503 → transient (재시도) 응답을 정확히 만들어 회귀 보호한다.
Covers:
  - apps.notification.providers.ntfy.send (200 → success + topic id)
  - apps.notification.providers.ntfy.send (401 → terminal: marker)
  - apps.notification.providers.ntfy.send (503 → transient marker)
  - apps.notification.providers.ntfy.topic_for (per-membership topic shape)
Out of scope:
  - 실제 ntfy 컨테이너 통신 (compose smoke 테스트가 다룸)
  - Android FE 의 WebSocket 구독 (apps/mobile/test/ntfy_client_test.dart)
Coverage target: ≥ 85% lines for apps/notification/providers/ntfy.py
"""
from __future__ import annotations

import io
import json
import urllib.error
from typing import Any

import pytest

from apps.notification.providers import ntfy
from tests.factories import MembershipFactory

pytestmark = pytest.mark.django_db


class _FakeResponse:
    def __init__(self, status: int, body: str = "") -> None:
        self.status = status
        self._buf = io.BytesIO(body.encode("utf-8"))

    def read(self) -> bytes:
        return self._buf.read()

    def __enter__(self) -> "_FakeResponse":
        return self

    def __exit__(self, *_: Any) -> None:
        return None


def _configure(settings) -> None:
    settings.NOTIFICATION_PROVIDER_MODE = "real"
    settings.NTFY_BASE_URL = "http://ntfy:80"
    settings.NTFY_TOPIC_PREFIX = "wm-test"
    settings.NTFY_AUTH_TOKEN = "tk_fake-publisher"


def test_ntfy_topic_for_membership_uses_prefix(settings) -> None:
    """topic_for must produce the predictable shape the Android client subscribes to.
    Why: BE publish topic and FE subscribe topic MUST agree byte-for-byte.
    """
    settings.NTFY_TOPIC_PREFIX = "wm-prod"
    assert ntfy.topic_for("abc-123") == "wm-prod-membership-abc-123"


def test_ntfy_200_returns_success(monkeypatch: pytest.MonkeyPatch, settings) -> None:
    """ntfy POST 200 → success=True with the topic encoded in provider_message_id.
    Why: ops can grep logs by topic to correlate a delivery with the recipient.
    """
    _configure(settings)
    captured: dict[str, Any] = {}

    def _fake_urlopen(req: Any, timeout: int = 5) -> _FakeResponse:
        captured["url"] = req.full_url
        captured["headers"] = dict(req.headers)
        captured["body"] = json.loads(req.data.decode("utf-8"))
        return _FakeResponse(200, "{}")

    monkeypatch.setattr("urllib.request.urlopen", _fake_urlopen)

    member = MembershipFactory()
    result = ntfy.send(
        payload={"title": "T", "body": "B", "url": "/inbox"},
        membership=member,
    )

    assert result.success is True
    assert result.provider_message_id is not None
    assert f"membership-{member.id}" in result.provider_message_id
    assert captured["headers"]["Authorization"] == "Bearer tk_fake-publisher"
    assert captured["body"]["title"] == "T"
    assert captured["body"]["message"] == "B"
    assert captured["body"]["click"] == "/inbox"


def test_ntfy_401_returns_terminal_marker(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """401 → terminal: prefix; outbox must DEAD on next attempt.
    Why: bad publisher credentials won't fix themselves between attempts.
    """
    _configure(settings)

    def _fake_urlopen(req: Any, timeout: int = 5) -> _FakeResponse:
        raise urllib.error.HTTPError(
            req.full_url, 401, "Unauthorized", hdrs=None, fp=io.BytesIO(b"unauth")
        )

    monkeypatch.setattr("urllib.request.urlopen", _fake_urlopen)

    member = MembershipFactory()
    result = ntfy.send(payload={"title": "x"}, membership=member)

    assert result.success is False
    assert result.error is not None
    assert result.error.startswith(ntfy.TERMINAL_PREFIX)


def test_ntfy_503_returns_transient(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """503 → transient marker; outbox should retry with backoff.
    Why: ntfy server may be restarting; the same publish will succeed shortly.
    """
    _configure(settings)

    def _fake_urlopen(req: Any, timeout: int = 5) -> _FakeResponse:
        raise urllib.error.HTTPError(
            req.full_url, 503, "Unavailable", hdrs=None, fp=io.BytesIO(b"")
        )

    monkeypatch.setattr("urllib.request.urlopen", _fake_urlopen)

    member = MembershipFactory()
    result = ntfy.send(payload={"title": "x"}, membership=member)

    assert result.success is False
    assert result.error is not None
    assert not result.error.startswith(ntfy.TERMINAL_PREFIX)
