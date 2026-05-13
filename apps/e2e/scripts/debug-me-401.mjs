import { chromium } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:4444";
const email = "admin@acme.demo";
const password = "DemoPass!1";

const events = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ baseURL });

let phase = "boot";

page.on("response", async (resp) => {
  const url = resp.url();
  if (/\/v1\/me/.test(url)) {
    const req = resp.request();
    const authHeader = (await req.allHeaders())["authorization"] || "(none)";
    events.push({
      phase,
      url,
      status: resp.status(),
      method: req.method(),
      authHeader: authHeader.startsWith("Bearer ") ? "Bearer <" + authHeader.slice(7, 17) + "...>" : authHeader,
    });
  }
});

try {
  phase = "goto-login";
  await page.goto("/login", { waitUntil: "load", timeout: 60_000 });
  await page.waitForFunction(() => Boolean(document.querySelector('input[type="email"]')), null, { timeout: 30_000 });

  phase = "type-credentials";
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  phase = "click-login";
  await page.getByRole("button").click();
  await page.waitForURL(/\/m\/home/, { timeout: 30_000 });

  phase = "post-login-wait";
  await page.waitForTimeout(2_500);

  phase = "goto-team";
  await page.goto("/m/team", { waitUntil: "commit", timeout: 60_000 });
  await page.waitForTimeout(2_000);
} finally {
  await browser.close();
}

console.log(JSON.stringify(events, null, 2));
