"""
Test: notification · real push provider (APNs HTTP/2 direct)
Type: Unit (httpx + JWT signing monkeypatched; real network never touched)
Why:  ADR-006 — iOS 푸시는 FCM 우회로 APNs 에 직접 POST 한다. 키/엔드포인트
      설정 누락 또는 응답 코드 분류 오류 시 (a) outbox 가 영구 실패로 잘못
      DEAD 되거나 (b) 죽은 디바이스 토큰이 영원히 retry 되어 비용/소음을
      유발한다.
      본 테스트는 (a) 200 → success, (b) 410 BadDeviceToken → DeviceToken
      삭제 + terminal: 마커, (c) APNS_KEY_PEM 미설정 → soft 실패 (router 가
      다른 채널로 fallback) 동작을 회귀 보호한다.
Covers:
  - apps.notification.providers.real_push.send (200 → success + apns-id)
  - apps.notification.providers.real_push.send (410 → DeviceToken deleted, terminal)
  - apps.notification.providers.real_push.send (APNS_KEY_PEM empty → apns_not_configured)
  - apps.notification.providers.real_push._build_payload (alert/aps shape)
Out of scope:
  - JWT 서명 자체의 정확성 (PyJWT 책임)
  - 실제 APNs 게이트웨이 응답 (운영 환경 검증)
Coverage target: ≥ 85% lines for apps/notification/providers/real_push.py
"""
from __future__ import annotations

import json
from typing import Any

import pytest

from apps.notification.models import DeviceToken
from apps.notification.providers import real_push
from tests.factories import MembershipFactory

pytestmark = pytest.mark.django_db


_FAKE_PEM = """-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg+++FAKEFAKEFAKE+
-----END PRIVATE KEY-----
"""


def _configure(monkeypatch: pytest.MonkeyPatch, settings) -> None:
    settings.NOTIFICATION_PROVIDER_MODE = "real"
    settings.APNS_KEY_ID = "ABC1234567"
    settings.APNS_TEAM_ID = "TEAM987654"
    settings.APNS_BUNDLE_ID = "com.molcube.workmanager"
    settings.APNS_KEY_PEM = _FAKE_PEM
    settings.APNS_USE_SANDBOX = True
    # Bypass JWT signing — exercise the network path, not the cryptography.
    monkeypatch.setattr(
        real_push, "_build_jwt", lambda *_args, **_kwargs: "fake.jwt.token"
    )
    real_push._jwt_cache.update(
        {"token": None, "issued_at": 0.0, "key_id": None}
    )


def _patch_post(
    monkeypatch: pytest.MonkeyPatch,
    status: int,
    apns_id: str = "x-id",
    body: str = "",
) -> dict[str, Any]:
    """Patch _post_apns to return ``status`` + capture the request payload."""
    captured: dict[str, Any] = {}

    def _fake(
        *, host: str, device_token: str, jwt_token: str, bundle_id: str, body: bytes
    ) -> tuple[int, str, str]:
        captured["host"] = host
        captured["device_token"] = device_token
        captured["jwt"] = jwt_token
        captured["bundle_id"] = bundle_id
        captured["body"] = json.loads(body.decode("utf-8"))
        return status, apns_id, ""

    monkeypatch.setattr(real_push, "_post_apns", _fake)
    return captured


def test_apns_200_returns_success_with_apns_id(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """APNs 200 → success=True + apns-id surfaced as provider_message_id.
    Why: ops can correlate a delivery with Apple's diagnostics.
    """
    _configure(monkeypatch, settings)
    captured = _patch_post(monkeypatch, 200, apns_id="apns-id-deadbeef")

    member = MembershipFactory()
    DeviceToken.objects.create(membership=member, platform="IOS", token="dead-beef")

    result = real_push.send(
        payload={"title": "T", "body": "B", "data": {"route": "/inbox"}},
        membership=member,
    )

    assert result.success is True
    assert result.provider_message_id == "apns-id-deadbeef"
    assert captured["host"] == "api.sandbox.push.apple.com"
    assert captured["bundle_id"] == "com.molcube.workmanager"
    assert captured["body"]["aps"]["alert"]["title"] == "T"
    assert captured["body"]["route"] == "/inbox"


def test_apns_not_configured_returns_soft_failure(settings) -> None:
    """APNS_KEY_PEM empty → success=False with marker 'apns_not_configured'
    (NOT terminal). Why: router can fall back to other channels without DEAD.
    """
    settings.NOTIFICATION_PROVIDER_MODE = "real"
    settings.APNS_KEY_PEM = ""

    member = MembershipFactory()
    DeviceToken.objects.create(membership=member, platform="IOS", token="x")

    result = real_push.send(payload={"title": "x"}, membership=member)

    assert result.success is False
    assert result.error == "apns_not_configured"
    assert real_push.TERMINAL_PREFIX not in (result.error or "")


def test_apns_410_bad_device_token_deletes_row_and_returns_terminal(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """410 BadDeviceToken → DeviceToken row deleted (ops guide §5.1) AND
    terminal: marker so outbox DEADs without retrying.
    Why: a permanently dead device token will never recover; retrying just
    burns retries and ops alerts.
    """
    _configure(monkeypatch, settings)
    monkeypatch.setattr(
        real_push,
        "_post_apns",
        lambda **_: (410, "x", json.dumps({"reason": "BadDeviceToken"})),
    )

    member = MembershipFactory()
    bad = DeviceToken.objects.create(
        membership=member, platform="IOS", token="dead-token"
    )

    result = real_push.send(payload={"title": "x"}, membership=member)

    assert result.success is False
    assert result.error is not None
    assert result.error.startswith(real_push.TERMINAL_PREFIX)
    assert not DeviceToken.objects.filter(id=bad.id).exists()


def test_apns_no_devices_returns_transient(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """Membership has no IOS DeviceToken → transient (token may register on retry).
    Why: outbox should retry once a token lands instead of DEADing now.
    """
    _configure(monkeypatch, settings)
    member = MembershipFactory()

    result = real_push.send(payload={"title": "x"}, membership=member)

    assert result.success is False
    assert "no iOS device token" in (result.error or "")
