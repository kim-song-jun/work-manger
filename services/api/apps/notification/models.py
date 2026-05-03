from __future__ import annotations

import uuid

from django.db import models
from django.utils import timezone as django_tz


class NotificationPreference(models.Model):
    class Channel(models.TextChoices):
        PUSH = "PUSH", "Push"
        EMAIL = "EMAIL", "Email"
        INAPP = "INAPP", "In-app"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    membership = models.ForeignKey(
        "identity.Membership", on_delete=models.CASCADE, related_name="notification_prefs"
    )
    channel = models.CharField(max_length=16, choices=Channel.choices)
    event_kind = models.CharField(max_length=64)
    enabled = models.BooleanField(default=True)

    class Meta:
        db_table = "notification_preference"
        constraints = [
            models.UniqueConstraint(
                fields=["membership", "channel", "event_kind"], name="uniq_notif_pref"
            )
        ]


class NotificationLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    membership = models.ForeignKey(
        "identity.Membership", on_delete=models.CASCADE, related_name="notification_logs"
    )
    event_kind = models.CharField(max_length=64)
    channel = models.CharField(max_length=16)
    payload_json = models.JSONField(default=dict)
    delivered_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=django_tz.now, editable=False)

    class Meta:
        db_table = "notification_log"
        indexes = [
            models.Index(fields=["membership", "read_at"], name="idx_notif_member_unread"),
        ]


class DeviceToken(models.Model):
    class Platform(models.TextChoices):
        IOS = "IOS", "iOS"
        ANDROID = "ANDROID", "Android"
        WEB = "WEB", "Web"
        DESKTOP = "DESKTOP", "Desktop"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    membership = models.ForeignKey(
        "identity.Membership", on_delete=models.CASCADE, related_name="device_tokens"
    )
    platform = models.CharField(max_length=16, choices=Platform.choices)
    token = models.CharField(max_length=512)
    last_seen_at = models.DateTimeField(default=django_tz.now)
    created_at = models.DateTimeField(default=django_tz.now, editable=False)

    class Meta:
        db_table = "device_token"
        constraints = [
            models.UniqueConstraint(fields=["platform", "token"], name="uniq_platform_token")
        ]


class NotificationOutbox(models.Model):
    r"""Reliable outbox row driving provider dispatch (PUSH/EMAIL/INAPP).

    Status machine::

        PENDING -> SENDING -> SENT          (happy path)
                          \-> FAILED        (transient; reschedule via next_attempt_at)
                          \-> DEAD          (terminal after max_attempts)
    """

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SENDING = "SENDING", "Sending"
        SENT = "SENT", "Sent"
        FAILED = "FAILED", "Failed"
        DEAD = "DEAD", "Dead"

    class Channel(models.TextChoices):
        PUSH = "PUSH", "Push"
        EMAIL = "EMAIL", "Email"
        INAPP = "INAPP", "In-app"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    membership = models.ForeignKey(
        "identity.Membership", on_delete=models.CASCADE, related_name="notification_outbox"
    )
    channel = models.CharField(max_length=16, choices=Channel.choices)
    event_kind = models.CharField(max_length=64)
    payload_json = models.JSONField(default=dict)

    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    attempts = models.IntegerField(default=0)
    max_attempts = models.IntegerField(default=5)
    next_attempt_at = models.DateTimeField(default=django_tz.now)
    last_error = models.TextField(blank=True, default="")
    provider_message_id = models.CharField(max_length=128, blank=True, default="")

    created_at = models.DateTimeField(default=django_tz.now, editable=False)
    updated_at = models.DateTimeField(default=django_tz.now)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "notification_outbox"
        indexes = [
            models.Index(
                fields=["status", "next_attempt_at"], name="idx_outbox_status_next"
            ),
        ]
