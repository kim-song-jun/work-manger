# E2E and UI/UX Audit

Last verified: 2026-05-05 KST

This audit is the canonical Docker-first verification plan for the current
Work Manager web app and Flutter WebView shell. It maps user-facing scenarios
to executable Playwright specs, console/network smoke checks, and UI/UX design
evidence.

## Scope

The product architecture is a React SPA served to browser and Flutter WebView
clients. Therefore the verification stack is:

1. Docker Compose runtime: `db`, `redis`, `api`, `ws`, `web`.
2. Playwright E2E against `http://localhost:4444` through the Docker e2e
   proxy, preserving localhost secure-context behavior.
3. Flutter WebView shell tests in the Docker `mobile-test` service.
4. UI/UX comparison against `docs/design/design-system.md` and
   `docs/specs/screen-catalog.md`.

Host-only execution is not accepted as the release gate.

## Scenario Matrix

| ID | Flow | Automated artifact | User scenario | Primary assertions |
|---|---|---|---|---|
| E2E-AUTH-01 | Member login | `apps/e2e/specs/auth.spec.ts` | Existing member logs in from `/login`. | Login form posts credentials, token is stored, user lands on `/m/home` within SLO. |
| E2E-AUTH-02 | Non-member login | `apps/e2e/specs/auth.spec.ts` | Superuser without a membership logs in. | User lands in `/onboarding/*`, not member home. |
| E2E-AUTH-03 | Invalid login | `apps/e2e/specs/auth.spec.ts` | Invalid credentials are submitted. | User remains on `/login`; auth error state is shown. |
| E2E-ONB-01 | New-user onboarding | `apps/e2e/specs/onboarding.spec.ts` | New user signs up, logs in, joins Acme with `ACMEDM`, saves profile, and reaches home. | `POST /v1/onboarding/join-company` returns `201`; `PATCH /v1/onboarding/profile` returns `200`; final URL is `/m/home`. |
| E2E-ATT-01 | Clock-in | `apps/e2e/specs/clock-in.spec.ts` | Employee drags the clock-in slider. | Attendance POST succeeds, toast/status changes to working state. |
| E2E-LEAVE-01 | Leave application | `apps/e2e/specs/leave-apply.spec.ts` | Employee submits two-day full leave. | Request succeeds and user reaches success screen. |
| E2E-INBOX-01 | Manager approval | `apps/e2e/specs/inbox-approve.spec.ts` | Manager approves first pending leave task. | Approval POST succeeds within SLO; inbox updates. |
| E2E-RT-01 | Realtime inbox | `apps/e2e/specs/realtime.spec.ts` | Manager sees new overtime request through WebSocket-driven refresh. | Inbox row count increases within 2 seconds in desktop and mobile projects. |
| E2E-PAGES-01 | Full route inventory | `apps/e2e/specs/all-pages.spec.ts` | Public, onboarding, mobile, desktop web, and admin routes are opened in real browsers. | Every route renders nonblank content with no `/v1/*` 4xx/5xx, WebSocket failure, favicon error, horizontal overflow, or sub-24px interactive target. |
| E2E-PERM-01 | Private route permissions | `apps/e2e/specs/all-pages.spec.ts` | Anonymous, non-member, manager, and admin users access protected routes. | Anonymous users redirect to `/login`; non-members to onboarding; managers away from `/admin`; admins remain in admin. |
| SMOKE-CONSOLE-01 | Member console/network | `apps/e2e/scripts/console-smoke.mjs` | Member login then team page. | No `ERR_NAME_NOT_RESOLVED`, WebSocket failure, favicon 404, or `/v1/*` HTTP 4xx/5xx. |
| SMOKE-CONSOLE-02 | Onboarding console/network | `apps/e2e/scripts/onboarding-console-smoke.mjs` | Fresh signup through company code and profile. | No console/network failure; onboarding API calls are real and successful. |
| SMOKE-DESIGN-01 | Entry/onboarding visual check | `apps/e2e/scripts/design-smoke.mjs` | Login, signup, onboarding welcome, company-code screens on mobile viewport. | Shell width, feature card count, code input dimensions, screenshots match design-system constraints. |
| MOBILE-UNIT-01 | Flutter WebView shell support | `docker compose --profile test run --rm mobile-test` | Native bridge, widget payload, ntfy parsing, geofence payload. | Flutter tests pass; WebView bridge payload contracts remain stable. |

## UI/UX Design Comparison

Design source of truth:

- `docs/design/design-system.md`: Toss-style quiet utility, brand blue,
  neutral surfaces, 8px spacing system, restrained shadows, accessible focus.
- `docs/specs/screen-catalog.md`: auth and onboarding are MVP screens;
  onboarding flow includes welcome, company code, profile, location, schedule,
  notifications, widget, done.

Generated evidence from `apps/e2e/scripts/design-smoke.mjs`:

