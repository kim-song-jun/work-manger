"""
Test: realtime · WebSocket auth + group routing + broadcast wiring
Type: Integration (Channels InMemoryChannelLayer + real Postgres for users/membership)
Why:  실시간 인박스/팀/관리자 채널은 사용자가 결과를 즉시 확인하는 핵심 UX.
      - JWT 미인증/만료 토큰이 들어오면 4401 으로 끊어야 함 (보안)
      - 권한 미달(EMPLOYEE)이 admin 채널에 붙으면 4403 (권한 분리)
      - notification.dispatch 가 INAPP 로그를 만들면 inbox 채널에 즉시 푸시
        되어야 함 (서비스 ↔ WS 게이트웨이의 회귀 보호)
Covers:
  - apps.realtime.auth_middleware.JWTAuthMiddleware  — token 추출/검증/거절
  - apps.realtime.consumers.TeamConsumer / InboxConsumer / AdminConsumer
  - apps.realtime.broadcast.notify_inbox / broadcast_to_group  envelope 포맷
  - apps.notification.services.dispatch  의 WS push 사이드이펙트
Out of scope:
  - 메시지 throughput / 백프레셔 (운영 부하 테스트 별도)
  - daphne 프로덕션 컨테이너 (docker-compose 통합 검증)
Coverage target: ≥ 90% lines for apps/realtime/*
"""
from __future__ import annotations

import pytest
from channels.routing import URLRouter
from channels.testing import WebsocketCommunicator
from rest_framework_simplejwt.tokens import AccessToken

from apps.identity.models import Membership
from apps.realtime.auth_middleware import JWTAuthMiddleware
from apps.realtime.routing import websocket_urlpatterns
from tests.factories import MembershipFactory


# All tests in this module are async + need DB. ``transaction=True`` is required
# because ``database_sync_to_async`` opens its own connection (TransactionTestCase
# semantics — no outer ATOMIC wrap). ``--reuse-db`` is recommended locally.
pytestmark = [pytest.mark.asyncio, pytest.mark.django_db(transaction=True)]


# Force in-memory channel layer for tests (no live Redis required).
@pytest.fixture(autouse=True)
def _inmem_channel_layer(settings):
    settings.CHANNEL_LAYERS = {
        "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"},
    }


def _app():
    """Wrap the WS routing the same way asgi.py does (sans HostsValidator)."""
    return JWTAuthMiddleware(URLRouter(websocket_urlpatterns))


def _token_for(membership: Membership) -> str:
    """Issue a SimpleJWT access token for `membership.user`."""
    token = AccessToken.for_user(membership.user)
    return str(token)


# ---------------- connect / auth ----------------

async def test_inbox_connects_with_valid_token(db):
    """유효 JWT 로 inbox 채널 연결 시 connect() True 반환."""
    member = await _make_member()
    token = _token_for(member)
    comm = WebsocketCommunicator(_app(), f"/v1/ws/inbox?token={token}")
    connected, _ = await comm.connect()
    assert connected is True
    await comm.disconnect()


async def test_inbox_rejects_without_token(db):
    """token 누락 시 4401 으로 close. 인증 필수임을 회귀 보호."""
    comm = WebsocketCommunicator(_app(), "/v1/ws/inbox")
    connected, code = await comm.connect()
    assert connected is False
    assert code == 4401


async def test_admin_rejects_employee(db):
    """EMPLOYEE 가 admin 채널에 붙으면 4403. 권한 분리 회귀 보호."""
    member = await _make_member(role=Membership.Role.EMPLOYEE)
    token = _token_for(member)
    comm = WebsocketCommunicator(_app(), f"/v1/ws/admin?token={token}")
    connected, code = await comm.connect()
    assert connected is False
    assert code == 4403


async def test_admin_accepts_admin_role(db):
    """ADMIN 권한이면 admin 채널 connect() True. 권한 인가 회귀 보호."""
    member = await _make_member(role=Membership.Role.ADMIN)
    token = _token_for(member)
    comm = WebsocketCommunicator(_app(), f"/v1/ws/admin?token={token}")
    connected, _ = await comm.connect()
    assert connected is True
    await comm.disconnect()


# ---------------- broadcast ↔ consumer ----------------

async def test_dispatch_pushes_notification_to_inbox(db):
    """notification.dispatch(INAPP) 호출 시 inbox WS 가 wm.event 수신.
    이유: DB 저장 + 실시간 알림이 한 트랜잭션 흐름으로 함께 동작해야 한다.
    """
    member = await _make_member()
    token = _token_for(member)
    comm = WebsocketCommunicator(_app(), f"/v1/ws/inbox?token={token}")
    connected, _ = await comm.connect()
    assert connected is True

    await _dispatch_notification(member)

    msg = await comm.receive_json_from(timeout=2)
    assert msg["event"] == "notification.created"
    assert msg["channel"] == f"inbox:{member.id}"  # public name per api-spec §9
    assert msg["payload"]["event_kind"] == "LEAVE_DECISION"

    await comm.disconnect()


# ---------------- helpers ----------------

from channels.db import database_sync_to_async  # noqa: E402


@database_sync_to_async
def _make_member(role: str = Membership.Role.EMPLOYEE) -> Membership:
    return MembershipFactory(role=role)


@database_sync_to_async
def _dispatch_notification(member: Membership) -> None:
    from apps.notification import services as notif_svc

    notif_svc.dispatch(
        member,
        event_kind="LEAVE_DECISION",
        payload={"approved": True, "id": "x"},
    )
