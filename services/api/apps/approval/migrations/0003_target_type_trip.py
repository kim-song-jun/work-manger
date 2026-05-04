# Adds the TRIP target_type choice. No DB schema change — choices are Python-side.
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("approval", "0002_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="approvaltask",
            name="target_type",
            field=models.CharField(
                choices=[
                    ("OVERTIME", "Overtime"),
                    ("LEAVE", "Leave"),
                    ("MANUAL_CLOCK_IN", "Manual clock-in"),
                    ("TRIP", "Business trip"),
                ],
                max_length=24,
            ),
        ),
    ]
