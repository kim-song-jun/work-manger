"""BusinessTrip — covers `m-trip` (출장/외근) per docs/specs/screen-catalog.md §6."""
from __future__ import annotations

import uuid

from django.db import models
from django.db.models import CheckConstraint, F, Q
from django.utils import timezone as django_tz


class BusinessTrip(models.Model):
    class Kind(models.TextChoices):
        BUSINESS_TRIP = "BUSINESS_TRIP", "Business trip"
        FIELD_WORK = "FIELD_WORK", "Field work"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        CANCELLED = "CANCELLED", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey("identity.Company", on_delete=models.CASCADE)
    membership = models.ForeignKey(
        "identity.Membership",
        on_delete=models.CASCADE,
        related_name="business_trips",
    )
    kind = models.CharField(
        max_length=16, choices=Kind.choices, default=Kind.BUSINESS_TRIP
    )
    start_date = models.DateField()
    end_date = models.DateField()
    location_label = models.CharField(max_length=200)
    purpose = models.TextField(blank=True, default="")
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.PENDING
    )
    decided_by = models.ForeignKey(
        "identity.Membership",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="decided_trips",
    )
    decided_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=django_tz.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "business_trip"
        indexes = [
            models.Index(
                fields=["membership", "status"], name="idx_trip_member_status"
            ),
            models.Index(
                fields=["company", "start_date", "end_date"], name="idx_trip_range"
            ),
        ]
        constraints = [
            CheckConstraint(
                check=Q(end_date__gte=F("start_date")),
                name="ck_trip_end_after_start",
            ),
        ]
