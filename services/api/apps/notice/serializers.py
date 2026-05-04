"""Serializers for the Notice API."""
from __future__ import annotations

from rest_framework import serializers

from .models import Notice


class NoticeSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(
        source="author.user.name", read_only=True, default=""
    )

    class Meta:
        model = Notice
        fields = (
            "id",
            "title",
            "body",
            "pinned",
            "priority",
            "category",
            "published_at",
            "archived_at",
            "author_name",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class NoticeWriteSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    body = serializers.CharField(required=False, allow_blank=True, default="")
    pinned = serializers.BooleanField(required=False, default=False)
    priority = serializers.IntegerField(required=False, default=0)
    category = serializers.ChoiceField(
        choices=Notice.Category.choices,
        required=False,
        default=Notice.Category.GENERAL,
    )
    published_at = serializers.DateTimeField(required=False)


class NoticePatchSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200, required=False)
    body = serializers.CharField(required=False, allow_blank=True)
    pinned = serializers.BooleanField(required=False)
    priority = serializers.IntegerField(required=False)
    category = serializers.ChoiceField(
        choices=Notice.Category.choices, required=False
    )
    published_at = serializers.DateTimeField(required=False)
