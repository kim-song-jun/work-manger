"""TDD tests for notification dispatch service.

Behavior:
- dispatch(membership, event_kind, payload, channels=...) writes a NotificationLog
  row per requested channel that is enabled in NotificationPreference (default true).
- Disabling a channel via preference suppresses that channel's row.
- mark_read flips read_at to now() and is idempotent.
"""
from __future__ import annotations

from datetime import datetime, timedelta

import pytest
from django.utils import timezone as django_tz
from freezegun import freeze_time

from apps.notification.models import (
    DeviceToken,
    NotificationLog,
    NotificationPreference,
)
from tests.factories import MembershipFactory

pytestmark = pytest.mark.django_db


def _import_service():
    from apps.notification import services  # noqa: WPS433

    return services


def test_dispatch_writes_log_per_default_channel():
    svc = _import_service()
    m = MembershipFactory()
    logs = svc.dispatch(
        m, event_kind="LEAVE_DECISION", payload={"approved": True, "id": "x"}
    )
    assert len(logs) >= 1
    by_channel = {log.channel for log in logs}
    assert "INAPP" in by_channel
    assert NotificationLog.objects.filter(membership=m, event_kind="LEAVE_DECISION").count() == len(logs)


def test_dispatch_respects_disabled_preference():
    svc = _import_service()
    m = MembershipFactory()
    NotificationPreference.objects.create(
        membership=m, channel="EMAIL", event_kind="LEAVE_DECISION", enabled=False
    )
    logs = svc.dispatch(
        m,
        event_kind="LEAVE_DECISION",
        payload={"id": "x"},
        channels=["INAPP", "EMAIL"],
    )
    channels = [log.channel for log in logs]
    assert "INAPP" in channels
    assert "EMAIL" not in channels


def test_dispatch_explicit_channel_filter():
    svc = _import_service()
    m = MembershipFactory()
    logs = svc.dispatch(
        m,
        event_kind="OVERTIME_REQUEST",
        payload={"id": "x"},
        channels=["INAPP"],
    )
    assert {log.channel for log in logs} == {"INAPP"}


def test_dispatch_skips_push_when_no_device_tokens():
    svc = _import_service()
    m = MembershipFactory()
    logs = svc.dispatch(
        m,
        event_kind="LEAVE_EXPIRING",
        payload={"days": 1},
        channels=["PUSH", "INAPP"],
    )
    # PUSH row may exist with failed_at if no device tokens
    push = [log for log in logs if log.channel == "PUSH"]
    if push:
        assert push[0].failed_at is not None


def test_dispatch_push_writes_log_when_device_present():
    svc = _import_service()
    m = MembershipFactory()
    DeviceToken.objects.create(membership=m, platform="WEB", token="tok-x")
    logs = svc.dispatch(
        m, event_kind="LEAVE_EXPIRING", payload={}, channels=["PUSH"]
    )
    assert len(logs) == 1 and logs[0].channel == "PUSH" and logs[0].failed_at is None


def test_mark_read_is_idempotent():
    svc = _import_service()
    m = MembershipFactory()
    log = NotificationLog.objects.create(
        membership=m,
        event_kind="LEAVE_DECISION",
        channel="INAPP",
        payload_json={},
    )
    with freeze_time("2026-05-04 10:00:00"):
        svc.mark_read(m, [log.id])
    log.refresh_from_db()
    first = log.read_at
    assert first is not None
    with freeze_time("2026-05-04 11:00:00"):
        svc.mark_read(m, [log.id])
    log.refresh_from_db()
    assert log.read_at == first  # no overwrite once read


def test_inbox_notifications_endpoint_lists_unread(client_auth):
    """Smoke: GET /v1/notifications returns this user's items, unread first."""
    client, member = client_auth()
    NotificationLog.objects.create(
        membership=member,
        event_kind="LEAVE_DECISION",
        channel="INAPP",
        payload_json={"approved": True},
    )
    NotificationLog.objects.create(
        membership=member,
        event_kind="OVERTIME_REQUEST",
        channel="INAPP",
        payload_json={},
        read_at=django_tz.now(),
    )
    r = client.get("/v1/notifications")
    assert r.status_code == 200
    items = r.json()["data"]
    assert len(items) == 2
    # unread first
    assert items[0]["read_at"] is None
