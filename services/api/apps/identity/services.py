"""Identity domain services — auth lockout, 2FA, recovery codes,
email verification and password reset.

Per docs/api/authentication.md §2 (lockout), §8 (2FA), and the email-verify /
password-reset sections of docs/api/api-spec.md §1.
"""
from __future__ import annotations

import logging
import secrets
import uuid
from datetime import timedelta
from typing import Iterable

import pyotp
from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.core.cache import cache
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.signing import BadSignature, SignatureExpired, TimestampSigner
from django.utils import timezone as django_tz

from core.errors import DomainError

from .models import RecoveryCode, User

logger = logging.getLogger(__name__)


# ───────────────────────── Lockout ─────────────────────────
def is_locked(user: User) -> bool:
    return bool(user.locked_until and user.locked_until > django_tz.now())


def register_failed_login(user: User) -> None:
    """Increment counter; lock the account after threshold reached."""
    user.failed_login_count = (user.failed_login_count or 0) + 1
    threshold = getattr(settings, "AUTH_LOCKOUT_THRESHOLD", 5)
    duration: timedelta = getattr(
        settings, "AUTH_LOCKOUT_DURATION", timedelta(minutes=15)
    )
    if user.failed_login_count >= threshold:
        user.locked_until = django_tz.now() + duration
    user.save(update_fields=["failed_login_count", "locked_until", "updated_at"])


def reset_lockout(user: User) -> None:
    if user.failed_login_count or user.locked_until:
        user.failed_login_count = 0
        user.locked_until = None
        user.save(update_fields=["failed_login_count", "locked_until", "updated_at"])


# ───────────────────────── 2FA / TOTP ─────────────────────────
def provision_totp(user: User, *, issuer: str = "Work Manager") -> tuple[str, str]:
    """Generate a fresh TOTP secret (does NOT enable until verified).

    Returns (base32_secret, otpauth_uri).
    """
    secret = pyotp.random_base32()
    user.totp_secret = secret
    user.totp_enabled = False
    user.save(update_fields=["totp_secret", "totp_enabled", "updated_at"])
    uri = pyotp.totp.TOTP(secret).provisioning_uri(name=user.email, issuer_name=issuer)
    return secret, uri


def verify_totp(user: User, code: str) -> bool:
    if not user.totp_secret:
        return False
    return pyotp.TOTP(user.totp_secret).verify(code, valid_window=1)


def enable_totp_after_verify(user: User, code: str) -> list[str]:
    """Verify the user-entered code and turn 2FA on. Returns recovery codes (plaintext, once)."""
    if not verify_totp(user, code):
        return []
    user.totp_enabled = True
    user.save(update_fields=["totp_enabled", "updated_at"])
    return rotate_recovery_codes(user)


def disable_totp(user: User) -> None:
    user.totp_secret = ""
    user.totp_enabled = False
    user.save(update_fields=["totp_secret", "totp_enabled", "updated_at"])
    user.recovery_codes.all().delete()


# ───────────────────────── Recovery Codes ─────────────────────────
def _generate_codes(n: int) -> list[str]:
    return ["-".join(secrets.token_hex(2) for _ in range(2)) for _ in range(n)]


def rotate_recovery_codes(user: User) -> list[str]:
    """Replace existing recovery codes with a fresh batch. Returns plaintext (only chance)."""
    user.recovery_codes.all().delete()
    n = getattr(settings, "TWO_FA_RECOVERY_CODE_COUNT", 10)
    plain = _generate_codes(n)
    RecoveryCode.objects.bulk_create(
        [RecoveryCode(user=user, code_hash=make_password(c)) for c in plain]
    )
    return plain


def consume_recovery_code(user: User, code: str) -> bool:
    """Verify and burn a single recovery code; returns True on success."""
    for rc in user.recovery_codes.filter(used_at__isnull=True):
        if check_password(code, rc.code_hash):
            rc.used_at = django_tz.now()
            rc.save(update_fields=["used_at"])
            return True
    return False


