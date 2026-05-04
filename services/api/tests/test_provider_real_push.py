"""
Test: notification · real push provider (FCM HTTP v1)
Type: Unit (urllib + google-auth monkeypatched; real network never touched)
Why:  운영 가이드 §5.1 — UNREGISTERED 토큰은 자동 비활성화. §5.3 — 실패는
      백오프 후 재시도. FCM 인증 오류 (401) 는 영구 실패라 즉시 DEAD.
      본 테스트는 real_push.send 가 FCM 응답 코드별로 transient/terminal
      마커를 정확히 만들고, 404/UNREGISTERED 응답 시 DeviceToken 행을
      즉시 삭제해 다음 발송이 다른 토큰으로 fallback 되도록 회귀 보호한다.
Covers:
  - apps.notification.providers.real_push.send (200 → success + provider_message_id)
  - apps.notification.providers.real_push.send (401 → terminal: marker)
  - apps.notification.providers.real_push.send (404 → DeviceToken deleted + transient)
  - apps.notification.providers.real_push._load_service_account (inline JSON path)
Out of scope:
  - 실제 FCM 호출 (stage 환경에서 검증)
  - APNs HTTP/2 직접 경로 (현재는 FCM 라우팅으로 통일)
Coverage target: ≥ 85% lines for apps/notification/providers/real_push.py
"""
from __future__ import annotations

import io
import json
import urllib.error
from typing import Any

import pytest

from apps.notification.models import DeviceToken
from apps.notification.providers import real_push
from tests.factories import MembershipFactory

pytestmark = pytest.mark.django_db


# ----- helpers ---------------------------------------------------------------


_FAKE_SA = {
    "type": "service_account",
    "project_id": "wm-fake-project",
    "private_key_id": "x",
    "private_key": "-----BEGIN PRIVATE KEY-----\nfake\n-----END PRIVATE KEY-----\n",
    "client_email": "wm@wm-fake.iam.gserviceaccount.com",
    "client_id": "1",
    "token_uri": "https://oauth2.googleapis.com/token",
}


class _FakeResponse:
    """Mimics the context-manager return of urllib.request.urlopen."""

    def __init__(self, status: int, body: dict[str, Any] | str = ""):
        self.status = status
        if isinstance(body, dict):
            payload = json.dumps(body).encode("utf-8")
        else:
            payload = (body or "").encode("utf-8")
        self._buf = io.BytesIO(payload)

    def read(self) -> bytes:
        return self._buf.read()

    def __enter__(self) -> "_FakeResponse":
        return self

    def __exit__(self, *_: Any) -> None:
        return None


def _patch_token_and_settings(monkeypatch: pytest.MonkeyPatch, settings) -> None:
    """Bypass google-auth network call; configure the inline-JSON SA path."""
    settings.NOTIFICATION_PROVIDER_MODE = "real"
    settings.FCM_SERVICE_ACCOUNT_JSON = json.dumps(_FAKE_SA)
    monkeypatch.setattr(real_push, "_access_token", lambda _sa: "ya29.fake-access-token")


# ----- happy path ------------------------------------------------------------


def test_real_push_fcm_200_returns_success(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """FCM 200 → success=True, provider_message_id from response 'name'.
    Why: outbox transitions to SENT and sets provider_message_id from the FCM
    resource name, which ops can correlate against the FCM console.
    """
    _patch_token_and_settings(monkeypatch, settings)
    captured: dict[str, Any] = {}

    def _fake_urlopen(req: Any, timeout: int = 10) -> _FakeResponse:
        captured["url"] = req.full_url
        captured["headers"] = dict(req.headers)
        captured["body"] = json.loads(req.data.decode("utf-8"))
        return _FakeResponse(
            200, {"name": "projects/wm-fake-project/messages/abc-123"}
        )

    monkeypatch.setattr("urllib.request.urlopen", _fake_urlopen)

    member = MembershipFactory()
    DeviceToken.objects.create(membership=member, platform="ANDROID", token="fcm-tok-1")

    result = real_push.send(
        payload={"title": "T", "body": "B", "data": {"k": 1}},
        membership=member,
    )

    assert result.success is True
    assert result.provider_message_id == "projects/wm-fake-project/messages/abc-123"
    assert "wm-fake-project" in captured["url"]
    assert captured["headers"]["Authorization"] == "Bearer ya29.fake-access-token"
    assert captured["body"]["message"]["token"] == "fcm-tok-1"
    # data values must be coerced to strings per FCM contract
    assert captured["body"]["message"]["data"] == {"k": "1"}


# ----- terminal (auth) -------------------------------------------------------


def test_real_push_fcm_401_returns_terminal_marker(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """FCM 401 → terminal: prefix; outbox must DEAD on next attempt.
    Why: bad credentials won't fix themselves between attempts.
    """
    _patch_token_and_settings(monkeypatch, settings)

    def _fake_urlopen(req: Any, timeout: int = 10) -> _FakeResponse:
        raise urllib.error.HTTPError(
            req.full_url, 401, "Unauthorized", hdrs=None, fp=io.BytesIO(b"unauth")
        )

    monkeypatch.setattr("urllib.request.urlopen", _fake_urlopen)

    member = MembershipFactory()
    DeviceToken.objects.create(membership=member, platform="ANDROID", token="fcm-tok-401")

    result = real_push.send(payload={"title": "x"}, membership=member)

    assert result.success is False
    assert result.error is not None
    assert result.error.startswith(real_push.TERMINAL_PREFIX)


# ----- token unregistered ---------------------------------------------------


def test_real_push_fcm_404_unregistered_deletes_device_token(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """FCM 404 (UNREGISTERED) → DeviceToken row is deleted (ops guide §5.1).
    Why: an invalid token must not be re-tried forever; future sends should
    pick a different (still-valid) device.
    """
    _patch_token_and_settings(monkeypatch, settings)

    def _fake_urlopen(req: Any, timeout: int = 10) -> _FakeResponse:
        raise urllib.error.HTTPError(
            req.full_url,
            404,
            "Not Found",
            hdrs=None,
            fp=io.BytesIO(b'{"error":{"status":"UNREGISTERED"}}'),
        )

    monkeypatch.setattr("urllib.request.urlopen", _fake_urlopen)

    member = MembershipFactory()
    bad = DeviceToken.objects.create(
        membership=member, platform="IOS", token="fcm-tok-dead"
    )
    bad_id = str(bad.id)

    result = real_push.send(payload={"title": "x"}, membership=member)

    assert result.success is False
    assert result.error is not None
    assert not result.error.startswith(real_push.TERMINAL_PREFIX)
    assert not DeviceToken.objects.filter(id=bad_id).exists()
