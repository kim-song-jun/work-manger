"""
Test: identity · email verification (issue → verify → idempotent re-use)
Type: Integration (real Postgres, signed-token round-trip, audit log)
Why:  사용자가 회원가입 직후 이메일 인증 링크를 받지 못하거나, 잘못된/만료된 토큰을
      그대로 통과시키면 신원 확인 없는 계정이 생성된다 (docs/api/authentication.md §1).
      issue → verify → 두 번째 호출 시 ALREADY_VERIFIED 의 한 묶음으로 회귀 보호.
Covers:
  - apps.identity.services.issue_email_verification_token  — TimestampSigner 발급
  - apps.identity.services.verify_email_token              — 정상 / 잘못된 / 재사용
  - POST /v1/auth/email/verify   — 200 + 감사 로그 auth.email.verified
  - POST /v1/auth/email/resend   — 항상 200 (이메일 enumeration 방어)
Out of scope:
  - 실제 SES 발송 (provider stub 으로 대체, test_outbox 가 큐 동작은 다룸)
  - 비밀번호 재설정 (test_password_reset.py 가 다룸)
Coverage target: ≥ 90% lines for issue/verify branches in identity/services.py
"""
from __future__ import annotations

import pytest

from apps.audit.models import AuditLog
from apps.identity import services as identity_services
from apps.notification.models import NotificationOutbox
from tests.factories import MembershipFactory, UserFactory

pytestmark = pytest.mark.django_db


def test_issue_then_verify_marks_user_verified(api_client):
    """발급된 토큰을 한 번 사용하면 200 + 사용자 is_email_verified=True.
    이유: 회원가입 직후 신원 확인의 핵심 행복 경로.
    """
    # Arrange — unverified user
    user = UserFactory(is_email_verified=False)
    _, signed = identity_services.issue_email_verification_token(user)

    # Act
    r = api_client.post("/v1/auth/email/verify", {"token": signed}, format="json")

    # Assert
    assert r.status_code == 200, r.content
    assert r.json()["data"]["verified"] is True
    user.refresh_from_db()
    assert user.is_email_verified is True
    assert AuditLog.objects.filter(action="auth.email.verified", actor=user).exists()


def test_second_verify_returns_already_verified(api_client):
    """동일 사용자에 대해 두 번째 verify 호출은 409 EMAIL_ALREADY_VERIFIED.
    이유: 멱등 UX — 사용자가 링크를 다시 누르거나 이미 인증된 케이스 분리.
    """
    user = UserFactory(is_email_verified=False)
    _, signed = identity_services.issue_email_verification_token(user)
    api_client.post("/v1/auth/email/verify", {"token": signed}, format="json")

    # second use — token signature is still valid but user is already verified
    _, signed2 = identity_services.issue_email_verification_token(user)
    r = api_client.post("/v1/auth/email/verify", {"token": signed2}, format="json")

    assert r.status_code == 409
    assert r.json()["error"]["code"] == "EMAIL_ALREADY_VERIFIED"


def test_invalid_token_returns_400(api_client):
    """깨진 / 위조된 토큰 → 400 EMAIL_VERIFY_INVALID.
    이유: 서명 검증 실패는 클라이언트 입력 오류 (보안 이벤트 후보).
    """
    r = api_client.post(
        "/v1/auth/email/verify", {"token": "not-a-valid-token"}, format="json"
    )
    assert r.status_code == 400
    assert r.json()["error"]["code"] == "EMAIL_VERIFY_INVALID"


def test_resend_enqueues_email_for_unverified_user(api_client):
    """resend: 미인증 사용자에 대해 EMAIL outbox 행 추가, 응답은 200.
    이유: 사용자가 인증 메일을 못 받았을 때 재발송 경로.
    """
    user = UserFactory(is_email_verified=False)
    MembershipFactory(user=user)

    r = api_client.post("/v1/auth/email/resend", {"email": user.email}, format="json")

    assert r.status_code == 200
    assert r.json()["data"]["sent"] is True
    assert NotificationOutbox.objects.filter(
        membership__user=user, channel="EMAIL", event_kind="auth.email.verify"
    ).exists()


def test_resend_unknown_email_still_200(api_client):
    """모르는 이메일이어도 응답은 200, outbox 변화 없음.
    이유: 가입 여부를 응답으로 추론할 수 없게 (account enumeration 방어).
    """
    before = NotificationOutbox.objects.count()
    r = api_client.post(
        "/v1/auth/email/resend", {"email": "ghost@example.com"}, format="json"
    )
    assert r.status_code == 200
    assert r.json()["data"]["sent"] is True
    assert NotificationOutbox.objects.count() == before
