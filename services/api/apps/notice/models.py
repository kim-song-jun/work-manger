"""Notice — covers `m-notice` (공지사항) per docs/specs/screen-catalog.md §6."""
from __future__ import annotations

import uuid

from django.db import models
from django.utils import timezone as django_tz


class Notice(models.Model):
    class Category(models.TextChoices):
        POLICY = "policy", "Policy"
        EVENT = "event", "Event"
        IT = "it", "IT"
        HR = "hr", "HR"
        GENERAL = "general", "General"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        "identity.Company", on_delete=models.CASCADE, related_name="notices"
    )
    author = models.ForeignKey(
        "identity.Membership",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="authored_notices",
    )
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True, default="")
    pinned = models.BooleanField(default=False)
    priority = models.IntegerField(default=0)
    category = models.CharField(
        max_length=24, choices=Category.choices, default=Category.GENERAL
    )
    published_at = models.DateTimeField(default=django_tz.now)
    archived_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=django_tz.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "notice"
        indexes = [
            models.Index(
                fields=["company", "pinned", "-published_at"],
                name="idx_notice_company_feed",
            ),
            models.Index(
                fields=["company", "category"], name="idx_notice_company_cat"
            ),
        ]
