"""Add LeavePromotionLog (spec §5.2 — 근로기준법 §61 사용 촉진 안내).

Each row is one formal reminder ("사용 촉진") issued for a (membership,
fiscal_end_date, kind) triple. UNIQUE constraint enforces idempotency
across re-runs of the ``leave.promote_unused_leave`` Celery task.
"""
from __future__ import annotations

import django.db.models.deletion
import django.utils.timezone
import uuid

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("leave", "0002_seed_beat_schedule"),
        ("identity", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="LeavePromotionLog",
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
                ("fiscal_end_date", models.DateField()),
                (
                    "kind",
                    models.CharField(
                        choices=[
                            ("FIRST", "First (6개월 전)"),
                            ("SECOND", "Second (2개월 전)"),
                        ],
                        max_length=8,
                    ),
                ),
                (
                    "days_remaining",
                    models.DecimalField(decimal_places=2, max_digits=5),
                ),
                (
                    "issued_at",
                    models.DateTimeField(
                        default=django.utils.timezone.now, editable=False
                    ),
                ),
                (
                    "company",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="leave_promotions",
                        to="identity.company",
                    ),
                ),
                (
                    "membership",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="leave_promotions",
                        to="identity.membership",
                    ),
                ),
            ],
            options={
                "db_table": "leave_promotion_log",
                "indexes": [
                    models.Index(
                        fields=["company", "fiscal_end_date"],
                        name="idx_leave_promo_company_fiscal",
                    ),
                ],
                "constraints": [
                    models.UniqueConstraint(
                        fields=("membership", "fiscal_end_date", "kind"),
                        name="uniq_leave_promo_member_fiscal_kind",
                    ),
                ],
            },
        ),
    ]