# ───────────────────────── 2FA Challenge Token ─────────────────────────
def issue_2fa_challenge(user: User) -> str:
    """Short-lived signed token used to bridge login → 2FA challenge."""
    from django.core.signing import TimestampSigner

    signer = TimestampSigner(salt="2fa-challenge")
    return signer.sign(str(user.id))


def consume_2fa_challenge(token: str) -> User | None:
    from django.core.signing import BadSignature, SignatureExpired, TimestampSigner

    signer = TimestampSigner(salt="2fa-challenge")
    ttl = getattr(settings, "TWO_FA_CHALLENGE_TTL_SECONDS", 60)
    try:
        user_id = signer.unsign(token, max_age=ttl)
    except (BadSignature, SignatureExpired):
        return None
    return User.objects.filter(id=user_id).first()


# ───────────────────────── Refresh Token Invalidation ─────────────────────────
def blacklist_all_refresh_tokens(user: User) -> int:
    """Blacklist every outstanding refresh token issued for this user."""
    from rest_framework_simplejwt.token_blacklist.models import (
        BlacklistedToken,
        OutstandingToken,
    )

    n = 0
    for ot in OutstandingToken.objects.filter(user_id=user.id):
        _, created = BlacklistedToken.objects.get_or_create(token=ot)
        if created:
            n += 1
    return n


def hashed_codes(codes: Iterable[str]) -> list[str]:
    """Helper for tests/devs."""
    return [make_password(c) for c in codes]


# ───────────────────────── Email verification ─────────────────────────
EMAIL_VERIFY_SALT = "email-verify"
EMAIL_VERIFY_TTL_SECONDS = 60 * 60 * 24  # 24h


def issue_email_verification_token(user: User) -> tuple[str, str]:
    """Return ``(jti, signed_token)`` for an email-verification link.

    The ``jti`` is embedded so the link cannot be reused after verification —
    the user's ``is_email_verified`` flag flips on first consumption and any
    subsequent call raises ``EMAIL_ALREADY_VERIFIED``.
    """
    signer = TimestampSigner(salt=EMAIL_VERIFY_SALT)
    jti = uuid.uuid4().hex
    payload = f"{user.id}:{jti}"
    return jti, signer.sign(payload)


def verify_email_token(token: str) -> User:
    """Validate the signed token and mark the user as email-verified.

    Raises ``DomainError(EMAIL_VERIFY_INVALID)`` for bad/expired signatures and
    ``DomainError(EMAIL_ALREADY_VERIFIED, 409)`` when the user has already
    completed verification (idempotent UX, distinct from "invalid").
    """
    signer = TimestampSigner(salt=EMAIL_VERIFY_SALT)
    try:
        unsigned = signer.unsign(token, max_age=EMAIL_VERIFY_TTL_SECONDS)
    except (BadSignature, SignatureExpired) as exc:
        raise DomainError(
            code="EMAIL_VERIFY_INVALID",
            message="이메일 인증 링크가 유효하지 않거나 만료되었습니다.",
            status_code=400,
        ) from exc
    try:
        user_id, _jti = unsigned.split(":", 1)
    except ValueError as exc:
        raise DomainError(
            code="EMAIL_VERIFY_INVALID",
            message="이메일 인증 링크가 유효하지 않습니다.",
            status_code=400,
        ) from exc
    user = User.objects.filter(id=user_id).first()
    if user is None:
        raise DomainError(
            code="EMAIL_VERIFY_INVALID",
            message="이메일 인증 링크가 유효하지 않습니다.",
            status_code=400,
        )
    if user.is_email_verified:
        raise DomainError(
            code="EMAIL_ALREADY_VERIFIED",
            message="이미 인증된 이메일입니다.",
            status_code=409,
        )
    user.is_email_verified = True
    user.save(update_fields=["is_email_verified", "updated_at"])
    return user


# ───────────────────────── Password reset ─────────────────────────
PASSWORD_RESET_SALT = "password-reset"
PASSWORD_RESET_TTL_SECONDS = 60 * 15  # 15min
_PWRESET_USED_PREFIX = "pwreset:used:"
_PWRESET_USED_TTL = 60 * 30  # 30min: longer than token TTL so reuse is detectable


