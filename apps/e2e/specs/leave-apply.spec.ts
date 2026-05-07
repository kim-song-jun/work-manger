/**
 * Spec: leave application golden path
 * Type: E2E (Docker Postgres + Redis + Django + Vite)
 * Why: Leave submission is a core employee workflow. The browser must send
 *      the exact backend contract and receive a real 201 response before
 *      navigating to the success page.
 */
import { test, expect } from "@playwright/test";
import { loginAs } from "@fixtures/auth";
import { DEMO_USERS } from "@fixtures/users";

test.describe("leave application @employee", () => {
  test("employee submits a 2-day FULL leave and lands on success", async ({ page }) => {
    await loginAs(page, DEMO_USERS.manager);

    const { startISO, endISO, startDay, endDay, sameMonth } = nextMondayPair();

    await page.goto("/m/leave/apply", { waitUntil: "load", timeout: 30_000 });
    await expect(page).toHaveURL(/\/m\/leave\/apply/);

    if (!sameMonth) {
      await page.getByRole("button", { name: /next|다음/i }).click();
    }

    await page.getByRole("button", { name: String(startDay), exact: true }).first().click();
    await page.getByRole("button", { name: String(endDay), exact: true }).first().click();
    await page.getByRole("tab").first().click();
    await page.locator("textarea").first().fill("Rest");

    const submitPromise = page.waitForResponse(
      (r) =>
        r.url().includes("/v1/leave/requests") &&
        r.request().method() === "POST",
      { timeout: 10_000 },
    );
    await page.locator('button[type="submit"]').last().click();
    const resp = await submitPromise;
    const req = resp.request();

    expect(req.method()).toBe("POST");
    expect(resp.status(), "real leave endpoint should accept the request").toBe(201);
    const body = JSON.parse(req.postData() ?? "{}");
    expect(body.start_date).toBe(startISO);
    expect(body.end_date).toBe(endISO);
    expect(body.kind).toBe("FULL");

    await expect(page).toHaveURL(/\/m\/leave\/success/, { timeout: 5_000 });
  });
});

function nextMondayPair(): {
  startISO: string;
  endISO: string;
  startDay: number;
  endDay: number;
  sameMonth: boolean;
} {
  const today = new Date();
  const day = today.getDay();
  const offsetToMon = day === 1 ? 7 : (8 - day) % 7 || 7;
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + offsetToMon,
  );
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return {
    startISO: iso(start),
    endISO: iso(end),
    startDay: start.getDate(),
    endDay: end.getDate(),
    sameMonth:
      start.getMonth() === today.getMonth() &&
      start.getFullYear() === today.getFullYear(),
  };
}
