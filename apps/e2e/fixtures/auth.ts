import { request as pwRequest, type APIRequestContext, type BrowserContext, type Page } from "@playwright/test";
import { DEMO_USERS, type DemoUser } from "./users";

/**
 * API base URL for direct calls (login, seed bootstrap).
 * In a docker-internal run this is `http://api:4455`.
 * On the host, it's `http://localhost:4455`.
 */
export const API_URL = process.env.API_URL ?? "http://localhost:4455";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; name: string; locale?: string };
};

/**
 * Fetch a token pair from the API directly (bypasses the login form).
 * Used by global setup + per-spec context priming.
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
    throw new Error(`loginViaApi failed (${res.status()}) for ${user.email}: ${body}`);
  }
  const json = (await res.json()) as { data: AuthSession };
  if (!api) await ctx.dispose();
  return json.data;
}

/**
 * Inject access token into a context's localStorage so the SPA boots authenticated.
 * The web app stores tokens under `wm.access_token` (see apps/web/src/shared/api).
 * If the FE switches storage keys, only this helper needs to update.
 */
export async function attachAuthToContext(
  context: BrowserContext,
  session: AuthSession,
): Promise<void> {
  await context.addInitScript(([token, refresh, user]) => {
    try {
      window.localStorage.setItem("wm.access_token", token as string);
      window.localStorage.setItem("wm.refresh_token", refresh as string);
      window.localStorage.setItem("wm.user", JSON.stringify(user));
    } catch {
      /* storage not yet available — ignored, app will refresh-flow */
    }
  }, [session.accessToken, session.refreshToken, session.user] as const);
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
