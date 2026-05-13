# Home Native PoC — Plan-A: W1 BE 셋업 + Codegen 골격 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PoC 베타 토글의 BE 인프라(`User.use_native_home` BooleanField + `GET/PATCH /v1/me/settings` endpoint + `set_user_setting` management command) + 후속 Plan-B~D 가 호출할 Node.js codegen 3종(`flutter-tokens` / `flutter-api` / `flutter-i18n`) no-op 골격 + CI drift gate 셋업.

**Architecture:** Django identity app 에 단일 BooleanField 추가 + DRF function-based view `me_settings` (GET/PATCH, 기존 `views.me` 와 동일 패턴) + Django management command. Codegen 3종은 Node.js CJS 스크립트 + Bash drift checker. JSON `settings` 필드 / `UserSettings` OneToOne 은 YAGNI 로 보류.

**Tech Stack:** Django 5.x + DRF function-based views, PostgreSQL, pytest-django, Node.js (Makefile 기존), Bash, drf-spectacular OpenAPI.

**Related spec:** [`docs/superpowers/specs/2026-05-13-home-native-poc-design.md`](../specs/2026-05-13-home-native-poc-design.md)

---

## File Structure

| File | Purpose | New/Modify |
|---|---|---|
| `services/api/apps/identity/models.py` | `User.use_native_home: BooleanField(default=False)` 추가 | Modify |
| `services/api/apps/identity/migrations/{auto}_user_use_native_home.py` | Django `makemigrations` 산출 | New (auto) |
| `services/api/apps/identity/serializers.py` | `MeSettingsSerializer` 신규 | Modify |
| `services/api/apps/identity/views.py` | `me_settings` function view (GET+PATCH) | Modify |
| `services/api/apps/identity/urls.py` | `me/settings` 라우트 등록 | Modify |
| `services/api/apps/identity/management/__init__.py` | 빈 패키지 | New |
| `services/api/apps/identity/management/commands/__init__.py` | 빈 패키지 | New |
| `services/api/apps/identity/management/commands/set_user_setting.py` | --user-id / --bulk 토글 명령어 | New |
| `services/api/tests/test_user_use_native_home.py` | 모델 + endpoint + command 테스트 | New |
| `scripts/codegen/flutter-tokens.cjs` | tokens.css → tokens.g.dart (no-op 골격) | New |
| `scripts/codegen/flutter-api.cjs` | openapi-generator-cli 래퍼 (no-op 골격) | New |
| `scripts/codegen/flutter-i18n.cjs` | i18next json → ARB (no-op 골격) | New |
| `scripts/codegen-check.sh` | 3종 codegen 실행 후 git diff 검사 | New |
| `Makefile` | `codegen` + `codegen-check` target 추가 | Modify |

---

## Task 1: User.use_native_home BooleanField 추가 (TDD)

**Files:**
- Modify: `services/api/apps/identity/models.py`
- Create: `services/api/apps/identity/migrations/{auto}_user_use_native_home.py`
- Test: `services/api/tests/test_user_use_native_home.py`

- [ ] **Step 1.1: Write the failing test**

Create `services/api/tests/test_user_use_native_home.py`:

```python
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
def test_user_use_native_home_defaults_false():
    user = User.objects.create_user(email="t1@example.com", password="pw12345!", name="T1")
    assert user.use_native_home is False


@pytest.mark.django_db
def test_user_use_native_home_can_be_set_true():
    user = User.objects.create_user(email="t2@example.com", password="pw12345!", name="T2")
    user.use_native_home = True
    user.save()
    user.refresh_from_db()
    assert user.use_native_home is True
```

- [ ] **Step 1.2: Run test to verify it fails**

```bash
docker compose run --rm api pytest services/api/tests/test_user_use_native_home.py -q
```

Expected: FAIL with `AttributeError: 'User' object has no attribute 'use_native_home'`

- [ ] **Step 1.3: Add column to User model**

Modify `services/api/apps/identity/models.py` — after line `totp_enabled = models.BooleanField(default=False)`, add:

