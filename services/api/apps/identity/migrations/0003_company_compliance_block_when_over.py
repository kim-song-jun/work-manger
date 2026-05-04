"""Add Company.compliance_block_when_over per spec §7.6.

Default False — feature is opt-in by company. Existing rows take the default.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("identity", "0002_user_totp_enabled_user_totp_secret_recoverycode"),
    ]

    operations = [
        migrations.AddField(
            model_name="company",
            name="compliance_block_when_over",
            field=models.BooleanField(default=False),
        ),
    ]
