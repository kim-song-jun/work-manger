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

from . import services as identity_services
from .models import User
from .serializers import (
    SignupSerializer,
    UserMeSerializer,
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
