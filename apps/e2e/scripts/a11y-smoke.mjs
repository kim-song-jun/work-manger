/**
 * a11y smoke — axe-core via Playwright (B-CODE-09 — release gate addition)
 *
 * Why: 사용자가 출시 직전 라이브 테스트만으로 a11y 격차 측정 불가. axe-core
 * 자동화로 HIGH/CRITICAL 0 기준선 확보.
 *
 * Target pages: /login (anonymous) + /m/home (EMPLOYEE) + /admin (ADMIN).
 * Phase 1 baseline 만 — 향후 18 페이지로 확대 (B-V1X follow-up).
 *
 * Exit code:
 *   0  = HIGH/CRITICAL 0건
 *   1  = HIGH/CRITICAL 발견 (CI 차단)
 *   2  = 환경 에러 (axe 실행 자체 실패)
 *
 * Report: JSON to stdout + per-page violations dumped.
 */
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const baseURL = process.env.BASE_URL ?? "http://localhost:4444";
const adminEmail = process.env.A11Y_ADMIN ?? "admin@acme.demo";
const empEmail = process.env.A11Y_EMPLOYEE ?? "diana-ngiaqq@acme.demo";
const password = process.env.A11Y_PASSWORD ?? "DemoPass!1";

// Restrict to WCAG 2.1 AA + best-practice (skip experimental). Per axe-core docs.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"];
const FATAL_IMPACT = new Set(["critical", "serious"]);

async function login(page, email) {
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

async function scan(page, label) {
  const builder = new AxeBuilder({ page }).withTags(TAGS);
  const results = await builder.analyze();
  const fatal = results.violations.filter((v) => FATAL_IMPACT.has(v.impact ?? ""));
  return {
    label,
    url: page.url(),
    totalViolations: results.violations.length,
    fatalCount: fatal.length,
    fatal: fatal.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.slice(0, 3).map((n) => ({
        html: n.html.slice(0, 200),
        target: n.target,
      })),
    })),
  };
}

const results = [];
let exitCode = 0;

try {
  const browser = await chromium.launch({ headless: true });

  // 1) /login — anonymous
  {
    const ctx = await browser.newContext({ baseURL });
    const page = await ctx.newPage();
    await page.goto("/login", { waitUntil: "load", timeout: 60_000 });
    await page.waitForFunction(
      () => Boolean(document.querySelector('input[type="email"]')),
      null,
      { timeout: 30_000 },
    );
    results.push(await scan(page, "login"));
    await ctx.close();
  }

  // 2) /m/home as EMPLOYEE
  {
    const ctx = await browser.newContext({ baseURL });
    const page = await ctx.newPage();
    await login(page, empEmail);
    await page.waitForTimeout(2_500); // let data settle for accurate axe scan
    results.push(await scan(page, "m-home (employee)"));
    await ctx.close();
  }

  // 3) /admin as ADMIN
  {
    const ctx = await browser.newContext({ baseURL });
    const page = await ctx.newPage();
    await login(page, adminEmail);
    await page.goto("/admin", { waitUntil: "commit", timeout: 60_000 });
    await page.waitForTimeout(2_500);
    results.push(await scan(page, "admin-dashboard"));
    await ctx.close();
  }

  await browser.close();

  const totalFatal = results.reduce((sum, r) => sum + r.fatalCount, 0);
  exitCode = totalFatal > 0 ? 1 : 0;

  console.log(JSON.stringify({ ok: exitCode === 0, totalFatal, pages: results }, null, 2));
} catch (e) {
  console.error("a11y-smoke runner error:", e);
  exitCode = 2;
}

process.exit(exitCode);
