"""
Test: notification · real email provider (AWS SES + SMTP fallback)
Type: Unit (real_email module called directly; boto3 / django.core.mail monkeypatched)
Why:  운영 가이드 §5.2 — SES 평판/실패 분류는 알림 신뢰성의 핵심.
      SES throttling 같은 일시 오류는 백오프 후 재시도되어야 하지만,
      MessageRejected 같은 영구 오류는 즉시 DEAD 로 보내야 (쿼터 낭비 방지).
      본 테스트는 real_email.send 가 transient/terminal 분류와
      SMTP fallback 경로 (EMAIL_PROVIDER=smtp) 의 실패 마커를 정확히
      만들어 outbox 의 retry/DEAD 결정을 회귀 보호한다.
Covers:
  - apps.notification.providers.real_email.send (SES happy path)
  - apps.notification.providers.real_email.send (SES throttling → transient)
  - apps.notification.providers.real_email.send (SES MessageRejected → terminal)
  - apps.notification.providers.real_email.send (SMTP fallback failure → transient)
Out of scope:
  - 실제 AWS SES API 호출 (stage 환경에서 검증)
  - outbox 상태 전이 (test_outbox_provider_routing.py 가 dispatch + outbox 통합)
Coverage target: ≥ 90% lines for apps/notification/providers/real_email.py
"""
from __future__ import annotations

from typing import Any

import pytest

from apps.notification.providers import real_email
from tests.factories import MembershipFactory

pytestmark = pytest.mark.django_db


# ----- helpers ---------------------------------------------------------------


class _FakeSESClient:
    """Drop-in replacement for ``boto3.client('ses')`` used by monkeypatch."""

    def __init__(self, behavior: str = "ok") -> None:
        self.behavior = behavior
        self.calls: list[dict[str, Any]] = []

    def send_email(self, **kwargs: Any) -> dict[str, Any]:
        self.calls.append(kwargs)
        if self.behavior == "ok":
            return {"MessageId": "msg-fake-123"}
        if self.behavior == "throttle":
            from botocore.exceptions import ClientError

            raise ClientError(
                error_response={"Error": {"Code": "Throttling", "Message": "Slow down"}},
                operation_name="SendEmail",
            )
        if self.behavior == "rejected":
            from botocore.exceptions import ClientError

            raise ClientError(
                error_response={
                    "Error": {"Code": "MessageRejected", "Message": "Email address is not verified"}
                },
                operation_name="SendEmail",
            )
        raise AssertionError(f"unknown behavior: {self.behavior}")


def _patch_boto3(monkeypatch: pytest.MonkeyPatch, client: _FakeSESClient) -> None:
    """Patch boto3.client so the SES branch routes through ``client``."""
    import boto3

    def _factory(service: str, region_name: str | None = None, **_: Any) -> _FakeSESClient:
        assert service == "ses", f"unexpected service: {service}"
        return client

    monkeypatch.setattr(boto3, "client", _factory)


# ----- SES happy path --------------------------------------------------------


def test_real_email_ses_success_returns_provider_message_id(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """SES happy path → success=True + MessageId surfaces as provider_message_id.
    Why: outbox marks SENT only when provider_message_id is set; this is the
    primary contract between the provider and the outbox SENT transition.
    """
    # Arrange
    settings.NOTIFICATION_PROVIDER_MODE = "real"
    settings.EMAIL_PROVIDER = "ses"
    fake = _FakeSESClient(behavior="ok")
    _patch_boto3(monkeypatch, fake)
    member = MembershipFactory()

    # Act
    result = real_email.send(
        payload={
            "subject": "Hello",
            "text": "plain",
            "html": "<p>html</p>",
            "_to_email": member.user.email,
        },
        membership=member,
    )

    # Assert
    assert result.success is True
    assert result.provider_message_id == "msg-fake-123"
    assert result.error is None
    assert len(fake.calls) == 1
    call = fake.calls[0]
    assert call["Destination"]["ToAddresses"] == [member.user.email]
    assert call["Message"]["Subject"]["Data"] == "Hello"


# ----- SES transient (throttling) -------------------------------------------


def test_real_email_ses_throttling_returns_transient_failure(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """SES Throttling → success=False, error WITHOUT terminal: prefix.
    Why: outbox must retry with backoff (real_email returns transient marker).
    """
    settings.NOTIFICATION_PROVIDER_MODE = "real"
    settings.EMAIL_PROVIDER = "ses"
    _patch_boto3(monkeypatch, _FakeSESClient(behavior="throttle"))
    member = MembershipFactory()

    result = real_email.send(payload={"_to_email": "x@y.z"}, membership=member)

    assert result.success is False
    assert result.error is not None
    assert not result.error.startswith(real_email.TERMINAL_PREFIX)
    assert "Throttling" in result.error


# ----- SES terminal (MessageRejected) ---------------------------------------


def test_real_email_ses_message_rejected_returns_terminal_marker(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """SES MessageRejected → terminal: prefix so outbox bypasses retry budget.
    Why: a rejected sender / recipient won't recover — retrying burns SES quota.
    """
    settings.NOTIFICATION_PROVIDER_MODE = "real"
    settings.EMAIL_PROVIDER = "ses"
    _patch_boto3(monkeypatch, _FakeSESClient(behavior="rejected"))
    member = MembershipFactory()

    result = real_email.send(payload={"_to_email": "x@y.z"}, membership=member)

    assert result.success is False
    assert result.error is not None
    assert result.error.startswith(real_email.TERMINAL_PREFIX)
    assert "MessageRejected" in result.error


# ----- SMTP fallback ---------------------------------------------------------


def test_real_email_smtp_fallback_failure_returns_transient(
    monkeypatch: pytest.MonkeyPatch, settings
) -> None:
    """When EMAIL_PROVIDER=smtp the module routes through django.core.mail.
    A raised exception must surface as transient (no terminal: prefix).
    Why: SMTP errors are typically network-level, retryable.
    """
    settings.NOTIFICATION_PROVIDER_MODE = "real"
    settings.EMAIL_PROVIDER = "smtp"

    def _boom(**_: Any) -> int:
        raise ConnectionRefusedError("mta down")

    # Patch the symbol AS RESOLVED INSIDE real_email at call time.
    monkeypatch.setattr("apps.notification.providers.real_email.send_mail", _boom, raising=False)
    # The function imports lazily so also patch on django.core.mail.
    import django.core.mail as dj_mail

    monkeypatch.setattr(dj_mail, "send_mail", _boom)
    member = MembershipFactory()

    result = real_email.send(payload={"_to_email": "z@y.com"}, membership=member)

    assert result.success is False
    assert result.error is not None
    assert not result.error.startswith(real_email.TERMINAL_PREFIX)
    assert "smtp" in result.error.lower()


def test_real_email_missing_recipient_returns_terminal(settings) -> None:
    """No recipient resolvable → terminal (no point retrying without an address).
    Why: DEAD-letter immediately so ops can fix the upstream payload.
    """
    settings.NOTIFICATION_PROVIDER_MODE = "real"
    member = MembershipFactory()
    member.user.email = ""
    member.user.save(update_fields=["email"])

    result = real_email.send(payload={}, membership=member)

    assert result.success is False
    assert result.error is not None
    assert result.error.startswith(real_email.TERMINAL_PREFIX)
