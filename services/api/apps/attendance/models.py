from __future__ import annotations

import uuid

from django.db import models
from django.utils import timezone as django_tz


class WorkSchedule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    membership = models.OneToOneField(
        "identity.Membership", on_delete=models.CASCADE, related_name="schedule"
    )
    start_time = models.TimeField(default="09:00")
    end_time = models.TimeField(default="18:00")
    break_minutes = models.IntegerField(default=60)
    work_days = models.JSONField(default=list)  # ints 1..7
    created_at = models.DateTimeField(default=django_tz.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "work_schedule"


class AttendanceRecord(models.Model):
    class Status(models.TextChoices):
        WORKING = "WORKING", "Working"
        ON_BREAK = "ON_BREAK", "On break"
        COMPLETED = "COMPLETED", "Completed"

    class Kind(models.TextChoices):
        OFFICE = "OFFICE", "Office"
        WFH = "WFH", "WFH"
        MANUAL = "MANUAL", "Manual"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey("identity.Company", on_delete=models.CASCADE)
    membership = models.ForeignKey(
        "identity.Membership", on_delete=models.CASCADE, related_name="attendance_records"
    )
    work_date = models.DateField()
    clock_in_at = models.DateTimeField(null=True, blank=True)
    clock_out_at = models.DateTimeField(null=True, blank=True)
    clock_in_location = models.ForeignKey(
        "identity.Location", on_delete=models.SET_NULL, null=True, blank=True
    )
    clock_in_kind = models.CharField(max_length=8, choices=Kind.choices, blank=True, default="")
    is_late = models.BooleanField(default=False)
    is_early_leave = models.BooleanField(default=False)
    total_break_minutes = models.IntegerField(default=0)
    total_work_minutes = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.WORKING)
    created_at = models.DateTimeField(default=django_tz.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "attendance_record"
        constraints = [
            models.UniqueConstraint(
                fields=["membership", "work_date"], name="uniq_member_workdate"
            ),
        ]
        indexes = [
            models.Index(fields=["company", "work_date"], name="idx_att_company_date"),
            models.Index(fields=["company", "status"], name="idx_att_status"),
        ]


class BreakRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attendance_record = models.ForeignKey(
        AttendanceRecord, on_delete=models.CASCADE, related_name="breaks"
    )
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "break_record"


class OvertimeRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        CANCELLED = "CANCELLED", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey("identity.Company", on_delete=models.CASCADE)
    membership = models.ForeignKey(
        "identity.Membership", on_delete=models.CASCADE, related_name="overtime_requests"
    )
    work_date = models.DateField()
    requested_minutes = models.IntegerField()
    reason = models.TextField(blank=True, default="")
    auto_generated = models.BooleanField(default=False)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    decided_by = models.ForeignKey(
        "identity.Membership",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="decided_overtimes",
    )
    decided_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=django_tz.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "overtime_request"
        indexes = [
            models.Index(fields=["company", "status"], name="idx_ot_company_status"),
            models.Index(fields=["membership", "work_date"], name="idx_ot_member_date"),
        ]
