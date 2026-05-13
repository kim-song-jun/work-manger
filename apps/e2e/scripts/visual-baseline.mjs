/**
 * visual-baseline — 18-page screenshot baseline for visual regression review.
 *
 * Phase: B-CODE-09 (UI/UX polish). Existing design-smoke covers 4 entry pages
 * (login/signup/onboarding 4 steps); this script extends to authenticated
 * pages where the bulk of UX lives.
 *
 * Pages (18):
 *   - Public: login, signup, onboarding-welcome (already in design-smoke; we
 *     re-shoot here so artifacts live together for review).
 *   - Employee (Diana): /m/home, /m/leave, /m/leave/apply, /m/inbox,
 *     /m/notifications, /m/notice, /m/my.
 *   - Manager (manager1): /m/inbox (승인할 것 6건), /web/inbox.
 *   - Admin: /admin, /admin/approvals, /admin/employees, /admin/audit,
 *     /admin/compliance, /admin/settings, /admin/codes.
 *   - Owner: /owner/billing.
 *
 * Output: docs/qa/screenshots/baseline/<page>.png + manifest.json
 *
 * Usage:
 *   BASE_URL=http://localhost:4444 node scripts/visual-baseline.mjs
 *
 * Exit:
 *   0 = success, 1 = any page failed to render (e.g., 401 redirect loop)
 */
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const baseURL = process.env.BASE_URL ?? "http://localhost:4444";
const outDir = process.env.BASELINE_DIR ?? "../../docs/qa/screenshots/baseline";

const password = "DemoPass!1";
const personas = {
  anonymous: null,
  employee: "diana-ngiaqq@acme.demo",
  manager: "manager1@acme.demo",
  admin: "admin@acme.demo",
  owner: "owner@acme.demo",
};

const pages = [
  // public (anonymous)
  { id: "01-login", url: "/login", persona: "anonymous", viewport: { width: 390, height: 844 } },
  { id: "02-signup", url: "/signup", persona: "anonymous", viewport: { width: 390, height: 844 } },
  { id: "03-onboarding-welcome", url: "/onboarding/welcome", persona: "anonymous", viewport: { width: 390, height: 844 } },
  // employee (mobile 390)
  { id: "04-m-home-employee", url: "/m/home", persona: "employee", viewport: { width: 390, height: 844 } },
  { id: "05-m-leave-employee", url: "/m/leave", persona: "employee", viewport: { width: 390, height: 844 } },
  { id: "06-m-leave-apply", url: "/m/leave/apply", persona: "employee", viewport: { width: 390, height: 844 } },
  { id: "07-m-notifications", url: "/m/notifications", persona: "employee", viewport: { width: 390, height: 844 } },
  { id: "08-m-notice", url: "/m/notice", persona: "employee", viewport: { width: 390, height: 844 } },
  { id: "09-m-my", url: "/m/my", persona: "employee", viewport: { width: 390, height: 844 } },
  // manager (mobile 390 + web 1280)
  { id: "10-m-inbox-manager", url: "/m/inbox", persona: "manager", viewport: { width: 390, height: 844 } },
  { id: "11-web-inbox-manager", url: "/web/inbox", persona: "manager", viewport: { width: 1280, height: 800 } },
  // admin (web 1280)
  { id: "12-admin-dashboard", url: "/admin", persona: "admin", viewport: { width: 1280, height: 800 } },
  { id: "13-admin-approvals", url: "/admin/approvals", persona: "admin", viewport: { width: 1280, height: 800 } },
  { id: "14-admin-employees", url: "/admin/employees", persona: "admin", viewport: { width: 1280, height: 800 } },
  { id: "15-admin-audit", url: "/admin/audit", persona: "admin", viewport: { width: 1280, height: 800 } },
  { id: "16-admin-compliance", url: "/admin/compliance", persona: "admin", viewport: { width: 1280, height: 800 } },
  { id: "17-admin-settings", url: "/admin/settings", persona: "admin", viewport: { width: 1280, height: 800 } },
  // owner (web 1280)
  { id: "18-owner-billing", url: "/owner/billing", persona: "owner", viewport: { width: 1280, height: 800 } },
];

async function authenticate(page, email) {
  await page.goto("/login", { waitUntil: "load", timeout: 60_000 });
  await page.waitForFunction(
    () => Boolean(document.querySelector('input[type="email"]')),
    null,
    { timeout: 30_000 },
  );
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.evaluate(() => document.querySelector("form")?.requestSubmit());
  await page.waitForURL(/\/m\/home|\/admin/, { timeout: 30_000 }).catch(() => {});
}

const manifest = [];
let exitCode = 0;

try {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  // 페르소나별 context cache — 한 번 로그인 후 재사용.
  const sessions = {};
  for (const [key, email] of Object.entries(personas)) {
    const ctx = await browser.newContext({ baseURL, locale: "ko-KR" });
    if (email) {
      const p = await ctx.newPage();
      await authenticate(p, email);
      await p.close();
    }
    sessions[key] = ctx;
  }

  for (const spec of pages) {
    const ctx = sessions[spec.persona];
    const page = await ctx.newPage();
    await page.setViewportSize(spec.viewport);
    try {
      await page.goto(spec.url, { waitUntil: "commit", timeout: 30_000 });
      await page.waitForTimeout(2_500); // settle data + animations
      const finalUrl = page.url();
      const outPath = `${outDir}/${spec.id}.png`;
      await page.screenshot({ path: outPath, fullPage: true });
      manifest.push({
        id: spec.id,
        requestedUrl: spec.url,
        finalUrl,
        persona: spec.persona,
        viewport: spec.viewport,
        screenshot: outPath,
      });
    } catch (err) {
      console.error(`[visual-baseline] FAIL ${spec.id} ${spec.url}:`, err.message);
      manifest.push({
        id: spec.id,
        requestedUrl: spec.url,
        persona: spec.persona,
        error: err.message,
      });
      exitCode = 1;
    } finally {
      await page.close();
    }
  }

  await writeFile(`${outDir}/manifest.json`, JSON.stringify(manifest, null, 2));
  await browser.close();

  console.log(JSON.stringify({ ok: exitCode === 0, count: manifest.length, manifest }, null, 2));
} catch (e) {
  console.error("visual-baseline runner error:", e);
  exitCode = 2;
}

process.exit(exitCode);
