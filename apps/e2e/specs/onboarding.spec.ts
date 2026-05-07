/**
 * Spec: first-user onboarding happy path
 * Type: E2E (real Docker stack: web + api + db + ws)
 * Why: A new user must be able to create an account, join the seeded Acme
 *      company with the demo join code, persist profile details, and reach
 *      the member home without console-stubbed onboarding endpoints.
 * Covers:
 *   - UI signup -> UI login -> /onboarding/welcome
 *   - POST /v1/onboarding/join-company with ACMEDM
 *   - PATCH /v1/onboarding/profile with department / position / employee no
 *   - optional onboarding screens can be skipped/continued to /m/home
 */
import { expect, test } from "@playwright/test";
import { DEMO_COMPANY_CODE } from "@fixtures/users";

async function clickLastButton(page: import("@playwright/test").Page): Promise<void> {
  await page.locator("button").last().click();
}

test.describe("onboarding @new-user", () => {
  test("new user joins Acme, saves profile, and reaches home", async ({ page }, testInfo) => {
    const nonce = `${testInfo.project.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const email = `e2e-onboarding-${nonce}@example.test`;
    const password = "StrongPass!9";

    await page.goto("/signup", { waitUntil: "load", timeout: 120_000 });
    await page.waitForFunction(
      () => document.querySelectorAll("input").length >= 3,
      null,
      { timeout: 120_000 },
    );
    const signupInputs = page.locator("input");
    await signupInputs.nth(0).fill("E2E Onboarding");
    await signupInputs.nth(1).fill(email);
    await signupInputs.nth(2).fill(password);
    await clickLastButton(page);
    await page.waitForURL(/\/login$/, { timeout: 30_000 });

    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await clickLastButton(page);
    await page.waitForURL(/\/onboarding\/welcome$/, { timeout: 30_000 });

    await clickLastButton(page);
    await page.waitForURL(/\/onboarding\/company-code$/, { timeout: 30_000 });
    const codeInputs = page.locator('input[aria-label^="Code character"]');
    await expect(codeInputs).toHaveCount(6);
    for (let i = 0; i < DEMO_COMPANY_CODE.length; i += 1) {
      await codeInputs.nth(i).fill(DEMO_COMPANY_CODE[i]);
    }
    const joinResponse = page.waitForResponse(
      (res) =>
        res.url().includes("/v1/onboarding/join-company") &&
        res.request().method() === "POST",
    );
    await clickLastButton(page);
    await expect((await joinResponse).status()).toBe(201);
    await page.waitForURL(/\/onboarding\/profile$/, { timeout: 30_000 });

    const profileInputs = page.locator("input");
    await profileInputs.nth(0).fill("E2E Onboarding");
    await profileInputs.nth(1).fill("Engineering");
    await profileInputs.nth(2).fill("Developer");
    await profileInputs.nth(3).fill(`E2E-${nonce.slice(-8)}`);
    const profileResponse = page.waitForResponse(
      (res) =>
        res.url().includes("/v1/onboarding/profile") &&
        res.request().method() === "PATCH",
    );
    await clickLastButton(page);
    await expect((await profileResponse).status()).toBe(200);
    await page.waitForURL(/\/onboarding\/location$/, { timeout: 30_000 });

    await clickLastButton(page);
    await page.waitForURL(/\/onboarding\/schedule$/, { timeout: 30_000 });
    await clickLastButton(page);
    await page.waitForURL(/\/onboarding\/notifications$/, { timeout: 30_000 });
    await clickLastButton(page);
    await page.waitForURL(/\/onboarding\/widget$/, { timeout: 30_000 });
    await clickLastButton(page);
    await page.waitForURL(/\/onboarding\/done$/, { timeout: 30_000 });
    await clickLastButton(page);
    await page.waitForURL(/\/m\/home$/, { timeout: 30_000 });
  });
});
