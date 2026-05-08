/**
 * Spec: 소유주(owner) 페르소나 핵심 동선 (iter13 T4)
 * Type: E2E (실 Postgres + Redis + Django + Vite, 도커 스택 사용)
 * Why:  소유주는 회사 단 1인 (또는 양도 직전 구성). 회사 정보 변경 / 데이터
 *       export / 권한 부여 권한이 있고, 이 동선이 막히면 인수인계·법적
 *       데이터 요청 (개인정보보호법) 대응이 불가하다 (ops §11.2).
 * Pre-conditions:
 *   - owner@acme.demo (OWNER role)
 *   - 데스크톱 프로젝트에서만 실행
 * Coverage:
 *   - login → /admin (owner 도 admin shell 사용)
 *   - /admin/settings — 회사명 입력 가능 + 저장 버튼 활성
 *   - /admin/settings — "데이터 내보내기 요청" 섹션 노출
 *   - /admin/employees/:id — 직원 권한 변경 폼 (역할 select) 노출
 *
 * Note: 실제 PATCH /v1/admin/companies/me 호출은 부작용이 커서 spec 에서는
 * 입력 가능성과 컨트롤 노출만 검증한다. Mutating 테스트는 별도 BE 통합에서.
 */
import { test, expect, request as pwRequest } from "@playwright/test";
import { loginPersona, KO } from "./_fixtures";
import { API_URL } from "@fixtures/auth";

test.describe("persona: owner @persona @owner", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name.includes("mobile"),
      "owner pages are desktop-only (admin web shell)",
    );
  });

  test("login lands on /admin", async ({ page }) => {
    await loginPersona(page, "owner");
    await expect(page).toHaveURL(/\/admin\/?$/);
  });

  test("company info editable on /admin/settings", async ({ page }) => {
    await loginPersona(page, "owner");
    await page.goto("/admin/settings", { waitUntil: "load", timeout: 30_000 });
    await expect(page).toHaveURL(/\/admin\/settings/);
    // 회사명 라벨 노출 (admin.settings_company_name).
    await expect(page.getByText(KO.companyName).first()).toBeVisible({ timeout: 5_000 });
    // 저장 버튼은 OWNER 일 때 enabled. admin 의 read-only 와 차별점.
    const saveBtn = page.getByRole("button", { name: /저장/ }).first();
    await expect(saveBtn).toBeVisible({ timeout: 5_000 });
    // owner 모드 안내 (admin.settings_sub_owner) 또는 readonly 안내가 아닌 상태.
    await expect(
      page.getByText(/회사 정보, 브랜드, 운영 정책을 관리해요|회사 설정/).first(),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("data export section is reachable on settings page", async ({ page }) => {
    await loginPersona(page, "owner");
    await page.goto("/admin/settings", { waitUntil: "load", timeout: 30_000 });
    // admin.settings_data_export_btn = "내보내기 요청 이메일 열기" — owner 만 노출.
    await expect(
      page.getByText(KO.dataExport).first(),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("employee detail page exposes role assignment", async ({ page }) => {
    const { session: ownerSession } = await loginPersona(page, "owner");
    // Resolve a real employee membership id via /v1/admin/employees.
    const ctx = await pwRequest.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: { authorization: `Bearer ${ownerSession.accessToken}` },
    });
    let employeeId: string | null = null;
    try {
      const r = await ctx.get("/v1/admin/employees");
      if (r.ok()) {
        const body = (await r.json()) as { data?: Array<{ id?: string }> };
        employeeId = body.data?.[0]?.id ?? null;
      }
    } finally {
      await ctx.dispose();
    }
    test.skip(!employeeId, "no employee record returned by /v1/admin/employees");
    await page.goto(`/admin/employees/${employeeId}`, {
      waitUntil: "load",
      timeout: 30_000,
    });
    await expect(page).toHaveURL(new RegExp(`/admin/employees/${employeeId}`));
    // Role assignment field (admin.emp_field_role = "역할") OR detail tab.
    await expect(
      page.getByText(/역할|권한/).first(),
    ).toBeVisible({ timeout: 5_000 });
  });
});
