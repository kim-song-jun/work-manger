"""Leave domain serializers — match docs/api/api-spec.md §5."""
from __future__ import annotations

from rest_framework import serializers

from .models import LeaveBalance, LeavePolicy, LeaveRequest


class ExpiringSoonSerializer(serializers.Serializer):
    days = serializers.DecimalField(max_digits=5, decimal_places=2)
    expires_at = serializers.DateField()


class BalanceSerializer(serializers.Serializer):
    granted_total = serializers.DecimalField(max_digits=6, decimal_places=2)
    used = serializers.DecimalField(max_digits=6, decimal_places=2)
    remaining = serializers.DecimalField(max_digits=6, decimal_places=2)
    expiring_soon = ExpiringSoonSerializer(many=True)


class LeavePolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = LeavePolicy
        fields = (
            "id",
            "effective_from",
            "rules_json",
            "expiry_months",
            "notify_days_before",
        )


class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = (
            "id",
            "start_date",
            "end_date",
            "kind",
            "leave_type",
            "days",
            "reason",
            "status",
            "decided_by",
            "decided_at",
            "created_at",
        )
        read_only_fields = (
            "id",
            "days",
            "status",
            "decided_by",
            "decided_at",
            "created_at",
        )


class LeaveRequestCreateSerializer(serializers.Serializer):
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    kind = serializers.ChoiceField(choices=LeaveRequest.Kind.choices, default=LeaveRequest.Kind.FULL)
    leave_type = serializers.ChoiceField(
        choices=LeaveRequest.LeaveType.choices,
        default=LeaveRequest.LeaveType.ANNUAL,
    )
    reason = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, attrs):
        if attrs["end_date"] < attrs["start_date"]:
            raise serializers.ValidationError(
                {"code": "INVALID_RANGE", "message": "end_date must be >= start_date"}
            )
        return attrs


class TeamCalendarEntrySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="membership.user.name", read_only=True)
    membership_id = serializers.UUIDField(source="membership.id", read_only=True)

    class Meta:
        model = LeaveRequest
        fields = (
            "id",
            "membership_id",
            "user_name",
            "start_date",
            "end_date",
            "kind",
            "days",
        )


class BalanceTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveBalance
        fields = (
            "id",
            "kind",
            "days",
            "granted_at",
            "expires_at",
            "note",
            "created_at",
        )