```python
    # PoC §6.1 — Flutter native Home toggle (default false, opt-in beta).
    # See docs/superpowers/specs/2026-05-13-home-native-poc-design.md
    use_native_home = models.BooleanField(default=False)
```

- [ ] **Step 1.4: Generate + apply migration**

```bash
docker compose run --rm api python manage.py makemigrations identity --name user_use_native_home
docker compose run --rm api python manage.py migrate
```

Expected: new migration file `services/api/apps/identity/migrations/00XX_user_use_native_home.py` created. Migration applied to dev DB.

- [ ] **Step 1.5: Run test to verify it passes**

```bash
docker compose run --rm api pytest services/api/tests/test_user_use_native_home.py -q
```

Expected: PASS (2 passed).

- [ ] **Step 1.6: Commit**

```bash
git add services/api/apps/identity/models.py services/api/apps/identity/migrations services/api/tests/test_user_use_native_home.py
git commit -m "feat(identity): add User.use_native_home BooleanField (PoC toggle)"
```

(Add the migrations directory as a whole; Django picked an auto-incremented file name in Step 1.4 — list it with `git status` to confirm a single new migration file before staging.)

---

## Task 2: MeSettingsSerializer + GET endpoint (TDD)

**Files:**
- Modify: `services/api/apps/identity/serializers.py`
- Modify: `services/api/apps/identity/views.py`
- Modify: `services/api/apps/identity/urls.py`
- Test: `services/api/tests/test_user_use_native_home.py` (append)

- [ ] **Step 2.1: Append failing test**

Append to `services/api/tests/test_user_use_native_home.py`:

```python
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken


def _auth_client(user):
    client = APIClient()
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


@pytest.mark.django_db
def test_me_settings_get_requires_auth():
    client = APIClient()
    resp = client.get("/v1/me/settings")
    assert resp.status_code == 401


@pytest.mark.django_db
def test_me_settings_get_returns_default_false():
    user = User.objects.create_user(email="g1@example.com", password="pw12345!", name="G1")
    client = _auth_client(user)
    resp = client.get("/v1/me/settings")
    assert resp.status_code == 200
    assert resp.json() == {"data": {"use_native_home": False}}
```

- [ ] **Step 2.2: Run tests to verify they fail**

```bash
docker compose run --rm api pytest services/api/tests/test_user_use_native_home.py -q
```

Expected: 2 new tests FAIL with `404 Not Found` (route absent).

- [ ] **Step 2.3: Add serializer**

Append to `services/api/apps/identity/serializers.py` (after the last existing serializer):

```python
class MeSettingsSerializer(serializers.Serializer):
    use_native_home = serializers.BooleanField()
```

- [ ] **Step 2.4: Add view function**

In `services/api/apps/identity/views.py`, after the existing `me` view function (around line 160), add:

```python
@api_view(["GET", "PATCH"])
def me_settings(request):
    """GET — returns the authenticated user's settings.
    PATCH — partial update (currently only `use_native_home`).
    See docs/superpowers/specs/2026-05-13-home-native-poc-design.md §6.
    """
    user = request.user
    if request.method == "GET":
        return Response({"data": {"use_native_home": user.use_native_home}})
    # PATCH
    s = MeSettingsSerializer(data=request.data, partial=True)
    s.is_valid(raise_exception=True)
    if "use_native_home" in s.validated_data:
        user.use_native_home = s.validated_data["use_native_home"]
        user.save(update_fields=["use_native_home", "updated_at"])
    return Response({"data": {"use_native_home": user.use_native_home}})
```

Also add the import at the top of `views.py` (find the existing serializer imports and append `MeSettingsSerializer`):

```python
from .serializers import (
    # ... existing imports ...
    MeSettingsSerializer,
)
```

- [ ] **Step 2.5: Register route**

Modify `services/api/apps/identity/urls.py` — after `path("me", views.me),` (line 20), add:

```python
    path("me/settings", views.me_settings),
```

- [ ] **Step 2.6: Run tests to verify GET passes**

```bash
docker compose run --rm api pytest services/api/tests/test_user_use_native_home.py -q
```

Expected: 4 passed (2 model + 2 GET).

