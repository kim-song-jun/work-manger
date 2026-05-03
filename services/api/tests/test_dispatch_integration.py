"""
Test: notification · services.dispatch end-to-end (Log + Outbox + provider stub)
Type: Integration (real Postgres, eager Celery, provider stubs)
Why:  services.dispatch 는 도메인 코드가 알림을 만드는 단일 진입점이다.
      이 진입점이 (a) NotificationLog 를 만들고 (b) NotificationOutbox 를 만들고
      (c) eager 모드에서 provider stub 까지 흘러서 SENT + delivered_at 가
      기록되는지를 한 번에 회귀 보호한다. 이 흐름이 깨지면 도메인 어디서나
      알림이 조용히 사라진다.
Covers:
  - apps.notification.services.dispatch     — Log 생성 + outbox 연동 + 트랜잭션 경계
  - apps.notification.outbox.process_one    — 호출되어 Log.delivered_at 업데이트
  - apps.notification.providers.send        — 채널별 stub 호출
Out of scope:
  - 백오프 시간 측정 (test_outbox.py 가 다룸)
  - 구체적인 provider 결과 형식 (test_notification_providers.py 가 다룸)
Coverage target: ≥ 90% lines for apps/notification/services.py
"""
from __future__ import annotations

import pytest

from apps.notification.models import (
    DeviceToken,
    NotificationLog,
    NotificationOutbox,
    NotificationPreference,
)
from apps.notification.services import dispatch
from tests.factories import MembershipFactory

pytestmark = pytest.mark.django_db(transaction=True)


def test_dispatch_default_inapp_creates_log_and_sent_outbox():
    """Calling dispatch() with default channels should produce one INAPP Log
    row (delivered_at populated) and one Outbox row in SENT status.
    """
    # Arrange
    m = MembershipFactory()

    # Act
    logs = dispatch(
        m,
        event_kind="LEAVE_DECISION",
        payload={"approved": True, "id": "x"},
    )

    # Assert
    assert len(logs) == 1
    log = logs[0]
    assert log.channel == "INAPP"
    assert log.delivered_at is not None
    assert log.failed_at is None

    # A linked Outbox row exists and is SENT.
    outbox_rows = NotificationOutbox.objects.filter(membership=m, event_kind="LEAVE_DECISION")
    assert outbox_rows.count() == 1
    obx = outbox_rows.first()
    assert obx.status == NotificationOutbox.Status.SENT
    assert obx.sent_at is not None
    assert obx.payload_json.get("_log_id") == str(log.id)


def test_dispatch_email_channel_writes_log_and_outbox_sent():
    """EMAIL channel should likewise produce a SENT outbox + Log delivered_at."""
    m = MembershipFactory()
    logs = dispatch(
        m,
        event_kind="LEAVE_DECISION",
        payload={"id": "y"},
        channels=["EMAIL"],
    )
    assert len(logs) == 1
    assert logs[0].channel == "EMAIL"
    assert logs[0].delivered_at is not None

    obx = NotificationOutbox.objects.get(membership=m, channel="EMAIL")
    assert obx.status == NotificationOutbox.Status.SENT
    assert obx.provider_message_id.startswith("ses-stub-")


def test_dispatch_push_with_token_succeeds_end_to_end():
    """PUSH with a registered DeviceToken: outbox SENT, Log delivered."""
    m = MembershipFactory()
    DeviceToken.objects.create(membership=m, platform="WEB", token="tok-int")

    logs = dispatch(m, event_kind="OVERTIME_REQUEST", payload={}, channels=["PUSH"])
    assert len(logs) == 1
    assert logs[0].delivered_at is not None
    obx = NotificationOutbox.objects.get(membership=m, channel="PUSH")
    assert obx.status == NotificationOutbox.Status.SENT


def test_dispatch_disabled_preference_skips_channel_entirely():
    """A disabled NotificationPreference for (membership, channel, event_kind)
    must skip BOTH the Log and Outbox writes for that channel.
    """
    m = MembershipFactory()
    NotificationPreference.objects.create(
        membership=m, channel="EMAIL", event_kind="LEAVE_DECISION", enabled=False
    )
    logs = dispatch(
        m,
        event_kind="LEAVE_DECISION",
        payload={"id": "z"},
        channels=["INAPP", "EMAIL"],
    )
    chans = {log.channel for log in logs}
    assert chans == {"INAPP"}
    assert NotificationLog.objects.filter(membership=m, channel="EMAIL").count() == 0
    assert NotificationOutbox.objects.filter(membership=m, channel="EMAIL").count() == 0


def test_dispatch_force_fail_payload_creates_pending_log_and_failed_outbox():
    """When the payload forces provider failure, the Log row stays pending
    (delivered_at NULL, failed_at NULL until DEAD) and the Outbox is FAILED.
    """
    m = MembershipFactory()
    logs = dispatch(
        m,
        event_kind="LEAVE_EXPIRING",
        payload={"_force_fail": True},
        channels=["INAPP"],
    )
    assert len(logs) == 1
    log = logs[0]
    assert log.delivered_at is None
    assert log.failed_at is None

    obx = NotificationOutbox.objects.get(membership=m, channel="INAPP")
    assert obx.status == NotificationOutbox.Status.FAILED
    assert obx.attempts == 1
    assert obx.last_error and "forced failure" in obx.last_error
