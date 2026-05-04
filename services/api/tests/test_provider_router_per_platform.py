"""
Test: notification · provider router fan-out per DeviceToken platform
Type: Unit (per-channel modules monkeypatched; only the router is exercised)
Why:  ADR-006 — PUSH 채널은 더 이상 단일 provider 가 아니다. 한 멤버가
      WEB / IOS / ANDROID 디바이스를 모두 등록해 둘 수 있고, 각 platform
      별로 web_push / real_push (APNs) / ntfy 가 정확히 한 번씩 호출되어야
      한다. fan-out 이 깨지면 한 채널이 실패해도 다른 채널에 알림이 가는
      "best-effort" 가 무너져 사용자 한 명이 동시에 모든 채널을 잃을 수 있다.
      본 테스트는 router 가 (a) 정확한 모듈에 dispatch 하고, (b) 한 채널만
      성공해도 overall success 를 반환하며, (c) 모든 채널 실패 시 details
      에 per-platform 사유를 기록함을 회귀 보호한다.
Covers:
  - apps.notification.providers.send (channel="PUSH", mode="real")
  - apps.notification.providers._real_push_fanout (per-platform routing)
  - apps.notification.providers.ProviderResult.details aggregation
Out of scope:
  - 실제 web-push / APNs / ntfy 통신 (각 모듈 별 단위 테스트가 다룸)
Coverage target: ≥ 85% lines for apps/notification/providers/__init__.py
                 (PUSH fan-out branches)
"""
from __future__ import annotations

from typing import Any

import pytest

from apps.notification import providers
from apps.notification.models import DeviceToken
from apps.notification.providers import ntfy as ntfy_mod
from apps.notification.providers import real_push as apns_mod
from apps.notification.providers import web_push as wp_mod
from tests.factories import MembershipFactory

pytestmark = pytest.mark.django_db


def test_real_mode_push_fans_out_to_web_apns_and_ntfy(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """1 membership × {WEB, IOS, ANDROID} tokens → each provider called once.
    Why: confirms the router groups by platform and never double-publishes;
    a re-call would cost money on apple/ntfy and surface as a duplicate notif.
    """
    settings.NOTIFICATION_PROVIDER_MODE = "real"
    member = MembershipFactory()
    DeviceToken.objects.create(membership=member, platform="WEB", token='{"endpoint":"x","keys":{"p256dh":"a","auth":"b"}}')
    DeviceToken.objects.create(membership=member, platform="IOS", token="apns-tok")
    DeviceToken.objects.create(membership=member, platform="ANDROID", token="topic-x")

    calls: dict[str, list[dict[str, Any]]] = {"web": [], "apns": [], "ntfy": []}

    def _spy_web(*, payload: dict[str, Any], membership: Any) -> providers.ProviderResult:
        calls["web"].append({"payload": payload})
        return providers.ProviderResult(success=True, provider_message_id="web-id-1")

    def _spy_apns(*, payload: dict[str, Any], membership: Any) -> providers.ProviderResult:
        calls["apns"].append({"payload": payload})
        return providers.ProviderResult(success=True, provider_message_id="apns-id-1")

    def _spy_ntfy(*, payload: dict[str, Any], membership: Any) -> providers.ProviderResult:
        calls["ntfy"].append({"payload": payload})
        return providers.ProviderResult(success=True, provider_message_id="ntfy-id-1")

    monkeypatch.setattr(wp_mod, "send", _spy_web)
    monkeypatch.setattr(apns_mod, "send", _spy_apns)
    monkeypatch.setattr(ntfy_mod, "send", _spy_ntfy)

    payload = {"title": "T", "body": "B", "url": "/inbox"}
    result = providers.send("PUSH", payload, member)

    assert result.success is True
    assert len(calls["web"]) == 1
    assert len(calls["apns"]) == 1
    assert len(calls["ntfy"]) == 1
    assert calls["web"][0]["payload"]["title"] == "T"
    # Each platform sees the same payload — uniform contract.
    assert calls["apns"][0]["payload"] == payload
    assert calls["ntfy"][0]["payload"] == payload
    # Aggregated message id includes all platforms.
    assert "web_push" in (result.provider_message_id or "")
    assert "real_push" in (result.provider_message_id or "")
    assert "ntfy" in (result.provider_message_id or "")


def test_real_mode_push_succeeds_when_at_least_one_platform_succeeds(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """One platform succeeds while two fail transient → overall success.
    Why: best-effort delivery — outbox marks SENT and the user gets notified
    at least once across the available transports.
    """
    settings.NOTIFICATION_PROVIDER_MODE = "real"
    member = MembershipFactory()
    DeviceToken.objects.create(membership=member, platform="WEB", token='{"endpoint":"x","keys":{"p256dh":"a","auth":"b"}}')
    DeviceToken.objects.create(membership=member, platform="IOS", token="apns-tok")
    DeviceToken.objects.create(membership=member, platform="ANDROID", token="topic-x")

    monkeypatch.setattr(
        wp_mod,
        "send",
        lambda *, payload, membership: providers.ProviderResult(
            success=True, provider_message_id="web-ok"
        ),
    )
    monkeypatch.setattr(
        apns_mod,
        "send",
        lambda *, payload, membership: providers.ProviderResult(
            success=False, error="apns-transient: HTTP 503"
        ),
    )
    monkeypatch.setattr(
        ntfy_mod,
        "send",
        lambda *, payload, membership: providers.ProviderResult(
            success=False, error="ntfy-transient: HTTP 502"
        ),
    )

    result = providers.send("PUSH", {"title": "x"}, member)

    assert result.success is True
    assert result.details.get("successes", {}).get("web_push") == "web-ok"
    failures = result.details.get("failures", {})
    assert "real_push" in failures
    assert "ntfy" in failures


def test_real_mode_push_aggregates_terminal_when_all_terminal(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """All platforms return terminal: → overall error carries terminal: prefix.
    Why: outbox must DEAD without burning retries when nothing is recoverable.
    """
    settings.NOTIFICATION_PROVIDER_MODE = "real"
    member = MembershipFactory()
    DeviceToken.objects.create(membership=member, platform="IOS", token="apns-tok")
    DeviceToken.objects.create(membership=member, platform="ANDROID", token="topic-x")

    monkeypatch.setattr(
        apns_mod,
        "send",
        lambda *, payload, membership: providers.ProviderResult(
            success=False, error="terminal: apns-auth: HTTP 403"
        ),
    )
    monkeypatch.setattr(
        ntfy_mod,
        "send",
        lambda *, payload, membership: providers.ProviderResult(
            success=False, error="terminal: ntfy-auth: HTTP 401"
        ),
    )

    result = providers.send("PUSH", {"title": "x"}, member)

    assert result.success is False
    assert providers.is_terminal_error(result.error) is True
