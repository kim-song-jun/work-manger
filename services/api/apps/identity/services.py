"""Identity domain services — auth lockout, 2FA, recovery codes.

Per docs/api/authentication.md §2 (lockout) and §8 (2FA).
"""
from __future__ import annotations

import secrets
from datetime import timedelta
from typing import Iterable

import pyotp
from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone as django_tz

from .models import RecoveryCode, User


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
