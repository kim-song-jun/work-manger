from __future__ import annotations

import uuid

from django.db import models
from django.utils import timezone as django_tz


class ApprovalTask(models.Model):
    class TargetType(models.TextChoices):
        OVERTIME = "OVERTIME", "Overtime"
        LEAVE = "LEAVE", "Leave"
        MANUAL_CLOCK_IN = "MANUAL_CLOCK_IN", "Manual clock-in"
        TRIP = "TRIP", "Business trip"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey("identity.Company", on_delete=models.CASCADE)
    target_type = models.CharField(max_length=24, choices=TargetType.choices)
    target_id = models.UUIDField()
    requester = models.ForeignKey(
        "identity.Membership", on_delete=models.CASCADE, related_name="approval_requests"
    )
    approver = models.ForeignKey(
        "identity.Membership", on_delete=models.CASCADE, related_name="approval_inbox"
    )
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(default=django_tz.now, editable=False)
    decided_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "approval_task"
        indexes = [
            models.Index(fields=["approver", "status"], name="idx_appr_approver_status"),
            models.Index(fields=["company", "status"], name="idx_appr_company_status"),
        ]
