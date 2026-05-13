from __future__ import annotations

from django.core.management.base import BaseCommand, CommandError

from apps.identity.models import User

ALLOWED_KEYS = {"use_native_home"}
BOOL_TRUE = {"true", "1", "yes", "on"}
BOOL_FALSE = {"false", "0", "no", "off"}


class Command(BaseCommand):
    help = "Set a per-user setting. Either --user-id or --bulk must be given."

    def add_arguments(self, parser):
        target = parser.add_mutually_exclusive_group(required=True)
        target.add_argument("--user-id", help="UUID of a single user")
        target.add_argument("--bulk", action="store_true", help="Apply to all active users")
        parser.add_argument("--key", required=True, help="Setting key (e.g. use_native_home)")
        parser.add_argument("--value", required=True, help="true / false")

    def handle(self, *args, **opts):
        key = opts["key"]
        if key not in ALLOWED_KEYS:
            raise CommandError(f"Unknown key: {key}. Allowed: {sorted(ALLOWED_KEYS)}")

        raw = str(opts["value"]).strip().lower()
        if raw in BOOL_TRUE:
            value = True
        elif raw in BOOL_FALSE:
            value = False
        else:
            raise CommandError(f"--value must be one of true/false (got {opts['value']!r})")

        if opts.get("bulk"):
            qs = User.objects.filter(is_active=True)
        else:
            qs = User.objects.filter(id=opts["user_id"])
            if not qs.exists():
                raise CommandError(f"No user with id={opts['user_id']}")

        updated = qs.update(**{key: value})
        self.stdout.write(self.style.SUCCESS(f"Updated {updated} user(s): {key}={value}"))
