"""Identity HTTP views.

Auth, token mgmt, 2FA. Lockout-aware, audit-emitting.
"""
from __future__ import annotations

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import permissions, serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.audit.services import record as audit_record

from . import email_templates, services as identity_services
from .models import User
from .serializers import (
    SignupSerializer,
    UserMeSerializer,
    MeSettingsSerializer,
    issue_tokens,
)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def signup(request):
    ser = SignupSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    user = ser.save()
    return Response(
        {
            "data": {
                "user_id": str(user.id),
                "email_verification_required": not user.is_email_verified,
            }
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login(request):
    """Lockout-aware login. Emits audit on success/failure.

    If TOTP enabled, returns a short-lived ``two_fa_token`` instead of an access pair —
    client must call /v1/auth/2fa/challenge to exchange.
    """
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""

    user = User.objects.filter(email__iexact=email).first()

    # 1) lockout precheck
    if user is not None and identity_services.is_locked(user):
        audit_record(
            None, "auth.login.failed", request=request, payload={"reason": "locked"}
        )
        return Response(
            {"error": {"code": "ACCOUNT_LOCKED", "message": "계정이 잠겨 있습니다. 잠시 후 다시 시도하세요."}},
            status=status.HTTP_423_LOCKED,
        )

    # 2) authenticate
    auth_user = authenticate(request=request, email=email, password=password)
    if auth_user is None:
        if user is not None:
            identity_services.register_failed_login(user)
            if identity_services.is_locked(user):
                audit_record(
                    None,
                    "auth.login.failed",
                    request=request,
                    payload={"reason": "locked_after_threshold"},
                )
                return Response(
                    {"error": {"code": "ACCOUNT_LOCKED", "message": "잘못된 시도가 너무 많아 계정이 잠겼습니다."}},
                    status=status.HTTP_423_LOCKED,
                )
        audit_record(
            None, "auth.login.failed", request=request, payload={"reason": "invalid"}
        )
        return Response(
            {"error": {"code": "INVALID_CREDENTIALS", "message": "이메일 또는 비밀번호가 올바르지 않습니다."}},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not auth_user.is_active:
        audit_record(
            None, "auth.login.failed", request=request, payload={"reason": "inactive"}
        )
        return Response(
            {"error": {"code": "ACCOUNT_LOCKED", "message": "비활성화된 계정입니다."}},
            status=status.HTTP_423_LOCKED,
        )

    # 3) success
    identity_services.reset_lockout(auth_user)

    if auth_user.totp_enabled:
        token = identity_services.issue_2fa_challenge(auth_user)
        audit_record(auth_user, "auth.login.2fa_required", request=request)
        return Response({"data": {"two_fa_required": True, "two_fa_token": token}})

    tokens = issue_tokens(auth_user)
    audit_record(auth_user, "auth.login.success", request=request)
    return Response({"data": {**tokens, "user": UserMeSerializer(auth_user).data}})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def refresh(request):
    token = request.data.get("refresh_token")
    if not token:
        return Response(
            {"error": {"code": "VALIDATION_ERROR", "message": "refresh_token required"}},
            status=400,
        )
    try:
        rt = RefreshToken(token)
    except TokenError as exc:
        return Response(
            {"error": {"code": "TOKEN_EXPIRED", "message": str(exc)}}, status=401
        )
    return Response(
        {
            "data": {
                "access_token": str(rt.access_token),
                "access_expires_in": int(rt.access_token.lifetime.total_seconds()),
            }
        }
    )


@api_view(["POST"])
def logout(request):
    """Blacklist the supplied refresh token. Emits ``auth.logout``."""
    token = request.data.get("refresh_token")
    if not token:
        return Response(
            {"error": {"code": "VALIDATION_ERROR", "message": "refresh_token required"}},
            status=400,
        )
    try:
        rt = RefreshToken(token)
        rt.blacklist()
    except TokenError as exc:
        return Response(
            {"error": {"code": "TOKEN_EXPIRED", "message": str(exc)}}, status=401
        )
    audit_record(request.user, "auth.logout", request=request)
    return Response({"data": {"logged_out": True}})


@api_view(["GET"])
def me(request):
    return Response({"data": UserMeSerializer(request.user).data})


@api_view(["GET", "PATCH"])
def me_settings(request):
    """GET — returns the authenticated user's settings.
    PATCH — partial update (currently only `use_native_home`).
    See docs/superpowers/specs/2026-05-13-home-native-poc-design.md §6.
    """
    user = request.user
    if request.method == "GET":
        return Response({"data": {"use_native_home": user.use_native_home}})
    # PATCH
    s = MeSettingsSerializer(data=request.data, partial=True)
    s.is_valid(raise_exception=True)
    if "use_native_home" in s.validated_data:
        user.use_native_home = s.validated_data["use_native_home"]
        user.save(update_fields=["use_native_home", "updated_at"])
    return Response({"data": {"use_native_home": user.use_native_home}})


# ───────────────────────── Password change ─────────────────────────
class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)


@api_view(["POST"])
def password_change(request):
    """Validate old password, apply new (with django validators), blacklist all refresh."""
    s = PasswordChangeSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    user = request.user
    if not user.check_password(s.validated_data["old_password"]):
        return Response(
            {"error": {"code": "INVALID_CREDENTIALS", "message": "기존 비밀번호가 올바르지 않습니다."}},
            status=400,
        )
    new_pw = s.validated_data["new_password"]
    try:
        validate_password(new_pw, user=user)
    except DjangoValidationError as exc:
        return Response(
            {
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "비밀번호 정책을 만족하지 않습니다.",
                    "details": {"fields": list(exc.messages)},
                }
            },
            status=400,
        )
    user.set_password(new_pw)
    user.save(update_fields=["password", "updated_at"])
    identity_services.blacklist_all_refresh_tokens(user)
    audit_record(user, "auth.password_changed", request=request)
    return Response({"data": {"changed": True}})


# ───────────────────────── 2FA ─────────────────────────
@api_view(["POST"])
def two_fa_enable(request):
    secret, uri = identity_services.provision_totp(request.user)
    return Response({"data": {"secret": secret, "otpauth_uri": uri}})


class TwoFaCodeSerializer(serializers.Serializer):
    code = serializers.CharField()


@api_view(["POST"])
def two_fa_verify(request):
    s = TwoFaCodeSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    codes = identity_services.enable_totp_after_verify(
        request.user, s.validated_data["code"]
    )
    if not codes:
        return Response(
            {"error": {"code": "INVALID_CREDENTIALS", "message": "잘못된 인증 코드입니다."}},
            status=400,
        )
    audit_record(request.user, "auth.2fa.enabled", request=request)
    return Response({"data": {"enabled": True, "recovery_codes": codes}})


@api_view(["POST"])
def two_fa_disable(request):
    s = TwoFaCodeSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    if not identity_services.verify_totp(request.user, s.validated_data["code"]):
        return Response(
            {"error": {"code": "INVALID_CREDENTIALS", "message": "잘못된 인증 코드입니다."}},
            status=400,
        )
    identity_services.disable_totp(request.user)
    identity_services.blacklist_all_refresh_tokens(request.user)
    audit_record(request.user, "auth.2fa.disabled", request=request)
    return Response({"data": {"enabled": False}})


class TwoFaChallengeSerializer(serializers.Serializer):
    two_fa_token = serializers.CharField()
    code = serializers.CharField()


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def two_fa_challenge(request):
    s = TwoFaChallengeSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    user = identity_services.consume_2fa_challenge(s.validated_data["two_fa_token"])
    if user is None:
        return Response(
            {"error": {"code": "TOKEN_EXPIRED", "message": "2FA 토큰이 만료되었습니다."}},
            status=401,
        )
    code = s.validated_data["code"]
    if not (
        identity_services.verify_totp(user, code)
        or identity_services.consume_recovery_code(user, code)
    ):
        audit_record(user, "auth.2fa.failed", request=request)
        return Response(
            {"error": {"code": "INVALID_CREDENTIALS", "message": "잘못된 인증 코드입니다."}},
            status=400,
        )
    tokens = issue_tokens(user)
    audit_record(user, "auth.login.success", request=request, payload={"two_fa": True})
    return Response({"data": {**tokens, "user": UserMeSerializer(user).data}})


# ───────────────────────── Email verification ─────────────────────────
class _TokenSerializer(serializers.Serializer):
    token = serializers.CharField()


class _EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()


class _PasswordResetSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def email_verify(request):
    """Validate an email-verification token and flip ``is_email_verified``.

    Errors map to the standard envelope:
      - 400 EMAIL_VERIFY_INVALID: bad/expired signature or unknown user
      - 409 EMAIL_ALREADY_VERIFIED: idempotent re-use after success
    """
    s = _TokenSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    user = identity_services.verify_email_token(s.validated_data["token"])
    audit_record(user, "auth.email.verified", request=request)
    return Response({"data": {"verified": True}})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def email_resend(request):
    """Re-issue an email-verification link; ALWAYS returns 200 (no enumeration).

    If the email matches an unverified user we enqueue an EMAIL row in the
    notification outbox. Verified or unknown emails silently no-op.
    """
    s = _EmailSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    email = s.validated_data["email"].strip().lower()
    user = User.objects.filter(email__iexact=email).first()
    if user is not None and not user.is_email_verified:
        _, signed = identity_services.issue_email_verification_token(user)
        rendered = email_templates.render_verify_email(
            name=user.name, token=signed, locale=user.locale or "ko"
        )
        identity_services.enqueue_user_email(
            user,
            event_kind="auth.email.verify",
            subject=rendered["subject"],
            text=rendered["text"],
            html=rendered["html"],
        )
        audit_record(user, "auth.email.verify.requested", request=request)
    return Response({"data": {"sent": True}})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def password_forgot(request):
    """Trigger a password-reset email; ALWAYS returns 200 (no enumeration)."""
    s = _EmailSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    email = s.validated_data["email"].strip().lower()
    user = User.objects.filter(email__iexact=email).first()
    if user is not None and user.is_active:
        _, signed = identity_services.issue_password_reset_token(user)
        rendered = email_templates.render_password_reset(
            name=user.name, token=signed, locale=user.locale or "ko"
        )
        identity_services.enqueue_user_email(
            user,
            event_kind="auth.password.reset_requested",
            subject=rendered["subject"],
            text=rendered["text"],
            html=rendered["html"],
        )
        audit_record(user, "auth.password.reset_requested", request=request)
    return Response({"data": {"sent": True}})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def password_reset(request):
    """Consume a reset token + apply the new password.

    On success: blacklists every refresh token, clears the lockout counter,
    and emits ``auth.password.reset_completed``.
    """
    s = _PasswordResetSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    user = identity_services.consume_password_reset_token(
        s.validated_data["token"], s.validated_data["new_password"]
    )
    audit_record(user, "auth.password.reset_completed", request=request)
    return Response({"data": {"reset": True}})