- [ ] **Step 2.7: Commit**

```bash
git add services/api/apps/identity/serializers.py services/api/apps/identity/views.py services/api/apps/identity/urls.py services/api/tests/test_user_use_native_home.py
git commit -m "feat(identity): add GET /v1/me/settings endpoint"
```

---

## Task 3: PATCH endpoint behaviour (TDD)

**Files:**
- Test: `services/api/tests/test_user_use_native_home.py` (append)

(Implementation already done in Task 2.4 — we just need to verify with explicit PATCH tests.)

- [ ] **Step 3.1: Append PATCH tests**

Append to `services/api/tests/test_user_use_native_home.py`:

```python
@pytest.mark.django_db
def test_me_settings_patch_sets_true():
    user = User.objects.create_user(email="p1@example.com", password="pw12345!", name="P1")
    client = _auth_client(user)
    resp = client.patch("/v1/me/settings", data={"use_native_home": True}, format="json")
    assert resp.status_code == 200
    assert resp.json() == {"data": {"use_native_home": True}}
    user.refresh_from_db()
    assert user.use_native_home is True


@pytest.mark.django_db
def test_me_settings_patch_sets_false():
    user = User.objects.create_user(email="p2@example.com", password="pw12345!", name="P2", use_native_home=True)
    client = _auth_client(user)
    resp = client.patch("/v1/me/settings", data={"use_native_home": False}, format="json")
    assert resp.status_code == 200
    user.refresh_from_db()
    assert user.use_native_home is False


@pytest.mark.django_db
def test_me_settings_patch_rejects_invalid_type():
    user = User.objects.create_user(email="p3@example.com", password="pw12345!", name="P3")
    client = _auth_client(user)
    resp = client.patch("/v1/me/settings", data={"use_native_home": "not-a-bool"}, format="json")
    assert resp.status_code == 400


@pytest.mark.django_db
def test_me_settings_patch_requires_auth():
    client = APIClient()
    resp = client.patch("/v1/me/settings", data={"use_native_home": True}, format="json")
    assert resp.status_code == 401
```

- [ ] **Step 3.2: Run tests to verify all pass**

```bash
docker compose run --rm api pytest services/api/tests/test_user_use_native_home.py -q
```

Expected: 8 passed (2 model + 2 GET + 4 PATCH).

- [ ] **Step 3.3: Commit**

```bash
git add services/api/tests/test_user_use_native_home.py
git commit -m "test(identity): cover PATCH /v1/me/settings cases"
```

---

## Task 4: set_user_setting management command (TDD)

**Files:**
- Create: `services/api/apps/identity/management/__init__.py`
- Create: `services/api/apps/identity/management/commands/__init__.py`
- Create: `services/api/apps/identity/management/commands/set_user_setting.py`
- Test: `services/api/tests/test_user_use_native_home.py` (append)

- [ ] **Step 4.1: Append failing test (single user)**

Append to `services/api/tests/test_user_use_native_home.py`:

```python
from io import StringIO
from django.core.management import call_command


@pytest.mark.django_db
def test_set_user_setting_command_single_user():
    user = User.objects.create_user(email="cmd1@example.com", password="pw12345!", name="CMD1")
    out = StringIO()
    call_command(
        "set_user_setting",
        "--user-id", str(user.id),
        "--key", "use_native_home",
        "--value", "true",
        stdout=out,
    )
    user.refresh_from_db()
    assert user.use_native_home is True
    assert "1 user" in out.getvalue()


@pytest.mark.django_db
def test_set_user_setting_command_bulk():
    User.objects.create_user(email="b1@example.com", password="pw12345!", name="B1")
    User.objects.create_user(email="b2@example.com", password="pw12345!", name="B2")
    out = StringIO()
    call_command(
        "set_user_setting",
        "--bulk",
        "--key", "use_native_home",
        "--value", "true",
        stdout=out,
    )
    assert User.objects.filter(use_native_home=True).count() == 2
    assert "2 user" in out.getvalue()


@pytest.mark.django_db
def test_set_user_setting_command_rejects_unknown_key():
    user = User.objects.create_user(email="cmd2@example.com", password="pw12345!", name="CMD2")
    with pytest.raises(Exception) as exc:
        call_command(
            "set_user_setting",
            "--user-id", str(user.id),
            "--key", "no_such_setting",
            "--value", "true",
        )
    assert "Unknown key" in str(exc.value) or "unknown" in str(exc.value).lower()
```

