import { request as pwRequest, type FullConfig } from "@playwright/test";
import { resolve } from "node:path";
import { ensureDemoSeeded } from "./fixtures/seed";
import { loginViaApi, API_URL } from "./fixtures/auth";
import { DEMO_USERS } from "./fixtures/users";

/**
 * Runs once before all specs.
 *
 *  1. Wait for the API to be reachable (health probe).
 *  2. Ensure the demo company is seeded — `docker compose run --rm seed`,
 *     unless E2E_SKIP_SEED=1 (CI runs the seed in a previous step).
 *  3. Pre-fetch an admin token so specs can short-circuit login.
 *     Stashed on `process.env.E2E_ADMIN_TOKEN` for spec consumption.
 */
export default async function globalSetup(_config: FullConfig): Promise<void> {
  // Repo root = three dirs up from this file (apps/e2e/global-setup.ts).
  const repoRoot = resolve(__dirname, "..", "..");

  await waitForApi();
  await ensureDemoSeeded(repoRoot);

  const session = await loginViaApi(DEMO_USERS.admin);
  process.env.E2E_ADMIN_TOKEN = session.accessToken;
  process.env.E2E_ADMIN_REFRESH = session.refreshToken;
  // eslint-disable-next-line no-console
  console.log(`[e2e:setup] admin token cached for ${session.user.email}`);
}

async function waitForApi(maxMs = 60_000): Promise<void> {
  const ctx = await pwRequest.newContext({ baseURL: API_URL });
  const start = Date.now();
  let lastErr: unknown = null;
  while (Date.now() - start < maxMs) {
    try {
      const res = await ctx.get("/v1/health", { timeout: 2_500 });
      if (res.ok()) {
        await ctx.dispose();
        return;
      }
      lastErr = `HTTP ${res.status()}`;
    } catch (e) {
      lastErr = e;
    }
    await new Promise((r) => setTimeout(r, 1_500));
  }
  await ctx.dispose();
  throw new Error(`[e2e:setup] API at ${API_URL}/v1/health did not become ready: ${String(lastErr)}`);
}
