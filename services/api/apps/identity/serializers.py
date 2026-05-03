from __future__ import annotations

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Company, Membership

User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ("email", "password", "name", "locale")

    def create(self, validated):
        password = validated.pop("password")
        user = User(**validated)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        from django.contrib.auth import authenticate

        user = authenticate(
            request=self.context.get("request"),
            email=attrs["email"],
            password=attrs["password"],
        )
        if user is None:
            raise serializers.ValidationError(
                {"code": "INVALID_CREDENTIALS", "message": "이메일 또는 비밀번호가 올바르지 않습니다."}
            )
        if not user.is_active:
            raise serializers.ValidationError(
                {"code": "ACCOUNT_LOCKED", "message": "비활성화된 계정입니다."}
            )
        attrs["user"] = user
        return attrs


def issue_tokens(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        "access_token": str(refresh.access_token),
        "refresh_token": str(refresh),
        "access_expires_in": int(refresh.access_token.lifetime.total_seconds()),
        "refresh_expires_in": int(refresh.lifetime.total_seconds()),
    }


class CompanyMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ("id", "name", "code", "timezone", "default_locale")


class MembershipMiniSerializer(serializers.ModelSerializer):
    company = CompanyMiniSerializer(read_only=True)

    class Meta:
        model = Membership
        fields = ("id", "company", "role", "position", "employee_no")


class UserMeSerializer(serializers.ModelSerializer):
    memberships = MembershipMiniSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ("id", "email", "name", "locale", "is_email_verified", "memberships")
