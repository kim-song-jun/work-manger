"""Add User.use_native_home BooleanField (PoC toggle)."""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("identity", "0006_company_brand_logo"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="use_native_home",
            field=models.BooleanField(default=False),
        ),
    ]