- [ ] **Step 4.2: Run tests to verify they fail**

```bash
docker compose run --rm api pytest services/api/tests/test_user_use_native_home.py -q
```

Expected: 3 new tests FAIL with `CommandError: Unknown command: 'set_user_setting'`.

- [ ] **Step 4.3: Create empty package files**

```bash
mkdir -p services/api/apps/identity/management/commands
touch services/api/apps/identity/management/__init__.py
touch services/api/apps/identity/management/commands/__init__.py
```

(Use `New-Item` on Windows PowerShell or `touch` in WSL/git bash. Files must be empty Python packages.)

- [ ] **Step 4.4: Create the command**

Create `services/api/apps/identity/management/commands/set_user_setting.py`:

```python
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
```

- [ ] **Step 4.5: Run tests to verify they pass**

```bash
docker compose run --rm api pytest services/api/tests/test_user_use_native_home.py -q
```

Expected: 11 passed (2 model + 2 GET + 4 PATCH + 3 command).

- [ ] **Step 4.6: Commit**

```bash
git add services/api/apps/identity/management services/api/tests/test_user_use_native_home.py
git commit -m "feat(identity): add set_user_setting management command (PoC rollout)"
```

---

## Task 5: scripts/codegen/flutter-tokens.cjs (no-op skeleton)

**Files:**
- Create: `scripts/codegen/flutter-tokens.cjs`

- [ ] **Step 5.1: Create the skeleton**

Create `scripts/codegen/flutter-tokens.cjs`:

```js
#!/usr/bin/env node
/**
 * flutter-tokens.cjs
 * ------------------
 * NO-OP skeleton (Plan-A). The real implementation lives in Plan-B (W2):
 * reads `apps/web/src/shared/styles/tokens.css`, parses CSS custom
 * properties, and writes `apps/mobile/lib/theme/tokens.g.dart`.
 *
 * For now: exits 0 with a marker log so `make codegen-check` succeeds and
 * Plan-B PRs surface the change to this file as the real codegen.
 *
 * Spec: docs/superpowers/specs/2026-05-13-home-native-poc-design.md §5
 */

const path = require("path");

function main() {
  const root = path.resolve(__dirname, "..", "..");
  process.stdout.write(`[flutter-tokens] noop skeleton (root=${root})\n`);
  process.exit(0);
}

main();
```

- [ ] **Step 5.2: Verify it runs**

```bash
node scripts/codegen/flutter-tokens.cjs
```

Expected stdout: `[flutter-tokens] noop skeleton (root=/.../work-manager)` and exit 0.

- [ ] **Step 5.3: Commit**

```bash
git add scripts/codegen/flutter-tokens.cjs
git commit -m "chore(codegen): flutter-tokens.cjs no-op skeleton (Plan-A)"
```

---

## Task 6: scripts/codegen/flutter-api.cjs (no-op skeleton)

**Files:**
- Create: `scripts/codegen/flutter-api.cjs`

- [ ] **Step 6.1: Create the skeleton**

Create `scripts/codegen/flutter-api.cjs`:

```js
#!/usr/bin/env node
/**
 * flutter-api.cjs
 * ---------------
 * NO-OP skeleton (Plan-A). Real impl in Plan-B (W3): wraps
 * `openapi-generator-cli generate -g dart-dio -i <openapi.yaml> -o apps/mobile/lib/api/openapi/`.
 *
 * Spec: docs/superpowers/specs/2026-05-13-home-native-poc-design.md §5
 */

function main() {
  process.stdout.write("[flutter-api] noop skeleton\n");
  process.exit(0);
}

main();
```

- [ ] **Step 6.2: Verify**

```bash
node scripts/codegen/flutter-api.cjs
```

