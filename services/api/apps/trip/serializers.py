"""Serializers for the Trip API."""
from __future__ import annotations

from rest_framework import serializers

from .models import BusinessTrip


class TripCreateSerializer(serializers.Serializer):
    kind = serializers.ChoiceField(choices=BusinessTrip.Kind.choices)
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    location_label = serializers.CharField(max_length=200)
    purpose = serializers.CharField(
        required=False, allow_blank=True, default="", max_length=4000
    )


class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessTrip
        fields = (
            "id",
            "kind",
            "start_date",
            "end_date",
            "location_label",
            "purpose",
            "status",
            "decided_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields
