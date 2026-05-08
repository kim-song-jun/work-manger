"""iter13 T3 — add ``LeaveRequest.leave_type`` (ANNUAL / COMP / SICK / PERSONAL).

Reversible: ``migrate leave 0004`` drops the column. The default
(``ANNUAL``) backfills every existing row, so production data is preserved
and the migration runs in a single forward pass without a separate data
migration.
"""
from __future__ import annotations

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("leave", "0004_seed_promotion_beat"),
    ]

    operations = [
        migrations.AddField(
            model_name="leaverequest",
            name="leave_type",
            field=models.CharField(
                choices=[
                    ("ANNUAL", "Annual leave"),
                    ("COMP", "Compensation leave"),
                    ("SICK", "Sick leave"),
                    ("PERSONAL", "Personal leave"),
                ],
                default="ANNUAL",
                max_length=16,
            ),
        ),
    ]