Expected: `[flutter-api] noop skeleton` and exit 0.

- [ ] **Step 6.3: Commit**

```bash
git add scripts/codegen/flutter-api.cjs
git commit -m "chore(codegen): flutter-api.cjs no-op skeleton (Plan-A)"
```

---

## Task 7: scripts/codegen/flutter-i18n.cjs (no-op skeleton)

**Files:**
- Create: `scripts/codegen/flutter-i18n.cjs`

- [ ] **Step 7.1: Create the skeleton**

Create `scripts/codegen/flutter-i18n.cjs`:

```js
#!/usr/bin/env node
/**
 * flutter-i18n.cjs
 * ----------------
 * NO-OP skeleton (Plan-A). Real impl in Plan-B (W4): reads
 * `apps/web/src/shared/i18n/locales/{ko,en}.json` and writes
 * `apps/mobile/lib/l10n/app_{ko,en}.arb`.
 *
 * Spec: docs/superpowers/specs/2026-05-13-home-native-poc-design.md §5
 */

function main() {
  process.stdout.write("[flutter-i18n] noop skeleton\n");
  process.exit(0);
}

main();
```

- [ ] **Step 7.2: Verify**

```bash
node scripts/codegen/flutter-i18n.cjs
```

Expected: `[flutter-i18n] noop skeleton` and exit 0.

- [ ] **Step 7.3: Commit**

```bash
git add scripts/codegen/flutter-i18n.cjs
git commit -m "chore(codegen): flutter-i18n.cjs no-op skeleton (Plan-A)"
```

---

## Task 8: codegen-check.sh + Makefile targets

**Files:**
- Create: `scripts/codegen-check.sh`
- Modify: `Makefile`

- [ ] **Step 8.1: Create the drift checker**

Create `scripts/codegen-check.sh`:

```bash
#!/usr/bin/env bash
# codegen-check.sh — run all three codegen scripts and fail if git tree drifted.
# Used by `make codegen-check` and CI. Plan-A skeletons are no-ops so this
# always passes; Plan-B onwards this is a real drift gate.
#
# Spec: docs/superpowers/specs/2026-05-13-home-native-poc-design.md §8.4
set -euo pipefail

cd "$(dirname "$0")/.."

node scripts/codegen/flutter-tokens.cjs
node scripts/codegen/flutter-api.cjs
node scripts/codegen/flutter-i18n.cjs

if ! git diff --quiet --exit-code -- apps/mobile/lib; then
  echo "::error::codegen drift detected in apps/mobile/lib — re-run \`make codegen\` and commit." >&2
  git --no-pager diff --stat -- apps/mobile/lib >&2
  exit 1
fi

echo "[codegen-check] no drift."
```

Make it executable (LF endings per CLAUDE.md §9):

```bash
git add scripts/codegen-check.sh
git update-index --chmod=+x scripts/codegen-check.sh
```

- [ ] **Step 8.2: Add Makefile targets**

Append to `Makefile` (preserve existing tab indentation — Makefile recipes must start with a literal TAB):

```makefile
.PHONY: codegen codegen-check

codegen:
	node scripts/codegen/flutter-tokens.cjs
	node scripts/codegen/flutter-api.cjs
	node scripts/codegen/flutter-i18n.cjs

codegen-check:
	bash scripts/codegen-check.sh
```

- [ ] **Step 8.3: Verify both targets**

```bash
make codegen
make codegen-check
```

Expected: each prints the no-op skeleton lines and exits 0. `codegen-check` ends with `[codegen-check] no drift.`.

- [ ] **Step 8.4: Commit**

```bash
git add scripts/codegen-check.sh Makefile
git commit -m "chore(ci): codegen-check.sh + make codegen / codegen-check (drift gate skeleton)"
```

---

## Task 9: Web OpenAPI types regen (drift gate)

**Files:**
- Modify (auto): `apps/web/src/shared/api/openapi-types.ts`

Background: `apps/web/scripts/gen-api-types.mjs` fetches the live drf-spectacular schema from `http://api:4455/v1/schema/?format=json` (no on-disk schema file in this repo) and writes the TS file. So we only need the API service running.

