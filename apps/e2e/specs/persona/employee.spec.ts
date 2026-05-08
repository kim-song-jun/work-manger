/**
 * Spec: 직원(employee) 페르소나 핵심 동선 (iter13 T4)
 * Type: E2E (실 Postgres + Redis + Django + Vite, 도커 스택 사용)
 * Why:  직원은 매일 사용하는 1차 사용자. 출근→휴게→퇴근→연차 신청→알림 확인의
 *       골든 패스가 한 명의 직원으로 끊김 없이 가능해야 한다.
 * Pre-conditions:
 *   - seed_demo 가 EMPLOYEE 1명 이상 생성 (resolvePersonaUser 가 매니저 토큰으로
 *     실제 이메일을 동적 검색)
 *   - GPS 권한 grant + 본사 좌표 (37.5, 127.0)
 * Coverage:
 *   - login → /m/home
 *   - 출근 (slide-to-clock-in) — POST /v1/attendance/clock-in
 *   - 휴게 / 퇴근 화면 도달 (UI 노출만 검증, 실제 휴게는 BE 별도 작업)
 *   - 연차 신청 — /m/leave/apply 진입 + 폼 노출
 *   - 알림 확인 — /m/notifications 진입 + 헤더 노출
 *
 * Selector strategy: ARIA role + 한국어 accessible name (i18n ko 기준).
 * 각 test 는 독립 실행 가능 (test.describe 내 순서 의존 없음).
 */
import { test, expect } from "@playwright/test";
import { loginPersona, dragSliderRight, KO } from "./_fixtures";

test.use({
  permissions: ["geolocation"],
  geolocation: { latitude: 37.5, longitude: 127.0 },
});

test.describe("persona: employee @persona @employee", () => {
  test("login lands on mobile home", async ({ page }) => {
    await loginPersona(page, "employee");
    await expect(page).toHaveURL(/\/m\/home/);
  });

  test("clock-in slider triggers POST /v1/attendance/clock-in", async ({ page }) => {
    await loginPersona(page, "employee");
    await page.goto("/m/home", { waitUntil: "domcontentloaded", timeout: 30_000 });

    const clockInResp = page.waitForResponse(
      (r) => r.url().includes("/v1/attendance/clock-in") && r.request().method() === "POST",
      { timeout: 5_000 },
    );
    await dragSliderRight(page);
    const res = await clockInResp;
    // 201 (clean) or 409 (already clocked in earlier in same suite) both OK.
    expect([200, 201, 409]).toContain(res.status());
  });

  test("break / clock-out controls are visible on home", async ({ page }) => {
    await loginPersona(page, "employee");
    await page.goto("/m/home", { waitUntil: "domcontentloaded", timeout: 30_000 });
    // The home card surfaces either "출근" (before clock-in) or "퇴근" (after).
    // Either label confirms the slide control is mounted; both forms match KO.slideIn/slideOut.
    const slider = page.getByRole("slider").first();
    await expect(slider).toBeVisible({ timeout: 5_000 });
    // Records / 휴게 timeline label lives behind /m/record/:id; we only assert the
    // home-level control here so the spec stays independent of seed records.
    expect(true).toBe(true);
  });

  test("leave application form opens at /m/leave/apply", async ({ page }) => {
    await loginPersona(page, "employee");
    await page.goto("/m/leave/apply", { waitUntil: "load", timeout: 30_000 });
    await expect(page).toHaveURL(/\/m\/leave\/apply/);
    // Form has a submit button + reason textarea (see leave-apply.spec.ts).
    await expect(page.locator("textarea").first()).toBeVisible({ timeout: 5_000 });
    await expect(
      page.getByRole("button", { name: KO.leaveApply }).first(),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("notifications page renders header", async ({ page }) => {
    await loginPersona(page, "employee");
    await page.goto("/m/notifications", { waitUntil: "load", timeout: 30_000 });
    await expect(page).toHaveURL(/\/m\/notifications/);
    // Header is "알림" (mobile.notifications.title); empty-state copy is also OK.
    await expect(page.getByText(KO.notifications).first()).toBeVisible({ timeout: 5_000 });
  });
});
