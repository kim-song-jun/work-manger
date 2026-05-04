"""Add ManualClockInRequest (spec §3.4 — manual clock-in flow).

Persists the payload submitted via POST /v1/attendance/manual-request so
the approval domain can replay it on APPROVE and materialize an
AttendanceRecord via apps.attendance.services.materialize_manual_clock_in.
"""
from __future__ import annotations

import django.db.models.deletion
import django.utils.timezone
import uuid

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("attendance", "0003_seed_beat_schedule"),
        ("identity", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="ManualClockInRequest",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("work_date", models.DateField()),
                (
                    "kind",
                    models.CharField(
                        choices=[
                            ("OFFICE", "Office"),
                            ("WFH", "WFH"),
                            ("MANUAL", "Manual"),
                        ],
                        default="MANUAL",
                        max_length=8,
                    ),
                ),
                ("reason", models.TextField(blank=True, default="")),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("PENDING", "Pending"),
                            ("APPROVED", "Approved"),
                            ("REJECTED", "Rejected"),
                        ],
                        default="PENDING",
                        max_length=16,
                    ),
                ),
                (
                    "decided_at",
                    models.DateTimeField(blank=True, null=True),
                ),
                (
                    "created_at",
                    models.DateTimeField(
                        default=django.utils.timezone.now, editable=False
                    ),
                ),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "company",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="identity.company",
                    ),
                ),
                (
                    "decided_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="decided_manual_clock_in_requests",
                        to="identity.membership",
                    ),
                ),
                (
                    "membership",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="manual_clock_in_requests",
                        to="identity.membership",
                    ),
                ),
            ],
            options={
                "db_table": "manual_clock_in_request",
                "indexes": [
                    models.Index(
                        fields=["company", "status"],
                        name="idx_mcir_company_status",
                    ),
                    models.Index(
                        fields=["membership", "work_date"],
                        name="idx_mcir_member_date",
                    ),
                ],
            },
        ),
    ]