def issue_password_reset_token(user: User) -> tuple[str, str]:
    """Return ``(jti, signed_token)`` for a password-reset link (TTL 15min)."""
    signer = TimestampSigner(salt=PASSWORD_RESET_SALT)
    jti = uuid.uuid4().hex
    payload = f"{user.id}:{jti}"
    return jti, signer.sign(payload)


def reset_token_use_log(user_id, token_jti: str) -> bool:
    """Atomically mark a reset-token jti as used. Returns True iff the
    caller "won" the race (this is the first use). Implemented via Redis
    SETNX semantics through Django's cache backend (``add()``).

    The stored value is the bcrypt/argon2 hash of the jti (never raw) so even
    a Redis dump cannot be replayed against the API.
    """
    key = f"{_PWRESET_USED_PREFIX}{token_jti}"
    try:
        return bool(
            cache.add(key, make_password(f"{user_id}:{token_jti}"), _PWRESET_USED_TTL)
        )
    except Exception:  # noqa: BLE001 — Redis hiccup must not silently allow reuse
        logger.exception("password_reset.cache.add_failed")
        return False


def consume_password_reset_token(token: str, new_password: str) -> User:
    """Validate the signed reset token, apply the new password, blacklist all
    refresh tokens, and clear the lockout counter. The token's ``jti`` is
    burned in Redis so a second call (replay) raises ``PASSWORD_RESET_USED``.
    """
    signer = TimestampSigner(salt=PASSWORD_RESET_SALT)
    try:
        unsigned = signer.unsign(token, max_age=PASSWORD_RESET_TTL_SECONDS)
    except (BadSignature, SignatureExpired) as exc:
        raise DomainError(
            code="PASSWORD_RESET_INVALID",
            message="비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.",
            status_code=400,
        ) from exc
    try:
        user_id, jti = unsigned.split(":", 1)
    except ValueError as exc:
        raise DomainError(
            code="PASSWORD_RESET_INVALID",
            message="비밀번호 재설정 링크가 유효하지 않습니다.",
            status_code=400,
        ) from exc
    user = User.objects.filter(id=user_id).first()
    if user is None:
        raise DomainError(
            code="PASSWORD_RESET_INVALID",
            message="비밀번호 재설정 링크가 유효하지 않습니다.",
            status_code=400,
        )

    # Validate password BEFORE burning the token so the user can retry on a
    # weak password without losing the link.
    try:
        validate_password(new_password, user=user)
    except DjangoValidationError as exc:
        raise DomainError(
            code="VALIDATION_ERROR",
            message="비밀번호 정책을 만족하지 않습니다.",
            status_code=400,
            details={"fields": list(exc.messages)},
        ) from exc

    # One-time use: SETNX-style guard. If we lose the race, this token has
    # already been consumed.
    if not reset_token_use_log(user_id, jti):
        raise DomainError(
            code="PASSWORD_RESET_USED",
            message="이미 사용된 비밀번호 재설정 링크입니다.",
            status_code=400,
        )

    user.set_password(new_password)
    user.save(update_fields=["password", "updated_at"])
    blacklist_all_refresh_tokens(user)
    reset_lockout(user)
    return user


# ───────────────────────── Email-channel notification helpers ─────────────────────────
def enqueue_user_email(user: User, *, event_kind: str, subject: str, text: str, html: str) -> None:
    """Drop an EMAIL row into the notification outbox for a User without
    requiring a Membership (some flows — verify/reset — happen pre-onboarding).

    Strategy: if the user has any active membership, dispatch via the standard
    notification.services.dispatch (so the row threads through the regular
    outbox + provider stub). Otherwise call the SES stub directly so the
    outbound email still fires when the real provider is wired up.
    """
    from apps.notification import services as notif_svc

    membership = user.memberships.filter(is_active=True).first()
    payload = {
        "subject": subject,
        "text": text,
        "html": html,
        "_to_email": user.email,
    }
    if membership is None:
        from apps.notification.providers import email as email_provider

        email_provider.send(payload=payload, membership=None)  # type: ignore[arg-type]
        return

    notif_svc.dispatch(
        membership,
        event_kind=event_kind,
        payload=payload,
        channels=("EMAIL",),
    )
