"""Celery tasks for the audit app.

F-ADMIN-07 / F-OWNER-06: 90-day retention policy per operations-guide §11.
Daily at 03:00 KST, rows older than AUDIT_LOG_RETENTION_DAYS are purged.

Note: the 7-year physical deletion described in sop-data-deletion-request.md §7
is a *separate* offline archive job and is NOT the same as this 90-day live-DB
retention sweep.
"""
from __future__ import annotations

import logging
from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.utils import timezone as django_tz

logger = logging.getLogger(__name__)

# Default 90-day retention. Override via settings.AUDIT_LOG_RETENTION_DAYS.
_DEFAULT_RETENTION_DAYS = 90


def _retention_days() -> int:
    return int(getattr(settings, "AUDIT_LOG_RETENTION_DAYS", _DEFAULT_RETENTION_DAYS))


@shared_task(name="audit.purge_old_audit_logs", bind=True, max_retries=3)
def purge_old_audit_logs(self) -> dict:
    """Delete AuditLog rows older than AUDIT_LOG_RETENTION_DAYS (default: 90).

    Returns a dict with ``deleted`` count for observability.
    Registered as a PeriodicTask via migration 0002.
    """
    from .models import AuditLog

    days = _retention_days()
    cutoff = django_tz.now() - timedelta(days=days)
    try:
        deleted_count, _ = AuditLog.objects.filter(created_at__lt=cutoff).delete()
        logger.info("audit.purge_old_audit_logs: deleted=%d cutoff=%s", deleted_count, cutoff.date())
        return {"deleted": deleted_count, "cutoff": cutoff.isoformat()}
    except Exception as exc:  # noqa: BLE001
        logger.exception("audit.purge_old_audit_logs failed")
        raise self.retry(exc=exc, countdown=3600) from exc
