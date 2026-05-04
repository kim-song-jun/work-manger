"""Provision the BE service user inside the ntfy container.

ntfy ACL is set to ``deny-all`` by default (compose env var) so we MUST grant
publish rights to a service identity before the BE can POST messages. The
canonical workflow runs the ntfy CLI inside the running ``ntfy`` container::

    docker compose exec ntfy ntfy user add --role=user wm-publisher
    docker compose exec ntfy ntfy access wm-publisher 'wm-prod-*' write

This command emits the equivalent shell snippet (it does NOT exec into the
container itself — that requires Docker socket access we don't grant the api
container). Operators copy-paste it once per environment.

Usage::

    docker compose exec api python manage.py init_ntfy_user wm-publisher

See: docs/operations/operations-guide.md §5.4 — "Self-hosted push 운영".
"""
from __future__ import annotations

from typing import Any

from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Print the ntfy CLI snippet to provision a publisher user."

    def add_arguments(self, parser: Any) -> None:
        parser.add_argument(
            "username",
            nargs="?",
            default="wm-publisher",
            help="ntfy username for the BE publisher (default: wm-publisher).",
        )

    def handle(self, *args: object, **options: object) -> None:
        username = options.get("username", "wm-publisher")
        prefix = getattr(settings, "NTFY_TOPIC_PREFIX", "wm-prod")

        self.stdout.write("# --- Run on the docker host (NOT inside api) ---")
        self.stdout.write(
            f"docker compose exec ntfy ntfy user add --role=user {username}"
        )
        self.stdout.write(
            f"docker compose exec ntfy ntfy access {username} '{prefix}-*' write"
        )
        self.stdout.write(
            f"docker compose exec ntfy ntfy access everyone '{prefix}-*' read"
        )
        self.stdout.write("# Then mint a token and stash in NTFY_AUTH_TOKEN:")
        self.stdout.write(
            f"docker compose exec ntfy ntfy token add {username}"
        )
