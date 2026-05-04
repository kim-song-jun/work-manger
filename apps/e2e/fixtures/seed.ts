import { request as pwRequest } from "@playwright/test";
import { execSync } from "node:child_process";
import { API_URL } from "./auth";
import { DEMO_USERS } from "./users";

/**
 * Ensure the demo "Acme" company exists and a known admin can log in.
 *
 * Strategy (in order):
 *   1. Probe: try POST /v1/auth/login with admin@acme.demo. If 200, we're done.
 *   2. Otherwise: invoke the seed runner.
 *      - If E2E_SKIP_SEED=1 (CI sets this; CI runs `docker compose run --rm seed`
 *        as a separate step to keep the e2e container small), throw — operator
 *        misconfig.
 *      - Else attempt `docker compose run --rm seed` from the repo root.
 *
 * Idempotent: seed_demo wipes/re-seeds the demo company on each run, so calling
 * this multiple times is safe but slow.
 */
export async function ensureDemoSeeded(repoRoot: string): Promise<void> {
  const ok = await canLogin();
  if (ok) {
    // eslint-disable-next-line no-console
    console.log("[e2e:seed] demo company already present — skipping seed");
    return;
  }
  if (process.env.E2E_SKIP_SEED === "1") {
    throw new Error(
      "[e2e:seed] cannot login as admin@acme.demo and E2E_SKIP_SEED=1 — " +
        "CI was supposed to run `docker compose run --rm seed` before this job",
    );
  }
  // eslint-disable-next-line no-console
  console.log("[e2e:seed] running `docker compose run --rm seed` in", repoRoot);
  execSync("docker compose run --rm seed", {
    cwd: repoRoot,
    stdio: "inherit",
  });
  const reok = await canLogin();
  if (!reok) {
    throw new Error("[e2e:seed] seed completed but admin@acme.demo still cannot log in");
  }
}

async function canLogin(): Promise<boolean> {
  try {
    const ctx = await pwRequest.newContext({ baseURL: API_URL });
    const res = await ctx.post("/v1/auth/login", {
      data: { email: DEMO_USERS.admin.email, password: DEMO_USERS.admin.password },
      headers: { "content-type": "application/json" },
      timeout: 5_000,
    });
    await ctx.dispose();
    return res.ok();
  } catch {
    return false;
  }
}
