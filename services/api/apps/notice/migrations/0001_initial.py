# Hand-authored to mirror Django's makemigrations output for the notice app.
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
            name="Notice",
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
                ("title", models.CharField(max_length=200)),
                ("body", models.TextField(blank=True, default="")),
                ("pinned", models.BooleanField(default=False)),
                ("priority", models.IntegerField(default=0)),
                (
                    "category",
                    models.CharField(
                        choices=[
                            ("policy", "Policy"),
                            ("event", "Event"),
                            ("it", "IT"),
                            ("hr", "HR"),
                            ("general", "General"),
                        ],
                        default="general",
                        max_length=24,
                    ),
                ),
                (
                    "published_at",
                    models.DateTimeField(default=django.utils.timezone.now),
                ),
                ("archived_at", models.DateTimeField(blank=True, null=True)),
                (
                    "created_at",
                    models.DateTimeField(
                        default=django.utils.timezone.now, editable=False
                    ),
                ),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "author",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="authored_notices",
                        to="identity.membership",
                    ),
                ),
                (
                    "company",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="notices",
                        to="identity.company",
                    ),
                ),
            ],
            options={
                "db_table": "notice",
                "indexes": [
                    models.Index(
                        fields=["company", "pinned", "-published_at"],
                        name="idx_notice_company_feed",
                    ),
                    models.Index(
                        fields=["company", "category"],
                        name="idx_notice_company_cat",
                    ),
                ],
            },
        ),
    ]
