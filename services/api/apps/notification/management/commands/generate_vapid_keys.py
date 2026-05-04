"""Mint a fresh VAPID (ECDSA P-256) keypair for Web Push.

Run once per environment (dev / stg / prod) — the public key is hard-baked
into FE bundles via ``VITE_VAPID_PUBLIC_KEY`` (or fetched at runtime from
``GET /v1/notifications/vapid-public-key``); the private key lives only in
the BE secret store.

Usage::

    docker compose exec api python manage.py generate_vapid_keys

Output (stdout) is intentionally raw env-var assignments so an operator can
``>> .env`` it directly. Never commit the private key.

See: docs/operations/operations-guide.md §5.4, ADR-006.
"""
from __future__ import annotations

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Print a fresh VAPID keypair for Web Push (paste into env vars)."

    def handle(self, *args: object, **options: object) -> None:
        # Lazy import — pywebpush may be absent in dev shells without the dep.
        try:
            from py_vapid import Vapid  # py_vapid ships transitively with pywebpush
        except ImportError as exc:  # pragma: no cover
            raise SystemExit(
                "py_vapid not installed. Install pywebpush==2.0.1 first."
            ) from exc

        v = Vapid()
        v.generate_keys()
        # Output the URL-safe base64 encodings expected by pywebpush.webpush
        # and the browser's `applicationServerKey`.
        priv = v.private_key_pem().decode("utf-8") if hasattr(v, "private_key_pem") else ""
        pub_b64 = v.public_key.public_bytes(  # type: ignore[union-attr]
            encoding=__import__("cryptography").hazmat.primitives.serialization.Encoding.X962,
            format=__import__("cryptography").hazmat.primitives.serialization.PublicFormat.UncompressedPoint,
        )
        import base64

        pub_url_b64 = base64.urlsafe_b64encode(pub_b64).rstrip(b"=").decode("ascii")

        self.stdout.write("# --- Paste into your .env (and FE VITE_VAPID_PUBLIC_KEY) ---")
        self.stdout.write(f"WEB_PUSH_VAPID_PUBLIC_KEY={pub_url_b64}")
        self.stdout.write("WEB_PUSH_VAPID_PRIVATE_KEY=<<EOF")
        self.stdout.write(priv.strip())
        self.stdout.write("EOF")
