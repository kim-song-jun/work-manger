from __future__ import annotations

from rest_framework import serializers

from apps.identity.models import Location

from .models import AttendanceRecord, BreakRecord, OvertimeRequest


# ---------- Read serializers ----------

class LocationMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ("id", "label", "kind")


class BreakRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = BreakRecord
        fields = ("id", "started_at", "ended_at")


class AttendanceRecordSerializer(serializers.ModelSerializer):
    matched_location = LocationMiniSerializer(source="clock_in_location", read_only=True)
    breaks = BreakRecordSerializer(many=True, read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = (
            "id",
            "work_date",
            "clock_in_at",
            "clock_out_at",
            "clock_in_kind",
            "matched_location",
            "is_late",
            "is_early_leave",
            "total_break_minutes",
            "total_work_minutes",
            "status",
            "breaks",
            "created_at",
            "updated_at",
        )


class OvertimeRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = OvertimeRequest
        fields = (
            "id",
            "work_date",
            "requested_minutes",
            "reason",
            "auto_generated",
            "status",
            "decided_at",
            "created_at",
            "updated_at",
        )


# ---------- Request payload serializers ----------

class GeoPointSerializer(serializers.Serializer):
    latitude = serializers.FloatField(min_value=-90, max_value=90)
    longitude = serializers.FloatField(min_value=-180, max_value=180)
    accuracy_m = serializers.FloatField(required=False, min_value=0)


class ClockInRequestSerializer(serializers.Serializer):
    location = GeoPointSerializer(required=False)
    kind = serializers.ChoiceField(choices=AttendanceRecord.Kind.choices)
    client_time = serializers.DateTimeField(required=False)


class ManualRequestSerializer(serializers.Serializer):
    work_date = serializers.DateField(required=False)
    reason = serializers.CharField(max_length=500)
    client_time = serializers.DateTimeField(required=False)


class OvertimeCreateSerializer(serializers.Serializer):
    work_date = serializers.DateField(required=False)
    requested_minutes = serializers.IntegerField(min_value=1, max_value=24 * 60)
    reason = serializers.CharField(max_length=500, required=False, allow_blank=True)
