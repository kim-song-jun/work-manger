import { expect, request as pwRequest, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { API_URL, loginViaApi, type AuthSession } from "@fixtures/auth";
import { DEMO_USERS, type DemoUser } from "@fixtures/users";

type RouteCase = {
  path: string;
  area: "public" | "onboarding" | "mobile" | "web" | "admin";
  desktopOnly?: boolean;
};

const PUBLIC_ROUTES: RouteCase[] = [
  { path: "/login", area: "public" },
  { path: "/signup", area: "public" },
  { path: "/forgot", area: "public" },
  { path: "/__health", area: "public" },
];

const ONBOARDING_ROUTES: RouteCase[] = [
  { path: "/onboarding/welcome", area: "onboarding" },
  { path: "/onboarding/company-code", area: "onboarding" },
  { path: "/onboarding/profile", area: "onboarding" },
  { path: "/onboarding/location", area: "onboarding" },
  { path: "/onboarding/schedule", area: "onboarding" },
  { path: "/onboarding/notifications", area: "onboarding" },
  { path: "/onboarding/widget", area: "onboarding" },
  { path: "/onboarding/done", area: "onboarding" },
];

const MOBILE_ROUTES: RouteCase[] = [
  { path: "/m/home", area: "mobile" },
  { path: "/m/team", area: "mobile" },
  { path: "/m/leave", area: "mobile" },
  { path: "/m/leave/apply", area: "mobile" },
  { path: "/m/leave/success", area: "mobile" },
  { path: "/m/leave/expiry", area: "mobile" },
  { path: "/m/my", area: "mobile" },
  { path: "/m/overtime", area: "mobile" },
  { path: "/m/inbox", area: "mobile" },
  { path: "/m/inbox/quick", area: "mobile" },
  { path: "/m/report/weekly", area: "mobile" },
  { path: "/m/notifications", area: "mobile" },
  { path: "/m/notifications/empty", area: "mobile" },
  { path: "/m/notice", area: "mobile" },
  { path: "/m/settings", area: "mobile" },
  { path: "/m/profile", area: "mobile" },
  { path: "/m/customize", area: "mobile" },
  { path: "/m/trip", area: "mobile" },
  { path: "/m/help", area: "mobile" },
  { path: "/m/loc-picker", area: "mobile" },
  { path: "/m/error-gps", area: "mobile" },
  { path: "/m/compliance", area: "mobile" },
  { path: "/m/compliance/block", area: "mobile" },
];

const WEB_ROUTES: RouteCase[] = [
  { path: "/web", area: "web", desktopOnly: true },
  { path: "/web/inbox", area: "web", desktopOnly: true },
  { path: "/web/records", area: "web", desktopOnly: true },
  { path: "/web/team-leave", area: "web", desktopOnly: true },
  { path: "/web/team-calendar", area: "web", desktopOnly: true },
];

const ADMIN_ROUTES: RouteCase[] = [
  { path: "/admin", area: "admin", desktopOnly: true },
  { path: "/admin/approvals", area: "admin", desktopOnly: true },
  { path: "/admin/employees", area: "admin", desktopOnly: true },
  { path: "/admin/reports", area: "admin", desktopOnly: true },
  { path: "/admin/expiring-leave", area: "admin", desktopOnly: true },
  { path: "/admin/audit", area: "admin", desktopOnly: true },
  { path: "/admin/codes", area: "admin", desktopOnly: true },
  { path: "/admin/compliance", area: "admin", desktopOnly: true },
];

test.describe("all pages smoke", () => {
  test("every route renders with clean API/console/design basics", async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);
    const isMobile = testInfo.project.name.includes("mobile");
    const artifactRoot = `test-results/all-pages/${testInfo.project.name}`;
    await mkdir(artifactRoot, { recursive: true });

    const failures = installFailureCollector(page);

    await visitGroup(page, [...PUBLIC_ROUTES, ...ONBOARDING_ROUTES], artifactRoot);

    const managerSession = await seedAuth(page, DEMO_USERS.manager);
    const memberIds = await discoverIds(managerSession);
    const memberRoutes = [
      ...MOBILE_ROUTES,
      { path: `/m/inbox/${memberIds.inboxId}`, area: "mobile" as const },
      { path: `/m/record/${memberIds.recordId}`, area: "mobile" as const },
    ];
    await visitGroup(page, memberRoutes, artifactRoot);

    if (!isMobile) {
      const adminSession = await seedAuth(page, DEMO_USERS.admin);
      const adminIds = await discoverIds(adminSession);
      await visitGroup(
        page,
        [
          ...WEB_ROUTES,
          ...ADMIN_ROUTES,
          {
            path: `/admin/employees/${adminIds.employeeId}`,
            area: "admin" as const,
            desktopOnly: true,
          },
        ],
        artifactRoot,
      );
    }

    expect(failures).toEqual([]);
  });

  test("private route permissions redirect correctly", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/m/home", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login$/);

    await page.goto("/web", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login$/);

    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login$/);

    await seedAuth(page, {
      email: "admin@molcube.com",
      password: "admin1234!",
      role: "OWNER",
    });
    await page.goto("/m/home", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/onboarding\/welcome$/);

    await seedAuth(page, DEMO_USERS.manager);
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/m\/home$/);

    await seedAuth(page, DEMO_USERS.admin);
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/admin\/?$/);
  });
});

