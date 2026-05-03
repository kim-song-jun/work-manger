"""WebSocket consumers for the Work Manager realtime feed.

Channel groups (per docs/api/api-spec.md §9):
    team:{company_id}        — team status changes (clock-in/out, break, leave)
    inbox:{membership_id}    — personal inbox events (notifications, decisions)
    admin:{company_id}       — admin live board (ADMIN/OWNER only)

All consumers are read-only feeds. The server pushes `wm.event` envelopes via
`broadcast.broadcast_to_group()`; clients send no messages back.
"""
from __future__ import annotations

from typing import Any

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

ADMIN_ROLES = {"ADMIN", "OWNER"}


class _BaseConsumer(AsyncJsonWebsocketConsumer):
    """Common helpers: auth check + group join/leave + envelope handler."""

    group_name: str | None = None

    async def _require_auth(self) -> bool:
        user = self.scope.get("user")
        if user is None or getattr(user, "is_anonymous", True):
            await self.close(code=4401)
            return False
        return True

    async def _require_membership(self) -> bool:
        if self.scope.get("membership") is None:
            await self.close(code=4401)
            return False
        return True

    async def disconnect(self, code):  # noqa: D401
        if self.group_name is not None:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # Generic envelope handler used by `broadcast_to_group`.
    async def wm_event(self, event: dict[str, Any]) -> None:
        # Channels group names cannot contain ':' so internally we store
        # ``team.<id>`` / ``inbox.<id>`` / ``admin.<id>``. The public-facing
        # name in the wire envelope uses ':' per docs/api/api-spec.md §9.
        public_name = self.group_name.replace(".", ":", 1) if self.group_name else None
        await self.send_json(
            {
                "channel": public_name,
                "event": event.get("event"),
                "payload": event.get("payload", {}),
                "ts": event.get("ts"),
            }
        )


class TeamConsumer(_BaseConsumer):
    """team:{company_id} — read-only stream of team status changes."""

    async def connect(self) -> None:
        if not await self._require_auth():
            return
        if not await self._require_membership():
            return
        company_id = self.scope["membership"].company_id
        self.group_name = f"team.{company_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        # Optional snapshot on connect.
        try:
            snapshot = await self._team_snapshot(company_id)
            await self.send_json(
                {
                    "channel": self.group_name,
                    "event": "team.snapshot",
                    "payload": snapshot,
                    "ts": None,
                }
            )
        except Exception:  # noqa: BLE001 — snapshot is best-effort
            pass

    @database_sync_to_async
    def _team_snapshot(self, company_id) -> dict[str, Any]:
        from apps.team.views import _today_data

        today, items = _today_data(company_id)
        return {"date": today.isoformat(), "items": items}


class InboxConsumer(_BaseConsumer):
    """inbox:{membership_id} — personal notifications + approval decisions."""

    async def connect(self) -> None:
        if not await self._require_auth():
            return
        if not await self._require_membership():
            return
        membership_id = self.scope["membership"].id
        self.group_name = f"inbox.{membership_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()


class AdminConsumer(_BaseConsumer):
    """admin:{company_id} — admin live board. ADMIN/OWNER only."""

    async def connect(self) -> None:
        if not await self._require_auth():
            return
        membership = self.scope.get("membership")
        if membership is None:
            await self.close(code=4401)
            return
        if membership.role not in ADMIN_ROLES:
            await self.close(code=4403)
            return
        self.group_name = f"admin.{membership.company_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
