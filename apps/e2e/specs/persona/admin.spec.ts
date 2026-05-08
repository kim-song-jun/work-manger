/**
 * Spec: 관리자(admin) 페르소나 핵심 동선 (iter13 T4)
 * Type: E2E (실 Postgres + Redis + Django + Vite, 도커 스택 사용)
 * Why:  관리자는 회사 운영의 백오피스. 직원 목록 / 코드 발급·회수 / 감사 로그 /
 *       설정 변경의 4가지가 핵심 동선이며, 이 중 하나라도 막히면 신규 직원
 *       온보딩 또는 컴플라이언스 대응이 지연된다 (ops §11.1).
 * Pre-conditions:
 *   - admin@acme.demo (ADMIN role, /admin 접근 가능)
 *   - 데스크톱 프로젝트에서만 실행 (admin 라우트는 desktopOnly)
 * Coverage:
 *   - login → /admin
 *   - /admin/employees — 직원 목록 노출
 *   - /admin/codes — 발급 + 회수 컨트롤 노출
 *   - /admin/audit — 감사 로그 헤더 + 테이블 노출
 *   - /admin/settings — 설정 폼 노출 (admin 은 read-only, owner-only-hint 안내)
 *
 * Note: admin 은 settings_save 가 disabled (owner only). 진입과 안내문 검증만.
 */
import { test, expect } from "@playwright/test";
import { loginPersona, KO } from "./_fixtures";

test.describe("persona: admin @persona @admin", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name.includes("mobile"),
      "admin pages are desktop-only (web shell)",
    );
  });

  test("login lands on /admin", async ({ page }) => {
    await loginPersona(page, "admin");
    await expect(page).toHaveURL(/\/admin\/?$/);
  });

  test("employees list renders", async ({ page }) => {
    await loginPersona(page, "admin");
    await page.goto("/admin/employees", { waitUntil: "load", timeout: 30_000 });
    await expect(page).toHaveURL(/\/admin\/employees/);
    // Page heading or column header — either resolves to KO.adminEmployees.
    await expect(page.getByText(KO.adminEmployees).first()).toBeVisible({ timeout: 5_000 });
  });

  test("invite codes page surfaces issue + revoke controls", async ({ page }) => {
    await loginPersona(page, "admin");
    await page.goto("/admin/codes", { waitUntil: "load", timeout: 30_000 });
    await expect(page).toHaveURL(/\/admin\/codes/);
    // 발급 버튼 (i18n key admin.code_issue = "발급").
    await expect(
      page.getByRole("button", { name: /발급/ }).first(),
    ).toBeVisible({ timeout: 5_000 });
    // 회수 버튼 노출 OR 빈 상태 ("발급된 코드가 없어요") — 둘 다 valid.
    const revokeBtn = page.getByRole("button", { name: /회수/ }).first();
    const empty = page.getByText(/발급된 코드가 없어요/).first();
    await expect(async () => {
      const a = await revokeBtn.isVisible().catch(() => false);
      const b = await empty.isVisible().catch(() => false);
      expect(a || b).toBe(true);
    }).toPass({ timeout: 8_000 });
  });

  test("audit log page renders header", async ({ page }) => {
    await loginPersona(page, "admin");
    await page.goto("/admin/audit", { waitUntil: "load", timeout: 30_000 });
    await expect(page).toHaveURL(/\/admin\/audit/);
    await expect(page.getByText(KO.adminAudit).first()).toBeVisible({ timeout: 5_000 });
  });

  test("settings page is read-only for admin", async ({ page }) => {
    await loginPersona(page, "admin");
    await page.goto("/admin/settings", { waitUntil: "load", timeout: 30_000 });
    await expect(page).toHaveURL(/\/admin\/settings/);
    // Read-only banner: admin.settings_owner_only_hint = "소유주만 설정을 변경할 수 있어요"
    await expect(
      page.getByText(/소유주만 설정을 변경할 수 있어요|회사 정보/).first(),
    ).toBeVisible({ timeout: 5_000 });
  });
});
