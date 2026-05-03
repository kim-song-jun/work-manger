"""
Test: notification · reliable outbox + Celery dispatch worker
Type: Integration (real Postgres, Celery in-process via CELERY_TASK_ALWAYS_EAGER, Redis broker)
Why:  알림 발송은 외부 네트워크 호출(FCM/APNs/SES)에 의존한다. 이 호출이 실패해도
      비즈니스 트랜잭션은 이미 커밋된 상태여야 하고, 발송은 안전하게 재시도되어야 한다.
      운영 가이드 §5 (백오프 / 실패 시 failed_at 기록) 와 사용자 신뢰
      ("결정 났는데 알림 안 옴") 의 핵심 안전망이다. 본 테스트는
      enqueue → SENT 해피패스, 실패 시 next_attempt_at 백오프, max_attempts
      초과 시 DEAD 전이, dispatch_due 의 시각 필터, select_for_update(skip_locked=True)
      의 더블-처리 방지를 회귀 보호한다.
Covers:
  - apps.notification.outbox.enqueue            — Outbox 행 생성 + on_commit 즉시 처리
  - apps.notification.outbox.process_one        — provider 호출 / 상태 전이 / Log 동기화
  - apps.notification.outbox.dispatch_due       — Beat 스윕 (next_attempt_at 필터)
  - apps.notification.outbox.BACKOFF_SECONDS    — 30s/1m/5m/15m/60m 고정 백오프
Out of scope:
  - 실제 FCM/APNs/SES 호출 (provider stub 으로 대체)
  - REST API 응답 (test_notification.py 가 다룸)
  - 메일 backend 설정 (settings 검증은 별도)
Coverage target: ≥ 90% lines for apps/notification/outbox.py
"""
from __future__ import annotations

from datetime import timedelta

import pytest
from django.utils import timezone as django_tz

from apps.notification import outbox as outbox_module
from apps.notification.models import (
    DeviceToken,
    NotificationLog,
    NotificationOutbox,
)
from tests.factories import MembershipFactory

pytestmark = pytest.mark.django_db(transaction=True)


# ----- helpers ---------------------------------------------------------------


def _enqueue_with_log(membership, *, channel: str, payload: dict | None = None):
    """Mirror what services.dispatch does: create the Log row first, then
    enqueue an outbox row that links back to it via _log_id, then call
    outbox.schedule to fire the Celery task (eager → synchronous).
    """
    payload = dict(payload or {})
    log = NotificationLog.objects.create(
        membership=membership,
        event_kind="TEST_EVENT",
        channel=channel,
        payload_json=payload,
    )
    outbox_payload = dict(payload)
    outbox_payload[outbox_module.LOG_LINK_KEY] = str(log.id)
    row = outbox_module.enqueue(
        membership,
        channel=channel,
        event_kind="TEST_EVENT",
        payload=outbox_payload,
    )
    outbox_module.schedule(row.id)
    return log, row


# ----- happy path -------------------------------------------------------------


def test_enqueue_then_process_marks_sent_and_links_log_delivered():
    """enqueue() under eager celery should run process_one immediately and
    update both the Outbox row (SENT) and the linked NotificationLog
    (delivered_at populated). Why: 가장 흔한 happy path.
    """
    # Arrange
    m = MembershipFactory()
    DeviceToken.objects.create(membership=m, platform="WEB", token="tok-1")

    # Act
    log, row = _enqueue_with_log(m, channel="PUSH")

    # Assert
    row.refresh_from_db()
    log.refresh_from_db()
    assert row.status == NotificationOutbox.Status.SENT
    assert row.attempts == 1
    assert row.sent_at is not None
    assert row.provider_message_id != ""
    assert log.delivered_at is not None
    assert log.failed_at is None


def test_inapp_enqueue_marks_sent_without_device_token():
    """INAPP provider is a DB row only — should always succeed."""
    m = MembershipFactory()
    log, row = _enqueue_with_log(m, channel="INAPP")
    row.refresh_from_db()
    log.refresh_from_db()
    assert row.status == NotificationOutbox.Status.SENT
    assert log.delivered_at is not None


# ----- failure / retry semantics ---------------------------------------------


def test_provider_failure_increments_attempts_and_schedules_backoff():
    """A single provider failure should leave the Outbox in FAILED, attempts=1,
    next_attempt_at ≈ now + 30s (BACKOFF_SECONDS[0]). Log row stays pending.
    """
    m = MembershipFactory()
    DeviceToken.objects.create(membership=m, platform="WEB", token="tok-fail")

    before = django_tz.now()
    log, row = _enqueue_with_log(m, channel="PUSH", payload={"_force_fail": True})
    row.refresh_from_db()
    log.refresh_from_db()

    assert row.status == NotificationOutbox.Status.FAILED
    assert row.attempts == 1
    assert row.last_error and "forced failure" in row.last_error
    expected_low = before + timedelta(seconds=outbox_module.BACKOFF_SECONDS[0] - 5)
    expected_high = before + timedelta(seconds=outbox_module.BACKOFF_SECONDS[0] + 30)
    assert expected_low <= row.next_attempt_at <= expected_high
    # log row not terminal yet
    assert log.delivered_at is None
    assert log.failed_at is None


