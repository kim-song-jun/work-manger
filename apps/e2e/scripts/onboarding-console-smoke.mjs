import { chromium } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:4444";
const companyCode = process.env.SMOKE_COMPANY_CODE ?? "ACMEDM";
const nonce = Date.now();
const email = process.env.SMOKE_EMAIL ?? `onboarding-${nonce}@example.test`;
const password = process.env.SMOKE_PASSWORD ?? "StrongPass!9";

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
  if (status >= 400 && /\/v1\/(auth|me|onboarding)\b|favicon\.ico/.test(url)) {
    failures.push(`response:${status}:${url}`);
  }
});

page.on("websocket", (ws) => {
  sockets.push(ws.url().replace(/token=[^&]+/, "token=<redacted>"));
});

async function clickPrimary() {
  await page.locator("button").last().click();
}

try {
  await page.goto("/signup", { waitUntil: "load", timeout: 120_000 });
  await page.waitForFunction(
    () => document.querySelectorAll("input").length >= 3,
    null,
    { timeout: 120_000 },
  );
  const signupInputs = page.locator("input");
  await signupInputs.nth(0).fill("Onboarding Smoke", { timeout: 60_000 });
  await signupInputs.nth(1).fill(email, { timeout: 60_000 });
  await signupInputs.nth(2).fill(password, { timeout: 60_000 });
  await clickPrimary();
  await page.waitForURL(/\/login/, { timeout: 30_000 });

  await page.locator('input[type="email"]').fill(email, { timeout: 60_000 });
  await page.locator('input[type="password"]').fill(password, { timeout: 60_000 });
  await clickPrimary();
  await page.waitForURL(/\/onboarding\/welcome/, { timeout: 30_000 });
  await page.waitForTimeout(1_000);

  await clickPrimary();
  await page.waitForURL(/\/onboarding\/company-code/, { timeout: 30_000 });
  const boxes = page.locator('input[aria-label^="Code character"]');
  for (let i = 0; i < companyCode.length; i += 1) {
    await boxes.nth(i).fill(companyCode[i]);
  }
  await clickPrimary();
  await page.waitForURL(/\/onboarding\/profile/, { timeout: 30_000 });

  const profileInputs = page.locator("input");
  await profileInputs.nth(0).fill("Onboarding Smoke");
  await profileInputs.nth(1).fill("Engineering");
  await profileInputs.nth(2).fill("Developer");
  await profileInputs.nth(3).fill(`SMK-${nonce}`);
  await clickPrimary();
  await page.waitForURL(/\/onboarding\/location/, { timeout: 30_000 });
  await page.waitForTimeout(1_500);
} finally {
  await browser.close();
}

console.log(JSON.stringify({ failureCount: failures.length, failures, sockets }, null, 2));
if (failures.length > 0) process.exit(1);
