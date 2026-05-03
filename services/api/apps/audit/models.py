"""Audit log — append-only event sink per docs/architecture/data-model.md §2.6."""
from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone as django_tz

from apps.identity.models import Company


class AuditLog(models.Model):
    """Append-only audit event row.

    UPDATE/DELETE are forbidden by policy (operations-guide §11) — enforced at the
    service layer (no exposed mutators).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_logs",
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=64)
    target_type = models.CharField(max_length=64, blank=True, default="")
    target_id = models.UUIDField(null=True, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=256, blank=True, default="")
    payload_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=django_tz.now, editable=False)

    class Meta:
        db_table = "audit_log"
        indexes = [
            models.Index(
                fields=["company", "-created_at"], name="idx_audit_company_time"
            ),
            models.Index(
                fields=["action", "-created_at"], name="idx_audit_action_time"
            ),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.action}@{self.created_at:%Y-%m-%d %H:%M}"