- [ ] **Step 9.1: Boot the API**

```bash
docker compose up -d api
docker compose logs --tail=30 api  # ensure no startup errors
```

Verify schema endpoint:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4455/v1/schema/?format=json
```

Expected: `200`.

- [ ] **Step 9.2: Regenerate TS types**

```bash
cd apps/web && npm run types:gen && cd ../..
```

Expected stdout: `wrote /.../apps/web/src/shared/api/openapi-types.ts (XXXXX bytes)`.

- [ ] **Step 9.3: Verify the new operations appear**

```bash
grep -n "me/settings" apps/web/src/shared/api/openapi-types.ts | head -5
```

Expected: at least one line matching `"/v1/me/settings"` with a GET / PATCH operation entry.

- [ ] **Step 9.4: Run the drift-check script (CI parity)**

```bash
cd apps/web && npm run types:check && cd ../..
```

Expected: silent success (`diff -q` finds no difference between the regenerated tmp file and the committed `openapi-types.ts`).

- [ ] **Step 9.5: Commit**

```bash
git add apps/web/src/shared/api/openapi-types.ts
git commit -m "chore(api): regenerate web OpenAPI types for me/settings"
```

---

## Task 10: Integration smoke (curl)

**Files:** none (manual smoke)

- [ ] **Step 10.1: Boot the stack**

```bash
make up
```

Wait until `wm-api` is healthy (`docker compose logs api | grep "Listening on"` shows daphne up).

- [ ] **Step 10.2: Acquire a JWT**

```bash
curl -s -X POST http://localhost:4455/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"emp1@demo.local","password":"demo1234!"}' | tee /tmp/login.json
TOKEN=$(node -e "console.log(JSON.parse(require('fs').readFileSync('/tmp/login.json','utf8')).data.access)")
echo "$TOKEN" | head -c 32
```

(`emp1@demo.local` exists from `seed_demo` — if seed missing, run `make seed` first.)

- [ ] **Step 10.3: GET smoke**

```bash
curl -s -w "\n%{http_code}\n" http://localhost:4455/v1/me/settings -H "Authorization: Bearer $TOKEN"
```

Expected output:
```
{"data":{"use_native_home":false}}
200
```

- [ ] **Step 10.4: PATCH smoke**

```bash
curl -s -w "\n%{http_code}\n" -X PATCH http://localhost:4455/v1/me/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"use_native_home":true}'
```

Expected:
```
{"data":{"use_native_home":true}}
200
```

- [ ] **Step 10.5: Unauthorized smoke**

```bash
curl -s -w "\n%{http_code}\n" http://localhost:4455/v1/me/settings
```

Expected: `401`.

- [ ] **Step 10.6: Reset state**

```bash
curl -s -X PATCH http://localhost:4455/v1/me/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"use_native_home":false}'
```

(Brings demo user back to default so subsequent dev sessions are clean.)

---

## Task 11: PR prep — backlog update + spec update

**Files:**
- Modify: `docs/tasks/backlog.md`
- Modify: `docs/superpowers/specs/2026-05-13-home-native-poc-design.md`

- [ ] **Step 11.1: Activate B-NAT-01 in backlog**

In `docs/tasks/backlog.md`, after `B-CODE-09`, add a new section:

```markdown
### B-NAT-01 · Home Native PoC W1 — BE 셋업 + Codegen 골격 ✅ 완료 (2026-05-XX, `<commit-sha>`)

- **우선순위**: P1
- **갭 출처**: docs/superpowers/specs/2026-05-13-home-native-poc-design.md §3 In scope (W1)
- **목적**: ADR-007 Phase A 사전 PoC 의 BE 토글 인프라 + Codegen 골격.

