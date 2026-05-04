"""OAuth orchestration — start + complete the PKCE round-trip.

``start(provider, redirect_uri)`` returns the authorization URL plus the
``state`` value (which the callback must echo back). The PKCE
``code_verifier`` is persisted server-side in :class:`OAuthState` so the
callback can compute the token exchange with the matching
``code_challenge``.

``complete(provider, code, state)`` validates the state, exchanges the code
for a userinfo profile (delegated to the provider implementation), then
either looks up an existing :class:`OAuthIdentity`, links to an existing
verified User by email, or creates a new (already email-verified) User.
"""
from __future__ import annotations

import base64
import hashlib
import secrets
from datetime import timedelta
from typing import Any

from django.conf import settings
from django.db import transaction
from django.utils import timezone as django_tz

from apps.identity.models import User
from core.errors import DomainError

from . import providers as oauth_providers
from .models import OAuthIdentity, OAuthState

STATE_TTL_SECONDS = 10 * 60  # 10 min


def _provider_configured(provider_name: str) -> bool:
    if provider_name == "google":
        return bool(getattr(settings, "OAUTH_GOOGLE_CLIENT_ID", ""))
    if provider_name == "kakao":
        return bool(getattr(settings, "OAUTH_KAKAO_CLIENT_ID", ""))
    return False


def _b64url_no_pad(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _generate_pkce() -> tuple[str, str]:
    """Return ``(code_verifier, code_challenge)`` per RFC 7636 (S256)."""
    verifier = _b64url_no_pad(secrets.token_bytes(32))
    challenge = _b64url_no_pad(hashlib.sha256(verifier.encode("ascii")).digest())
    return verifier, challenge


def start(*, provider: str, redirect_uri: str) -> dict[str, str]:
    """Begin the OAuth dance — persist state + return the authorization URL.

    Raises ``DomainError(OAUTH_NOT_CONFIGURED, 503)`` when the provider's
    client_id setting is blank, and ``DomainError(OAUTH_UNKNOWN_PROVIDER, 400)``
    for an unrecognised provider name.
    """
    provider = provider.lower()
    impl = oauth_providers.get(provider)
    if impl is None:
        raise DomainError(
            code="OAUTH_UNKNOWN_PROVIDER",
            message="지원하지 않는 OAuth 공급자입니다.",
            status_code=400,
        )
    if not _provider_configured(provider):
        raise DomainError(
            code="OAUTH_NOT_CONFIGURED",
            message="OAuth 공급자 설정이 비어 있습니다.",
            status_code=503,
        )
    state = _b64url_no_pad(secrets.token_bytes(24))
    verifier, challenge = _generate_pkce()
    OAuthState.objects.create(
        provider=provider,
        state=state,
        code_verifier=verifier,
        redirect_uri=redirect_uri,
    )
    url = impl.start_url(
        state=state, code_challenge=challenge, redirect_uri=redirect_uri
    )
    return {"url": url, "state": state}


def _consume_state(provider: str, state: str) -> OAuthState:
    cutoff = django_tz.now() - timedelta(seconds=STATE_TTL_SECONDS)
    row = (
        OAuthState.objects.filter(
            provider=provider, state=state, used_at__isnull=True, created_at__gt=cutoff
        )
        .order_by("-created_at")
        .first()
    )
    if row is None:
        raise DomainError(
            code="OAUTH_STATE_INVALID",
            message="OAuth 인증 상태가 유효하지 않거나 만료되었습니다.",
            status_code=400,
        )
    row.used_at = django_tz.now()
    row.save(update_fields=["used_at"])
    return row


@transaction.atomic
def complete(
    *,
    provider: str,
    code: str,
    state: str,
    _test_responses: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Finish the OAuth dance: validate state → exchange code → resolve user.

    Returns ``{"user": User, "created": bool, "two_fa_required": bool}``.
    The view layer is responsible for issuing JWTs and (when 2FA is enabled)
    swapping in a short-lived two_fa_token.
    """
    provider = provider.lower()
    impl = oauth_providers.get(provider)
    if impl is None:
        raise DomainError(
            code="OAUTH_UNKNOWN_PROVIDER",
            message="지원하지 않는 OAuth 공급자입니다.",
            status_code=400,
        )

    state_row = _consume_state(provider, state)
    profile = impl.exchange(
        code=code,
        code_verifier=state_row.code_verifier,
        redirect_uri=state_row.redirect_uri,
        _test_responses=_test_responses,
    )
    if not profile.provider_subject:
        raise DomainError(
            code="OAUTH_PROFILE_INVALID",
            message="OAuth 사용자 정보를 가져오지 못했습니다.",
            status_code=400,
        )

    # 1) Already linked? — fast path.
    identity = OAuthIdentity.objects.filter(
        provider=provider, provider_subject=profile.provider_subject
    ).first()
    if identity is not None:
        return {
            "user": identity.user,
            "created": False,
            "two_fa_required": bool(identity.user.totp_enabled),
        }

    # 2) Match by email — only link when the provider says the email is
    # verified, OR the existing local user already verified it themselves.
    created = False
    user: User | None = None
    if profile.email:
        existing = User.objects.filter(email__iexact=profile.email).first()
        if existing is not None:
            if profile.email_verified or existing.is_email_verified:
                user = existing
            else:
                raise DomainError(
                    code="OAUTH_EMAIL_NOT_VERIFIED",
                    message="OAuth 공급자에서 이메일이 확인되지 않았습니다.",
                    status_code=400,
                )

    # 3) Brand-new user — create with unusable password (OAuth-only login).
    if user is None:
        if not profile.email:
            raise DomainError(
                code="OAUTH_EMAIL_REQUIRED",
                message="OAuth 공급자가 이메일을 제공하지 않았습니다.",
                status_code=400,
            )
        user = User.objects.create(
            email=profile.email,
            name=profile.name or profile.email.split("@")[0],
            is_email_verified=bool(profile.email_verified),
        )
        user.set_unusable_password()
        user.save(update_fields=["password"])
        created = True

    OAuthIdentity.objects.create(
        user=user,
        provider=provider,
        provider_subject=profile.provider_subject,
        email=profile.email,
    )
    return {
        "user": user,
        "created": created,
        "two_fa_required": bool(user.totp_enabled),
    }
