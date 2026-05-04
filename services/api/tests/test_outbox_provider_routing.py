"""
Test: notification · outbox routes through real provider when mode=real
Type: Integration (real Postgres, eager Celery, real_email.send spied)
Why:  운영 가이드 §5 — 발송 신뢰성은 'Outbox + Provider' 두 계층으로 보장한다.
      provider 모드 토글 (NOTIFICATION_PROVIDER_MODE) 이 dispatcher 단에서
      정확히 적용되어야 한다 — 잘못 라우팅되면 prod 에서 stub 가 호출되어
      알림이 실제로 나가지 않는 사일런트 회귀가 발생할 수 있다.
      본 테스트는 services.dispatch 가 mode=real 에서 real_email.send 를
      호출하면서도 NotificationLog + NotificationOutbox 행을 정확히
      커밋하는지 회귀 보호한다.
Covers:
  - apps.notification.providers.send (mode dispatch: stub vs real)
  - apps.notification.services.dispatch + outbox.process_one (real provider path)
Out of scope:
  - SES / FCM 응답 코드별 분기 (test_provider_real_email/push.py 가 다룸)
  - 백오프 스케줄 (test_outbox.py 가 다룸)
Coverage target: ≥ 85% lines for apps/notification/providers/__init__.py
"""
from __future__ import annotations

from typing import Any

import pytest

from apps.notification import providers, services
from apps.notification.models import NotificationLog, NotificationOutbox
from apps.notification.providers import real_email
from tests.factories import MembershipFactory

pytestmark = pytest.mark.django_db


def test_dispatch_in_real_mode_calls_real_email_and_marks_sent(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """services.dispatch under mode=real must call real_email.send (spy verifies),
    and outbox row must transition to SENT with the spy's provider_message_id.
    Why: confirms the dispatcher honors the mode toggle end-to-end.
    """
    # Arrange: flip mode + install spy on real_email.send.
    settings.NOTIFICATION_PROVIDER_MODE = "real"
    settings.EMAIL_PROVIDER = "ses"
    calls: list[dict[str, Any]] = []

    def _spy(*, payload: dict[str, Any], membership: Any) -> providers.ProviderResult:
        calls.append({"payload": payload, "member_id": str(membership.id)})
        return providers.ProviderResult(
            success=True, provider_message_id="ses-real-spy-001"
        )

    monkeypatch.setattr(real_email, "send", _spy)

    member = MembershipFactory()

    # Act
    logs = services.dispatch(
        member,
        event_kind="LEAVE_DECISION",
        payload={
            "subject": "Decision",
            "text": "Approved",
            "_to_email": member.user.email,
        },
        channels=["EMAIL"],
    )

    # Assert — spy fired exactly once with the EMAIL payload.
    assert len(calls) == 1
    assert calls[0]["payload"]["subject"] == "Decision"
    assert calls[0]["member_id"] == str(member.id)

    # Log + outbox rows committed and reflect the spy's outcome.
    assert len(logs) == 1
    log_row = NotificationLog.objects.get(id=logs[0].id)
    assert log_row.channel == "EMAIL"
    assert log_row.event_kind == "LEAVE_DECISION"
    assert log_row.delivered_at is not None
    assert log_row.failed_at is None

    outbox_rows = list(NotificationOutbox.objects.filter(membership=member))
    assert len(outbox_rows) == 1
    assert outbox_rows[0].status == NotificationOutbox.Status.SENT
    assert outbox_rows[0].provider_message_id == "ses-real-spy-001"
    assert outbox_rows[0].channel == "EMAIL"


def test_dispatch_in_stub_mode_does_not_call_real_email(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """When NOTIFICATION_PROVIDER_MODE='stub' the real_email.send spy must NOT fire.
    Why: protects the stub-mode default — tests + dev never accidentally hit
    the real SES path (which would explode without boto3 credentials).
    """
    settings.NOTIFICATION_PROVIDER_MODE = "stub"
    fired = {"count": 0}

    def _explode(**_: Any) -> providers.ProviderResult:
        fired["count"] += 1
        raise AssertionError("real_email.send must NOT be called in stub mode")

    monkeypatch.setattr(real_email, "send", _explode)

    member = MembershipFactory()
    services.dispatch(
        member,
        event_kind="LEAVE_DECISION",
        payload={"subject": "Decision", "_to_email": member.user.email},
        channels=["EMAIL"],
    )

    assert fired["count"] == 0


def test_terminal_provider_error_marks_outbox_dead_on_first_attempt(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """A terminal: prefixed error from real_email must DEAD the outbox immediately,
    regardless of remaining retry budget. Why: avoids burning quota on
    permanently-bad recipients (SES MessageRejected etc).
    """
    settings.NOTIFICATION_PROVIDER_MODE = "real"
    settings.EMAIL_PROVIDER = "ses"

    def _terminal(*, payload: dict[str, Any], membership: Any) -> providers.ProviderResult:
        return providers.ProviderResult(
            success=False, error="terminal: MessageRejected"
        )

    monkeypatch.setattr(real_email, "send", _terminal)

    member = MembershipFactory()
    logs = services.dispatch(
        member,
        event_kind="LEAVE_DECISION",
        payload={"subject": "x", "_to_email": member.user.email},
        channels=["EMAIL"],
    )

    outbox_row = NotificationOutbox.objects.get(membership=member)
    log_row = NotificationLog.objects.get(id=logs[0].id)
    assert outbox_row.status == NotificationOutbox.Status.DEAD
    assert outbox_row.attempts == 1  # didn't burn through max_attempts
    assert log_row.failed_at is not None
