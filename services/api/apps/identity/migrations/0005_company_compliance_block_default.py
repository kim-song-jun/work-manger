"""Set Postgres-level DEFAULT false on Company.compliance_block_when_over.

Background: migration 0003 set Django `default=False` for the new boolean
column, but on databases that took the DDL via earlier code paths the
column was added without a SQL-level DEFAULT. Inserts that bypass the
ORM's pre-save defaulting (e.g. some bulk loaders, raw fixtures) hit a
NOT NULL violation. We pin the schema-level default explicitly here so
that future inserts always get a value even when callers don't provide
one. Safe and idempotent at SQL level.
"""
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("identity", "0004_company_leave_promotion_enabled"),
    ]

    operations = [
        migrations.RunSQL(
            sql=(
                "ALTER TABLE company "
                "ALTER COLUMN compliance_block_when_over SET DEFAULT false;"
            ),
            reverse_sql=(
                "ALTER TABLE company "
                "ALTER COLUMN compliance_block_when_over DROP DEFAULT;"
            ),
        ),
        migrations.RunSQL(
            sql=(
                "ALTER TABLE company "
                "ALTER COLUMN leave_promotion_enabled SET DEFAULT false;"
            ),
            reverse_sql=(
                "ALTER TABLE company "
                "ALTER COLUMN leave_promotion_enabled DROP DEFAULT;"
            ),
        ),
    ]
