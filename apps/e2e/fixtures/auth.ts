import { request as pwRequest, type APIRequestContext, type BrowserContext, type Page } from "@playwright/test";
import { DEMO_USERS, type DemoUser } from "./users";

/**
 * API base URL for direct calls (login, seed bootstrap).
 * In a docker-internal run this is `http://api:4455`.
 * On the host, it's `http://localhost:4455`.
 */
export const API_URL = process.env.API_URL ?? "http://localhost:4455";

/**
 * Web base URL — used by `loginAs` to navigate the SPA after token injection.
 */
export const BASE_URL = process.env.BASE_URL ?? "http://localhost:4444";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; name: string; locale?: string };
};

/**
 * Storage keys used by the FE (apps/web/src/shared/api/client.ts and
 * apps/web/src/shared/lib/store/useAuthStore.ts). Keep in sync with FE.
 */
const STORAGE_KEY_ACCESS = "wm:access";
const STORAGE_KEY_AUTH_STORE = "wm:auth"; // zustand persisted store

/**
 * Fetch a token pair from the API directly (bypasses the login form).
 * Used by global setup + per-spec context priming.
 *
 * The BE response shape (per services/api/apps/identity/views.py) is
 * snake_case: `{ data: { access_token, refresh_token, user, ... } }`.
 * We normalise to camelCase here so callers see a stable AuthSession.
 */
export async function loginViaApi(
  user: DemoUser = DEMO_USERS.admin,
  api?: APIRequestContext,
): Promise<AuthSession> {
  const ctx = api ?? (await pwRequest.newContext({ baseURL: API_URL }));
  const res = await ctx.post("/v1/auth/login", {
    data: { email: user.email, password: user.password },
    headers: { "content-type": "application/json" },
  });
  if (!res.ok()) {
    const body = await res.text().catch(() => "<no body>");
    if (!api) await ctx.dispose();
    throw new Error(`loginViaApi failed (${res.status()}) for ${user.email}: ${body}`);
  }
  const json = (await res.json()) as {
    data: {
      access_token?: string;
      refresh_token?: string;
      accessToken?: string;
      refreshToken?: string;
      user: AuthSession["user"];
    };
  };
  if (!api) await ctx.dispose();
  const accessToken = json.data.access_token ?? json.data.accessToken;
  const refreshToken = json.data.refresh_token ?? json.data.refreshToken;
  if (!accessToken) {
    throw new Error(
      `loginViaApi: response missing access_token for ${user.email} — got keys [${Object.keys(json.data).join(",")}]`,
    );
  }
  return {
    accessToken,
    refreshToken: refreshToken ?? "",
    user: json.data.user,
  };
}

/**
 * Inject access token into a context's localStorage so the SPA boots authenticated.
 * Writes BOTH:
 *   - `wm:access` — the raw bearer token used by `apps/web/src/shared/api/client.ts`
 *   - `wm:auth`   — the zustand-persist envelope used by `useAuthStore`
 *
 * If the FE switches storage shape, only this helper needs to update.
 */
export async function attachAuthToContext(
  context: BrowserContext,
  session: AuthSession,
): Promise<void> {
  const accessKey = STORAGE_KEY_ACCESS;
  const authStoreKey = STORAGE_KEY_AUTH_STORE;
  const token = session.accessToken;
  await context.addInitScript(
    ([accessK, authK, tok]) => {
      try {
        window.localStorage.setItem(accessK as string, tok as string);
        // Mirror the zustand-persist envelope shape `{ state: { accessToken }, version: 0 }`.
        window.localStorage.setItem(
          authK as string,
          JSON.stringify({ state: { accessToken: tok }, version: 0 }),
        );
      } catch {
        /* storage not yet available — ignored, app will refresh-flow */
      }
    },
    [accessKey, authStoreKey, token] as const,
  );
}

/**
 * Convenience: load login form, fill, submit, wait for /m/home or /onboarding.
 * Use in specs that need to assert UI login flow itself (auth.spec.ts).
 * For all OTHER specs prefer `attachAuthToContext` for speed.
 */
export async function loginViaUi(page: Page, user: DemoUser = DEMO_USERS.admin): Promise<void> {
  await page.goto("/login");
  await page.locator('input[type="email"]').fill(user.email);
  await page.locator('input[type="password"]').fill(user.password);
  await page.getByRole("button", { name: /login|로그인|submit|확인|시작/i }).click();
  await page.waitForURL(/\/(m\/home|onboarding\/)/, { timeout: 10_000 });
}

/**
 * Programmatic login that bypasses the LoginForm entirely.
 *
 *  1. POST /v1/auth/login → token pair.
 *  2. addInitScript to seed `wm:access` + `wm:auth` in localStorage.
 *  3. Navigate to BASE_URL — the SPA boots and reads the persisted token.
 *
 * Use this in every spec EXCEPT auth.spec.ts (which exercises the form itself).
 */
export async function loginAs(page: Page, account: DemoUser): Promise<AuthSession> {
  const session = await loginViaApi(account);
  await attachAuthToContext(page.context(), session);
  await page.goto(BASE_URL, { waitUntil: "load", timeout: 30_000 });
  return session;
}

/**
 * Resolve an EMPLOYEE-role membership email under the given manager session.
 *
 * seed_demo randomizes employee local-parts, so specs cannot hard-code an
 * employee email. We list `/v1/team/status` (which returns active company
 * members with email) and pick the first whose email differs from the
 * manager and matches the demo company convention (@acme.demo).
 *
 * Returns `null` if no other member is visible — the caller should skip.
 */
export async function resolveEmployeeEmail(session: AuthSession): Promise<string | null> {
  const ctx = await pwRequest.newContext({
    baseURL: API_URL,
    extraHTTPHeaders: { authorization: `Bearer ${session.accessToken}` },
  });
  try {
    // /v1/team/status (alias for /v1/team/status/grid) currently 500s due to a
    // BE bug in status_root (calls status_grid with a wrapped Request). Use
    // /v1/team/status/grid directly which is the underlying handler.
    const res = await ctx.get("/v1/team/status/grid");
    if (!res.ok()) return null;
    const body = (await res.json()) as { data?: { items?: Array<{ email?: string }> } };
    const items = body.data?.items ?? [];
    const me = session.user.email;
    // Prefer non-manager, non-admin, non-owner accounts. The seed_demo employee
    // emails are `<name>-<rand>@acme.demo`; admins/managers use fixed prefixes.
    const isStaffPrefix = (e: string): boolean =>
      /^(owner|admin|manager\d?)@/.test(e);
    const employees = items.filter(
      (m) => m.email && m.email !== me && m.email.endsWith("@acme.demo") && !isStaffPrefix(m.email),
    );
    if (employees.length > 0) return employees[0].email!;
    // Fallback: any other email
    const found = items.find((m) => m.email && m.email !== me);
    return found?.email ?? null;
  } finally {
    await ctx.dispose();
  }
}
