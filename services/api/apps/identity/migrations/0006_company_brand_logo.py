"""Add Company.brand_color + logo_url for AdminSettingsPage (iter11 Wave 6)."""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("identity", "0005_company_compliance_block_default"),
    ]

    operations = [
        migrations.AddField(
            model_name="company",
            name="brand_color",
            field=models.CharField(
                default="#5B6CFF",
                help_text="Hex 색상 — 사이드바 / CTA 색.",
                max_length=9,
            ),
        ),
        migrations.AddField(
            model_name="company",
            name="logo_url",
            field=models.CharField(
                blank=True,
                default="",
                help_text="회사 로고 URL — 비어 있으면 기본 W 마크 표시.",
                max_length=500,
            ),
        ),
    ]
