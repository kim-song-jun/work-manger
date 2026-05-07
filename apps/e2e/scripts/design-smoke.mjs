import { chromium, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const baseURL = process.env.BASE_URL ?? "http://localhost:4444";
const artifactDir = process.env.DESIGN_SMOKE_DIR ?? "test-results/design-smoke";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  baseURL,
  viewport: { width: 390, height: 844 },
  locale: "ko-KR",
});
const page = await context.newPage();

async function css(locator, prop) {
  return locator.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);
}

const results = [];
await mkdir(artifactDir, { recursive: true });

async function screenshot(name) {
  const path = `${artifactDir}/${name}.png`;
  await page.screenshot({ path, fullPage: true });
  return path;
}

try {
  await page.goto("/login", { waitUntil: "commit", timeout: 60_000 });
  const loginShell = page.getByTestId("auth-shell");
  await loginShell.waitFor({ state: "visible", timeout: 60_000 });
  await expect(page.getByTestId("auth-logo")).toHaveText("W");
  await expect(loginShell.locator('input[type="email"]')).toBeVisible();
  await expect(loginShell.locator('input[type="password"]')).toBeVisible();
  const loginSection = loginShell.locator("section");
  const loginBox = await loginSection.boundingBox();
  if (!loginBox || Math.round(loginBox.width) !== 390) {
    throw new Error(`login shell width mismatch: ${loginBox?.width}`);
  }
  results.push({
    page: "login",
    viewport: "390x844",
    shellWidth: Math.round(loginBox.width),
    background: await css(loginSection, "background-color"),
    screenshot: await screenshot("login-mobile"),
  });

  await page.goto("/signup", { waitUntil: "commit", timeout: 60_000 });
  const signupShell = page.getByTestId("auth-shell");
  await signupShell.waitFor({ state: "visible", timeout: 60_000 });
  await expect(signupShell.locator('input[type="email"]')).toBeVisible();
  await expect(signupShell.locator('input[type="password"]')).toBeVisible();
  await expect(signupShell.locator("input")).toHaveCount(3);
  const signupBox = await signupShell.locator("section").boundingBox();
  if (!signupBox || Math.round(signupBox.width) !== 390) {
    throw new Error(`signup shell width mismatch: ${signupBox?.width}`);
  }
  results.push({
    page: "signup",
    viewport: "390x844",
    shellWidth: Math.round(signupBox.width),
    screenshot: await screenshot("signup-mobile"),
  });

  await page.goto("/onboarding/welcome", { waitUntil: "commit", timeout: 60_000 });
  await expect(page.getByTestId("onboarding-welcome")).toBeVisible();
  await expect(page.getByTestId("onboarding-feature")).toHaveCount(3);
  results.push({
    page: "onboarding/welcome",
    viewport: "390x844",
    featureCount: 3,
    screenshot: await screenshot("onboarding-welcome-mobile"),
  });

  await page.goto("/onboarding/company-code", { waitUntil: "commit", timeout: 60_000 });
  const onbShell = page.getByTestId("onboarding-shell");
  await onbShell.waitFor({ state: "visible", timeout: 60_000 });
  const codeInputs = page.locator('input[aria-label^="Code character"]');
  await expect(codeInputs).toHaveCount(6);
  const firstInputBox = await codeInputs.first().boundingBox();
  if (!firstInputBox || Math.round(firstInputBox.width) !== 44 || Math.round(firstInputBox.height) !== 56) {
    throw new Error(`code input size mismatch: ${JSON.stringify(firstInputBox)}`);
  }
  results.push({
    page: "onboarding/company-code",
    viewport: "390x844",
    inputSize: `${Math.round(firstInputBox.width)}x${Math.round(firstInputBox.height)}`,
    screenshot: await screenshot("onboarding-company-code-mobile"),
  });
} finally {
  await context.close();
  await browser.close();
}

console.log(JSON.stringify({ ok: true, results }, null, 2));
