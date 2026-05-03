from __future__ import annotations

from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    LoginSerializer,
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
    ser = LoginSerializer(data=request.data, context={"request": request})
    ser.is_valid(raise_exception=True)
    user = ser.validated_data["user"]
    tokens = issue_tokens(user)
    return Response(
        {
            "data": {
                **tokens,
                "user": UserMeSerializer(user).data,
            }
        }
    )


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


@api_view(["GET"])
def me(request):
    return Response({"data": UserMeSerializer(request.user).data})