async function seedAuth(page: Page, user: DemoUser): Promise<AuthSession> {
  const session = await loginViaApi(user);
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.evaluate((token) => {
    window.localStorage.setItem("wm:access", token);
    window.localStorage.setItem(
      "wm:auth",
      JSON.stringify({ state: { accessToken: token }, version: 0 }),
    );
  }, session.accessToken);
  return session;
}

async function discoverIds(session: AuthSession): Promise<{
  employeeId: string;
  inboxId: string;
  recordId: string;
}> {
  const ctx = await pwRequest.newContext({
    baseURL: API_URL,
    extraHTTPHeaders: { authorization: `Bearer ${session.accessToken}` },
  });
  try {
    const [employees, inbox, records] = await Promise.all([
      ctx.get("/v1/admin/employees"),
      ctx.get("/v1/inbox?limit=1"),
      ctx.get("/v1/attendance/records?limit=1"),
    ]);
    const employeeBody = employees.ok() ? await employees.json() : { data: [] };
    const inboxBody = inbox.ok() ? await inbox.json() : { data: [] };
    const recordsBody = records.ok() ? await records.json() : { data: [] };
    const employeeId = employeeBody.data?.[0]?.id;
    const inboxId = inboxBody.data?.[0]?.id ?? "00000000-0000-0000-0000-000000000000";
    const recordId = recordsBody.data?.[0]?.id;
    if (!recordId) throw new Error("all-pages smoke requires at least one attendance record");
    return {
      employeeId: employeeId ?? "00000000-0000-0000-0000-000000000000",
      inboxId,
      recordId,
    };
  } finally {
    await ctx.dispose();
  }
}

async function visitGroup(page: Page, routes: RouteCase[], artifactRoot: string) {
  for (const route of routes) {
    await page.goto(route.path, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForTimeout(600);
    await page.waitForFunction(() => {
      const text = (document.body.innerText ?? "").trim();
      return text.length > 0 && text !== "Loading";
    }, null, { timeout: 10_000 });
    await page
      .waitForFunction(() => document.querySelectorAll(".wm-skeleton").length === 0, null, {
        timeout: 10_000,
      })
      .catch(() => {});
    await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
    const metrics = await page.evaluate(() => {
      const visible = (el: Element) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return (
          style.visibility !== "hidden" &&
          style.display !== "none" &&
          rect.width > 0 &&
          rect.height > 0
        );
      };
      const interactive = Array.from(
        document.querySelectorAll(
          'button,a,input,textarea,select,[role="button"],[role="tab"]',
        ),
      ).filter(visible);
      const smallTargets = interactive
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            tag: el.tagName.toLowerCase(),
            text: (el.textContent ?? "").trim().slice(0, 32),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          };
        })
        .filter((x) => x.width < 24 || x.height < 24);
      const body = document.body;
      const root = document.documentElement;
      return {
        textLength: (body.innerText ?? "").trim().length,
        overflowX: Math.max(body.scrollWidth, root.scrollWidth) - window.innerWidth,
        smallTargets,
      };
    });
    expect(metrics.textLength, `${route.path} should not be blank`).toBeGreaterThan(0);
    expect(metrics.overflowX, `${route.path} horizontal overflow`).toBeLessThanOrEqual(8);
    expect(metrics.smallTargets, `${route.path} small interactive targets`).toEqual([]);
    await page.screenshot({
      path: `${artifactRoot}/${route.area}-${safeName(route.path)}.png`,
      fullPage: true,
    });
  }
}

function installFailureCollector(page: Page): string[] {
  const failures: string[] = [];
  page.on("pageerror", (err) => failures.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    const text = msg.text();
    if (
      msg.type() === "error" ||
      /ERR_NAME_NOT_RESOLVED|WebSocket connection .*failed|favicon\.ico/i.test(text)
    ) {
      failures.push(`console ${msg.type()}: ${text}`);
    }
  });
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (/\/v1\/|favicon\.ico/i.test(url)) {
      failures.push(`requestfailed ${request.method()} ${url}: ${request.failure()?.errorText}`);
    }
  });
  page.on("response", (response) => {
    const url = response.url();
    if (/\/v1\/|favicon\.ico/i.test(url) && response.status() >= 400) {
      failures.push(`http ${response.status()} ${response.request().method()} ${url}`);
    }
  });
  return failures;
}

function safeName(path: string): string {
  return path.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-") || "root";
}
