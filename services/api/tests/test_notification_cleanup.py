"""
Test: notification · cleanup_stale_device_tokens (B-CODE-08)
Type: Integration (real Postgres)
Why:  410/badToken cleanup 만으로는 cover 안 되는 silent staleness (앱 삭제 / OS
      가 push 서버에 통보 안 함). 미정리 시 outbox 가 dead 토큰에 retry 반복 →
      provider quota 낭비 + DB 부담. 본 GC 가 안전망.
Covers:
  - last_seen_at < cutoff(60일) 인 토큰만 삭제
  - 임계점 정확히 60일 = 유지 (strict less-than)
  - 활성 토큰 (≤60d) 영향 0
  - 빈 테이블 idempotent (0 return)
Out of scope:
  - Celery beat 스케줄 — 마이그레이션 0004 가 등록, smoke 시 발화 확인 별도
Coverage target: ≥ 90% for apps/notification/cleanup.py
"""
from __future__ import annotations

from datetime import timedelta

import pytest
from django.utils import timezone as django_tz
from freezegun import freeze_time

from apps.notification.cleanup import (
    STALE_AFTER_DAYS,
    cleanup_stale_device_tokens,
    purge_stale_device_tokens,
)
from apps.notification.models import DeviceToken
from tests.factories import MembershipFactory

pytestmark = pytest.mark.django_db


def _mk_token(membership, days_ago: int) -> DeviceToken:
    seen = django_tz.now() - timedelta(days=days_ago)
    return DeviceToken.objects.create(
        membership=membership,
        platform="WEB",
        token=f"tok-{days_ago}d-{membership.pk}",
        last_seen_at=seen,
    )


def test_purge_drops_only_tokens_older_than_cutoff():
    m = MembershipFactory()
    fresh = _mk_token(m, days_ago=1)
    mid = _mk_token(m, days_ago=STALE_AFTER_DAYS - 1)
    stale = _mk_token(m, days_ago=STALE_AFTER_DAYS + 1)
    very_stale = _mk_token(m, days_ago=STALE_AFTER_DAYS * 4)

    deleted = purge_stale_device_tokens()

    assert deleted == 2
    remaining = set(DeviceToken.objects.values_list("id", flat=True))
    assert fresh.id in remaining
    assert mid.id in remaining
    assert stale.id not in remaining
    assert very_stale.id not in remaining


@freeze_time("2026-05-13 12:00:00")
def test_purge_at_exact_cutoff_keeps_token():
    """Strict less-than: a token last seen exactly at the cutoff stays."""
    m = MembershipFactory()
    on_cutoff = _mk_token(m, days_ago=STALE_AFTER_DAYS)
    deleted = purge_stale_device_tokens()
    assert deleted == 0
    assert DeviceToken.objects.filter(id=on_cutoff.id).exists()


def test_purge_is_idempotent_on_empty_table():
    assert DeviceToken.objects.count() == 0
    assert purge_stale_device_tokens() == 0


def test_celery_task_wraps_purge():
    """The shared_task entry-point must delegate to purge_stale_device_tokens."""
    m = MembershipFactory()
    _mk_token(m, days_ago=STALE_AFTER_DAYS + 2)
    _mk_token(m, days_ago=5)
    deleted = cleanup_stale_device_tokens()
    assert deleted == 1
    assert DeviceToken.objects.count() == 1
