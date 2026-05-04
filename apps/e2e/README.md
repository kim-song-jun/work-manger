# work-manager · Playwright E2E Suite

End-to-end specs for the work-manager monorepo. Specs run against the real
docker-compose stack (api / ws / web / db / redis / worker / beat).

For CI invocations and local debugging see [`docs/operations/ci-cd.md` §1.4](../../docs/operations/ci-cd.md#14-e2e-playwright).
For test header / docstring conventions see [`docs/guidelines/testing-standards.md`](../../docs/guidelines/testing-standards.md).

## Layout

```
apps/e2e/
├── specs/
│   ├── auth.spec.ts          # login routing (member → /m/home, etc.)
│   ├── clock-in.spec.ts      # slide-to-clock-in golden path
│   ├── leave-apply.spec.ts   # @employee — apply 2-day leave
│   ├── inbox-approve.spec.ts # @manager   — approve first PENDING
│   └── realtime.spec.ts      # @manager   — WS push within 2s
├── fixtures/
│   ├── auth.ts    # loginViaApi · attachAuthToContext · loginAs · resolveEmployeeEmail
│   ├── seed.ts    # ensureDemoSeeded — runs `docker compose run --rm seed`
│   └── users.ts   # DEMO_USERS (owner / admin / manager / employee)
├── global-setup.ts
└── playwright.config.ts
```

## Tags

Specs use `@manager` and `@employee` tags in the `describe` title for
filtering (e.g. `npx playwright test --grep @employee`).

## Running

Host:

```bash
cd apps/e2e
npm install --no-audit --no-fund
npx playwright install chromium  # once
npm test                          # full suite, BASE_URL=http://localhost:4444
npx playwright test specs/auth.spec.ts --project=chromium
```

Container (CI parity):

```bash
docker compose --profile seed run --rm seed
docker compose --profile e2e run --rm e2e
```

Override retries (default 0 locally, 2 in CI):

```bash
WM_E2E_RETRIES=2 npx playwright test
```

## FE testids

Per project convention, e2e selectors prefer roles + accessible names. Where
a stable role-based selector is not available, the FE exposes a small set of
`data-testid` attributes consumed by these specs. Adding a new testid
requires updating both the FE component AND this list.

| testid           | Owner component                                                        | Used by                                       |
|------------------|------------------------------------------------------------------------|-----------------------------------------------|
| `inbox-item`     | `apps/web/src/pages/m-inbox/index.tsx` — wrapping div per inbox card    | `inbox-approve.spec.ts`, `realtime.spec.ts`   |
| `inbox-approve`  | `apps/web/src/features/inbox-decide/ui/InboxQuickActions.tsx` — Button  | `inbox-approve.spec.ts`                       |

(Other testids predate this suite — see `docs/guidelines/testing-standards.md`
and `apps/web/src/pages/web-inbox/index.tsx` for `inbox-row-*` etc.)
