import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for work-manager e2e suite.
 *
 * Targets:
 *   - host run:      BASE_URL defaults to http://localhost:4444
 *   - container run: BASE_URL=http://web:4444 (set in docker-compose `e2e` service)
 *
 * Workers are forced to 1 in CI so that the seeded demo company stays
 * deterministic across specs (single shared Postgres state).
 */
const isCI = !!process.env.CI;

/**
 * Retry policy. Locally (CI=undefined) we want 0 retries — flake should be
 * loud and immediate during development. CI tolerates `WM_E2E_RETRIES` (set
 * by .github/workflows/ci.yml, default 2) so transient docker/network jitter
 * doesn't bounce a green PR.
 */
const retries = (() => {
  const raw = process.env.WM_E2E_RETRIES;
  if (raw !== undefined && raw !== "") {
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0) return Math.floor(n);
  }
  return isCI ? 1 : 0;
})();

export default defineConfig({
  testDir: "./specs",
  globalSetup: require.resolve("./global-setup"),
  fullyParallel: false,
  workers: isCI ? 1 : 1,
  forbidOnly: isCI,
  retries,
  reporter: isCI
    ? [["list"], ["html", { open: "never" }], ["github"]]
    : [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  outputDir: "test-results",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:4444",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    locale: "ko-KR",
    timezoneId: "Asia/Seoul",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
});
