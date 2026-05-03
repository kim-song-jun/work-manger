#!/usr/bin/env bash
set -euo pipefail

echo "==> Waiting for database ${DATABASE_HOST:-db}:${DATABASE_PORT:-5432}"
until python - <<'PY'
import os, socket, sys, time
host = os.environ.get("DATABASE_HOST", "db")
port = int(os.environ.get("DATABASE_PORT", "5432"))
deadline = time.time() + 60
while time.time() < deadline:
    try:
        with socket.create_connection((host, port), timeout=2):
            sys.exit(0)
    except OSError:
        time.sleep(1)
sys.exit(1)
PY
do
  echo "  db not ready yet"
  sleep 1
done

echo "==> Applying migrations"
python manage.py migrate --noinput

if [ "${DJANGO_CREATE_SUPERUSER:-0}" = "1" ]; then
  echo "==> Ensuring default superuser"
  python manage.py shell <<'PY'
import os
from django.contrib.auth import get_user_model
U = get_user_model()
email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
pwd   = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "admin1234!")
if not U.objects.filter(email=email).exists():
    U.objects.create_superuser(email=email, password=pwd, name="Admin")
    print(f"  created {email}")
else:
    print(f"  exists  {email}")
PY
fi

echo "==> Starting: $*"
exec "$@"
