# Generated for iter13 T6 — billing skeleton

import django.db.models.deletion
import django.utils.timezone
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('identity', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SubscriptionPlan',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=64)),
                ('price_monthly_krw', models.IntegerField()),
                ('max_employees', models.IntegerField(default=0, help_text='0 = unlimited')),
                ('features_jsonb', models.JSONField(blank=True, default=dict)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False)),
            ],
            options={
                'db_table': 'billing_subscription_plan',
                'indexes': [models.Index(fields=['is_active'], name='idx_plan_active')],
            },
        ),
        migrations.CreateModel(
            name='CompanySubscription',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('status', models.CharField(choices=[('TRIAL', 'Trial'), ('ACTIVE', 'Active'), ('PAST_DUE', 'Past due'), ('CANCELED', 'Canceled')], default='TRIAL', max_length=16)),
                ('started_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('current_period_end', models.DateTimeField(blank=True, null=True)),
                ('canceled_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subscriptions', to='identity.company')),
                ('plan', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='subscriptions', to='billing.subscriptionplan')),
            ],
            options={
                'db_table': 'billing_company_subscription',
                'indexes': [models.Index(fields=['company', 'status'], name='idx_sub_company_status')],
            },
        ),
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('amount_krw', models.IntegerField()),
                ('status', models.CharField(choices=[('DRAFT', 'Draft'), ('PAID', 'Paid'), ('VOID', 'Void')], default='DRAFT', max_length=16)),
                ('issued_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('paid_at', models.DateTimeField(blank=True, null=True)),
                ('external_id', models.CharField(blank=True, default='', help_text='Stripe invoice ID (iter14)', max_length=128)),
                ('pdf_url', models.URLField(blank=True, default='')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False)),
                ('subscription', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invoices', to='billing.companysubscription')),
            ],
            options={
                'db_table': 'billing_invoice',
                'indexes': [models.Index(fields=['subscription', 'status'], name='idx_invoice_sub_status'), models.Index(fields=['issued_at'], name='idx_invoice_issued')],
            },
        ),
    ]
