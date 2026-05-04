"""Add Company.leave_promotion_enabled per spec §5.2.

근로기준법 §61 사용 촉진 제도 자동화는 회사별 opt-in. Default False.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("identity", "0003_company_compliance_block_when_over"),
    ]

    operations = [
        migrations.AddField(
            model_name="company",
            name="leave_promotion_enabled",
            field=models.BooleanField(default=False),
        ),
    ]
