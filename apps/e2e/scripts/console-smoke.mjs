import { chromium } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:4444";
const email = process.env.SMOKE_EMAIL ?? "admin@acme.demo";
const password = process.env.SMOKE_PASSWORD ?? "DemoPass!1";

const failures = [];
const sockets = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ baseURL });

page.on("console", (msg) => {
  const text = msg.text();
  if (/ERR_NAME_NOT_RESOLVED|WebSocket connection .*failed|favicon\.ico/.test(text)) {
    failures.push(`console:${msg.type()}:${text}`);
  }
});

page.on("requestfailed", (req) => {
  const url = req.url();
  if (/api:4455|\/v1\/ws|favicon\.ico/.test(url)) {
    failures.push(`requestfailed:${url}:${req.failure()?.errorText ?? ""}`);
  }
});

page.on("response", (resp) => {
  const url = resp.url();
  const status = resp.status();
  if (status >= 400 && /\/v1\/|favicon\.ico/.test(url)) {
    failures.push(`response:${status}:${url}`);
  }
});

page.on("websocket", (ws) => {
  sockets.push(ws.url().replace(/token=[^&]+/, "token=<redacted>"));
});

try {
  await page.goto("/login", { waitUntil: "load", timeout: 120_000 });
  await page.waitForFunction(
    () => Boolean(document.querySelector('input[type="email"]')),
    null,
    { timeout: 120_000 },
  );
  await page.locator('input[type="email"]').fill(email, { timeout: 60_000 });
  await page.locator('input[type="password"]').fill(password, { timeout: 60_000 });
  await page.getByRole("button").click();
  await page.waitForURL(/\/m\/home/, { timeout: 30_000 });
  await page.goto("/m/team", { waitUntil: "commit", timeout: 60_000 });
  await page.waitForTimeout(2_500);
} finally {
  await browser.close();
}

console.log(JSON.stringify({ failureCount: failures.length, failures, sockets }, null, 2));
if (failures.length > 0) process.exit(1);
