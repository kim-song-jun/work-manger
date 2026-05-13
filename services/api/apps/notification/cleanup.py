"""Periodic cleanup tasks for the notification module.

Currently a single task: stale device-token GC. Tokens already get deleted on
410 / badToken / 404 from the provider; this sweep handles silent staleness
(user uninstalled the app without the OS notifying the push service, expired
ntfy bearer rotation, etc.). Without it the DeviceToken table grows unbounded
and every push fans out to dead tokens that incur outbox retries.

Backlog: B-CODE-08. Schedule is seeded by migration 0004_seed_cleanup_beat.
"""
from __future__ import annotations

import logging
from datetime import timedelta

from celery import shared_task
from django.utils import timezone as django_tz

from .models import DeviceToken

logger = logging.getLogger(__name__)

# Tokens silent for 60 days are considered stale. Conservative — most install
# bases hit a push every few weeks, so 60d covers seasonal lurkers without
# nuking truly active devices.
STALE_AFTER_DAYS = 60


def _cutoff(now=None):
    base = now or django_tz.now()
    return base - timedelta(days=STALE_AFTER_DAYS)


def purge_stale_device_tokens(now=None) -> int:
    """Delete device tokens whose ``last_seen_at`` is older than the cutoff.

    Exposed for unit tests + manual ops; the Celery task below is a thin
    wrapper.
    """
    cutoff = _cutoff(now)
    qs = DeviceToken.objects.filter(last_seen_at__lt=cutoff)
    deleted, _ = qs.delete()
    if deleted:
        logger.info(
            "notification.cleanup: purged %d stale device tokens (cutoff=%s)",
            deleted,
            cutoff.isoformat(),
        )
    return deleted


@shared_task(name="notification.cleanup_stale_device_tokens")
def cleanup_stale_device_tokens() -> int:
    """Celery entry-point. Returns the number of tokens deleted."""
    return purge_stale_device_tokens()
