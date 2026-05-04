# Hand-authored to mirror Django's makemigrations output for the trip app.
import uuid

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("identity", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="BusinessTrip",
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
                (
                    "kind",
                    models.CharField(
                        choices=[
                            ("BUSINESS_TRIP", "Business trip"),
                            ("FIELD_WORK", "Field work"),
                        ],
                        default="BUSINESS_TRIP",
                        max_length=16,
                    ),
                ),
                ("start_date", models.DateField()),
                ("end_date", models.DateField()),
                ("location_label", models.CharField(max_length=200)),
                ("purpose", models.TextField(blank=True, default="")),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("PENDING", "Pending"),
                            ("APPROVED", "Approved"),
                            ("REJECTED", "Rejected"),
                            ("CANCELLED", "Cancelled"),
                        ],
                        default="PENDING",
                        max_length=16,
                    ),
                ),
                ("decided_at", models.DateTimeField(blank=True, null=True)),
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
                        related_name="decided_trips",
                        to="identity.membership",
                    ),
                ),
                (
                    "membership",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="business_trips",
                        to="identity.membership",
                    ),
                ),
            ],
            options={
                "db_table": "business_trip",
                "indexes": [
                    models.Index(
                        fields=["membership", "status"],
                        name="idx_trip_member_status",
                    ),
                    models.Index(
                        fields=["company", "start_date", "end_date"],
                        name="idx_trip_range",
                    ),
                ],
                "constraints": [
                    models.CheckConstraint(
                        check=models.Q(("end_date__gte", models.F("start_date"))),
                        name="ck_trip_end_after_start",
                    ),
                ],
            },
        ),
    ]