(자세한 acceptance criteria 는 spec §5 + Plan-A 참조. 후속: B-NAT-02 (Plan-B W2-3 codegen 본 구현), B-NAT-03 (Plan-C W4-5 Flutter Home), B-NAT-04 (Plan-D W6-8 Tests + Beta).)
```

- [ ] **Step 11.2: Stamp the spec with W1 status**

In `docs/superpowers/specs/2026-05-13-home-native-poc-design.md` §17 (변경 이력), add a row:

```markdown
| 2026-05-XX | @sungjun + Claude | W1 BE 셋업 + Codegen 골격 완료 (Plan-A) |
```

- [ ] **Step 11.3: Final commit**

```bash
git add docs/tasks/backlog.md docs/superpowers/specs/2026-05-13-home-native-poc-design.md
git commit -m "docs(backlog,spec): mark B-NAT-01 W1 complete"
```

- [ ] **Step 11.4: Push + open PR**

```bash
git push -u origin task/sdd-baseline-impl
gh pr create --title "feat(nat-01): Home Native PoC W1 — BE 셋업 + codegen 골격" --body "$(cat <<'EOF'
## Summary
- `User.use_native_home` BooleanField (default false) + migration
- `GET / PATCH /v1/me/settings` endpoint (function-based, JWT-protected)
- `set_user_setting` management command (--user-id / --bulk, rollout/rollback 운영용)
- Codegen 3종 (flutter-tokens / flutter-api / flutter-i18n) no-op 골격 + Makefile + drift checker
- OpenAPI schema + web TS types regen (drift 검증)

## Spec / ADR
- spec: `docs/superpowers/specs/2026-05-13-home-native-poc-design.md`
- ADR: `docs/adr/ADR-007-native-mobile-shift.md`
- plan: `docs/superpowers/plans/2026-05-13-home-native-poc-w1-be-setup.md`

## Test plan
- [ ] `make test-be` (identity 11 new tests pass)
- [ ] `make codegen-check` (no drift, no-op exits 0)
- [ ] Manual smoke: GET/PATCH /v1/me/settings 200, unauthenticated 401
- [ ] OpenAPI types drift gate green (`apps/web/src/shared/api/openapi-types.ts` regenerated cleanly)

## Next plan
- Plan-B (W2-3): tokens + OpenAPI Dart + i18n codegen 본 구현
EOF
)"
```

---

## Self-Review

**Spec coverage (Plan-A scope only — W1 in spec §10):**
- ✅ `User.use_native_home` column → Task 1
- ✅ `GET /v1/me/settings` → Task 2
- ✅ `PATCH /v1/me/settings` → Task 3
- ✅ `set_user_setting` command → Task 4
- ✅ Codegen 3종 골격 → Tasks 5, 6, 7
- ✅ Drift gate skeleton → Task 8
- ✅ OpenAPI regen → Task 9
- ✅ Smoke verification → Task 10
- ✅ Backlog + spec stamp + PR → Task 11

**Spec coverage (out of Plan-A — covered by future plans):**
- Plan-B (W2-3): real codegen impls (tokens.g.dart, dart-dio OpenAPI client, ARB files), `wm_theme.dart`, Dio JWT interceptor
- Plan-C (W4-5): `WMHomeScreen` + widgets + WsClient + Sentry mobile + main.dart 분기 + NativeBridge `notifySettingsChanged`
- Plan-D (W6-8): widget/integration/golden tests + Play Internal Testing build + 베타 5인 라이브 + KPI 수집 + Go/No-Go 보고서

**Placeholder scan:** none. Every code step contains complete code. Migration filename intentionally `{auto}` because Django numbers it at `makemigrations` time; the test passes regardless of the number.

**Type consistency:**
- `User.use_native_home` named identically in model / serializer / view / command / tests.
- `MeSettingsSerializer.use_native_home` is `BooleanField` everywhere.
- `ALLOWED_KEYS = {"use_native_home"}` in command matches the model field.
- Error string `"Unknown key"` in command matches the test assertion in Step 4.1.

---

## Out of scope (do NOT do in Plan-A)

- Any Flutter changes (Plan-C)
- Any Sentry mobile SDK changes (Plan-C)
- Any Channels WS work (Plan-C)
- Beta TestFlight / Play Console upload (Plan-D)
- KPI measurement automation (Plan-D)

If a code change you're about to make doesn't appear in the File Structure table at the top — stop, surface it, and ask whether to add a task or defer to a later plan.
