"""WebSocket JWT auth middleware.

Reads `?token=<access_token>` from the connection scope's query string,
validates with `rest_framework_simplejwt.tokens.AccessToken`, and attaches:

    scope["user"]       — the resolved User (or AnonymousUser on failure)
    scope["membership"] — that user's first active Membership (or None)

Connections without a valid token are rejected with WS close code 4401
during the consumer's `connect()` (the consumer reads `scope["user"]`).
"""
from __future__ import annotations

from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser


@database_sync_to_async
def _resolve(token: str):
    """Decode token, fetch user + first active membership. Returns (user, membership)."""
    from rest_framework_simplejwt.exceptions import TokenError
    from rest_framework_simplejwt.tokens import AccessToken

    from apps.identity.models import Membership, User

    try:
        access = AccessToken(token)
    except TokenError:
        return AnonymousUser(), None
    user_id = access.get("sub") or access.get("user_id")
    if not user_id:
        return AnonymousUser(), None
    user = User.objects.filter(id=user_id, is_active=True).first()
    if user is None:
        return AnonymousUser(), None
    membership = (
        Membership.objects.filter(user=user, is_active=True)
        .select_related("company", "department")
        .first()
    )
    return user, membership


class JWTAuthMiddleware(BaseMiddleware):
    """Populate scope[user]/scope[membership] from `?token=` query param."""

    async def __call__(self, scope, receive, send):
        qs = scope.get("query_string", b"")
        if isinstance(qs, bytes):
            qs = qs.decode("latin-1")
        params = parse_qs(qs)
        token_list = params.get("token", [])
        token = token_list[0] if token_list else ""
        if token:
            user, membership = await _resolve(token)
        else:
            user, membership = AnonymousUser(), None
        scope["user"] = user
        scope["membership"] = membership
        return await super().__call__(scope, receive, send)