def test_reaches_max_attempts_marks_dead_and_sets_log_failed_at():
    """After max_attempts the Outbox should transition to DEAD and the linked
    NotificationLog should record failed_at + truncated last_error.
    """
    m = MembershipFactory()
    DeviceToken.objects.create(membership=m, platform="WEB", token="tok-dead")

    log, row = _enqueue_with_log(m, channel="PUSH", payload={"_force_fail": True})
    # First attempt already happened during enqueue → status=FAILED, attempts=1.
    # Drive the row through remaining attempts manually (reset next_attempt_at
    # back to now each time so process_one is willing to re-claim it).
    for _ in range(row.max_attempts - 1):
        row.refresh_from_db()
        row.next_attempt_at = django_tz.now()
        row.save(update_fields=["next_attempt_at"])
        outbox_module.process_one(str(row.id))

    row.refresh_from_db()
    log.refresh_from_db()
    assert row.status == NotificationOutbox.Status.DEAD
    assert row.attempts == row.max_attempts
    assert log.failed_at is not None
    # last_error truncation cap = 256
    assert len(row.last_error) <= 256
    # last_error stashed in payload_json (NotificationLog has no dedicated col)
    assert "_last_error" in (log.payload_json or {})


# ----- dispatch_due (Beat) ----------------------------------------------------


def test_dispatch_due_only_processes_rows_past_their_schedule():
    """A FAILED row scheduled in the future must NOT be picked by dispatch_due.
    A row scheduled in the past must be re-enqueued and processed (succeeds
    when the force_fail flag is cleared).
    """
    m = MembershipFactory()
    DeviceToken.objects.create(membership=m, platform="WEB", token="tok-due")

    # Row A — scheduled in the future, must be ignored.
    log_a, row_a = _enqueue_with_log(m, channel="PUSH", payload={"_force_fail": True})
    NotificationOutbox.objects.filter(id=row_a.id).update(
        next_attempt_at=django_tz.now() + timedelta(hours=1)
    )

    # Row B — scheduled in the past, payload no longer forces failure.
    log_b, row_b = _enqueue_with_log(m, channel="PUSH", payload={"_force_fail": True})
    NotificationOutbox.objects.filter(id=row_b.id).update(
        next_attempt_at=django_tz.now() - timedelta(seconds=10),
        payload_json={
            outbox_module.LOG_LINK_KEY: str(log_b.id),
            # _force_fail removed
        },
    )

    processed = outbox_module.dispatch_due()

    row_a.refresh_from_db()
    row_b.refresh_from_db()
    assert processed == 1
    assert row_a.status == NotificationOutbox.Status.FAILED  # untouched
    assert row_b.status == NotificationOutbox.Status.SENT


# ----- select_for_update(skip_locked=True) -----------------------------------


def test_concurrent_process_one_calls_do_not_double_send():
    """Two parallel workers calling process_one for the same id must only
    succeed once. We simulate this by holding the row's lock from a separate
    raw psycopg connection (SELECT ... FOR UPDATE) while invoking process_one
    from the test thread — the contender should hit SKIP LOCKED and return
    'skipped'. Once the lock is released, a follow-up call wins.
    """
    import psycopg
    from django.db import connection as default_conn

    m = MembershipFactory()
    DeviceToken.objects.create(membership=m, platform="WEB", token="tok-conc")

    log = NotificationLog.objects.create(
        membership=m,
        event_kind="TEST_EVENT",
        channel="PUSH",
        payload_json={},
    )
    row = NotificationOutbox.objects.create(
        membership=m,
        channel="PUSH",
        event_kind="TEST_EVENT",
        payload_json={outbox_module.LOG_LINK_KEY: str(log.id)},
        status=NotificationOutbox.Status.PENDING,
        next_attempt_at=django_tz.now(),
    )

    settings = default_conn.settings_dict
    conninfo = (
        f"host={settings['HOST']} port={settings['PORT']} "
        f"dbname={default_conn.settings_dict['NAME']} "
        f"user={settings['USER']} password={settings['PASSWORD']}"
    )

    holder = psycopg.connect(conninfo, autocommit=False)
    try:
        with holder.cursor() as cur:
            cur.execute(
                "SELECT id FROM notification_outbox WHERE id=%s FOR UPDATE",
                [str(row.id)],
            )
            assert cur.fetchone() is not None

            # Contender hits SKIP LOCKED and returns "skipped" without touching status.
            result_b = outbox_module.process_one(str(row.id))
            assert result_b == "skipped"

            row.refresh_from_db()
            assert row.status == NotificationOutbox.Status.PENDING
            assert row.attempts == 0
        holder.rollback()
    finally:
        holder.close()

    # Lock released — a fresh call now succeeds.
    result_c = outbox_module.process_one(str(row.id))
    assert result_c == "sent"
    row.refresh_from_db()
    assert row.status == NotificationOutbox.Status.SENT


# ----- backoff schedule cap ---------------------------------------------------


def test_backoff_clamps_to_last_value_for_high_attempt_counts():
    """_next_attempt_after should saturate at BACKOFF_SECONDS[-1] when attempts
    exceeds the configured schedule length."""
    nxt = outbox_module._next_attempt_after(99)
    delta = (nxt - django_tz.now()).total_seconds()
    last = outbox_module.BACKOFF_SECONDS[-1]
    assert last - 5 <= delta <= last + 5
