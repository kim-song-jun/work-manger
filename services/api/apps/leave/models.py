from __future__ import annotations

import uuid

from django.db import models
from django.utils import timezone as django_tz


class LeavePolicy(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey("identity.Company", on_delete=models.CASCADE, related_name="leave_policies")
    effective_from = models.DateField()
    rules_json = models.JSONField(default=dict)
    expiry_months = models.IntegerField(default=12)
    notify_days_before = models.JSONField(default=list)
    created_by = models.ForeignKey(
        "identity.Membership", on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(default=django_tz.now, editable=False)

    class Meta:
        db_table = "leave_policy"


class LeaveBalance(models.Model):
    class Kind(models.TextChoices):
        GRANTED = "GRANTED", "Granted"
        USED = "USED", "Used"
        EXPIRED = "EXPIRED", "Expired"
        ADJUSTED = "ADJUSTED", "Adjusted"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey("identity.Company", on_delete=models.CASCADE)
    membership = models.ForeignKey(
        "identity.Membership", on_delete=models.CASCADE, related_name="leave_balances"
    )
    kind = models.CharField(max_length=16, choices=Kind.choices)
    days = models.DecimalField(max_digits=5, decimal_places=2)
    granted_at = models.DateField()
    expires_at = models.DateField(null=True, blank=True)
    related_request_id = models.UUIDField(null=True, blank=True)
    note = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(default=django_tz.now, editable=False)

    class Meta:
        db_table = "leave_balance"
        indexes = [
            models.Index(fields=["membership", "kind"], name="idx_balance_member_kind"),
        ]


class LeaveRequest(models.Model):
    class Kind(models.TextChoices):
        FULL = "FULL", "Full day"
        AM_HALF = "AM_HALF", "AM half"
        PM_HALF = "PM_HALF", "PM half"

    class LeaveType(models.TextChoices):
        """Logical category of leave (iter13 T3).

        ``ANNUAL`` is the legal default (근로기준법 §60). ``COMP`` (보상휴가)
        is granted 1:1 for approved overtime — operationally still
        deducts from the remaining-days balance like ANNUAL until a
        dedicated comp-time bucket lands. ``SICK`` and ``PERSONAL``
        are reserved for upcoming policy work.
        """

        ANNUAL = "ANNUAL", "Annual leave"
        COMP = "COMP", "Compensation leave"
        SICK = "SICK", "Sick leave"
        PERSONAL = "PERSONAL", "Personal leave"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        CANCELLED = "CANCELLED", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey("identity.Company", on_delete=models.CASCADE)
    membership = models.ForeignKey(
        "identity.Membership", on_delete=models.CASCADE, related_name="leave_requests"
    )
    start_date = models.DateField()
    end_date = models.DateField()
    kind = models.CharField(max_length=16, choices=Kind.choices, default=Kind.FULL)
    leave_type = models.CharField(
        max_length=16,
        choices=LeaveType.choices,
        default=LeaveType.ANNUAL,
    )
    days = models.DecimalField(max_digits=5, decimal_places=2)
    reason = models.TextField(blank=True, default="")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    decided_by = models.ForeignKey(
        "identity.Membership",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="decided_leaves",
    )
    decided_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=django_tz.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "leave_request"
        indexes = [
            models.Index(fields=["membership", "status"], name="idx_leave_req_member_status"),
            models.Index(fields=["company", "start_date", "end_date"], name="idx_leave_req_range"),
        ]


class LeavePromotionLog(models.Model):
    """근로기준법 §61 사용 촉진 안내 발송 기록 (spec §5.2).

    The ``promote_unused_leave`` Celery task writes one row per (membership,
    fiscal_end_date, kind). The UNIQUE constraint guarantees idempotency
    when the task re-runs the same day — or any subsequent day before the
    next reminder window.
    """

    class Kind(models.TextChoices):
        FIRST = "FIRST", "First (6개월 전)"
        SECOND = "SECOND", "Second (2개월 전)"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        "identity.Company", on_delete=models.CASCADE, related_name="leave_promotions"
    )
    membership = models.ForeignKey(
        "identity.Membership",
        on_delete=models.CASCADE,
        related_name="leave_promotions",
    )
    fiscal_end_date = models.DateField()
    kind = models.CharField(max_length=8, choices=Kind.choices)
    days_remaining = models.DecimalField(max_digits=5, decimal_places=2)
    issued_at = models.DateTimeField(default=django_tz.now, editable=False)

    class Meta:
        db_table = "leave_promotion_log"
        constraints = [
            models.UniqueConstraint(
                fields=["membership", "fiscal_end_date", "kind"],
                name="uniq_leave_promo_member_fiscal_kind",
            ),
        ]
        indexes = [
            models.Index(
                fields=["company", "fiscal_end_date"],
                name="idx_leave_promo_company_fiscal",
            ),
        ]