| Screen | Artifact | Measured evidence | Assessment |
|---|---|---|---|
| Login | `apps/e2e/test-results/design-smoke/login-mobile.png` | `390x844` viewport, shell width `390`, grey-50 background, W brand tile, email/password fields. | Pass. Matches mobile WebView shell and brand-first auth layout. |
| Signup | `apps/e2e/test-results/design-smoke/signup-mobile.png` | `390x844` viewport, shell width `390`, three inputs, password hint. | Pass. Mirrors login structure without layout drift. |
| Onboarding welcome | `apps/e2e/test-results/design-smoke/onboarding-welcome-mobile.png` | Three feature cards, brand icon, bottom primary CTA. | Pass. Matches screen catalog and design-system spacing/clarity. |
| Company code | `apps/e2e/test-results/design-smoke/onboarding-company-code-mobile.png` | Six code inputs, each `44x56`, progress indicator, disabled CTA before completion. | Pass. Functional affordance and target sizing are stable. |

Full-page screenshot evidence from `apps/e2e/specs/all-pages.spec.ts` is
written under `apps/e2e/test-results/all-pages/{chromium,mobile-chrome}/` for
public, onboarding, mobile, desktop web, and admin routes.

Manual screenshot review on 2026-05-05 found no overlapping text, clipped
buttons, broken colors, missing primary actions, or visible network error UI
on these entry/onboarding screens.

## Docker Verification Commands

Backend integration:

```bash
docker compose --profile test run --rm --build api-test
```

Observed result: `238 passed`, `5 warnings`.

Frontend unit/type/build:

```bash
docker compose --profile test run --rm --build web-test
```

Observed result: typecheck passed, `63` test files passed, `239` tests passed,
Vite production build passed.

Full E2E:

```bash
docker compose --profile e2e run --rm e2e
```

Observed result: `20 passed` across `chromium` and `mobile-chrome`, including
the full route inventory and permission gate.

Console and design smoke:

```bash
docker compose --profile e2e run --rm e2e bash -lc '
set -euo pipefail
export BASE_URL="${BASE_URL:-http://localhost:4444}"
npm ci --no-audit --no-fund >/dev/null
node scripts/local-web-proxy.mjs >/tmp/wm-local-web-proxy.log 2>&1 &
proxy_pid="$!"
trap '"'"'kill "$proxy_pid" 2>/dev/null || true'"'"' EXIT
node scripts/wait-url.mjs "$BASE_URL/login"
node scripts/console-smoke.mjs
node scripts/onboarding-console-smoke.mjs
node scripts/design-smoke.mjs
'
```

Observed result: both console smoke scripts reported `failureCount: 0`;
design smoke reported `ok: true` and wrote four PNG artifacts.

Flutter WebView shell:

```bash
docker compose --profile test run --rm mobile-test
```

Observed result: `15` Flutter tests passed.

## Cleanup Already Applied

- Removed the old onboarding frontend stub behavior that allowed `404` to
  proceed.
- Replaced `/v1/onboarding/company-code` with the real
  `/v1/onboarding/join-company` contract.
- Replaced `POST /v1/onboarding/profile` with `PATCH /v1/onboarding/profile`.
- Added profile persistence for department, position, and employee number.
- Added reusable demo join code `ACMEDM` to seed data.
- Centralized inbox WebSocket ownership in the app provider and gated it by
  real membership state.
- Added auth bootstrap from `/v1/me` so reloads and E2E token fixtures still
  populate membership before realtime subscriptions open.
- Removed a dead localStorage token fallback from `useTeamStream`.
- Hardened smoke scripts so first Vite render waits for real inputs, not only
  HTTP `200`.
- Replaced the forgot-password placeholder endpoint with the real
  `/v1/auth/password/forgot` contract.
- Removed fake success fallbacks from leave and overtime submission APIs.
- Removed the admin employee-list `404` empty-state fallback now that
  `/v1/admin/employees` is a real backend contract.
- Aligned overtime settings/history with the backend contract:
  `PATCH /v1/overtime/settings`, backend field mapping, and monthly history
  unwrapping.
- Updated leave E2E to use the real backend request without route rewriting and
  assert the `201` response from `/v1/leave/requests`.
- Added route guards for `/m`, `/web`, and `/admin` so anonymous, non-member,
  member, and admin permissions are enforced before shells render.
- Removed the admin compliance bulk-message UI that had no backend contract.
- Added admin per-employee leave balance support and wired expiring-leave to
  real `/v1/leave/balance?employee_id=...` responses.
- Normalized backend response shapes for team status, attendance records, and
  admin employee detail so desktop routes do not blank on real API data.
- Increased interactive target sizes on auth/onboarding helper links, calendar
  controls, notice/customize actions, admin checkboxes, and small admin links.
- Added `all-pages.spec.ts` as the route inventory, permission, console/API,
  overflow, and hit-target gate with screenshots for every route.

## Acceptance Gate

This area is green only when all of the following are true:

- API tests pass in Docker.
- Web typecheck, unit tests, and build pass in Docker.
- Full Playwright E2E passes in Docker.
- Console/network smoke shows zero failures.
- Design smoke creates current screenshots and all measured checks pass.
- Flutter WebView shell tests pass in Docker.
