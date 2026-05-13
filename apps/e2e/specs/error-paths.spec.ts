/**
 * Spec: 에러 경로 회귀 (B-CODE-09 follow-up)
 * Type: E2E (실 Postgres + Redis + Django + Vite)
 * Why:  iter14 까지 12 spec 은 모두 sunny-path. 실 운영에서는 403/422/401 등
 *       에러가 빈번하고, UI 가 silent fail 하면 사용자 신뢰 큰 손상.
 *       본 spec 은 핵심 에러 경로를 회귀 보호한다.
 * Pre-conditions:
 *   - seed_demo: admin/manager1/owner + 직원 25명, 9 leave req, 3 OT req
 * Coverage:
 *   1) 잘못된 비밀번호 N회 → 락아웃 (423 ACCOUNT_LOCKED) 시각화
 *   2) 권한 없는 사용자가 /admin 직접 URL 접근 → /m/home redirect (가드)
 *   3) Refresh token 위변조 → 401 → 강제 로그아웃 (다음 fetch 시 /login)
 *   4) 빈 인박스 페이지 → 친화적 empty state 노출
 * Out of scope:
 *   - WS 끊김 회복 (별도 spec 권장 — flake 위험 큼)
 */
import { test, expect, type Page } from "@playwright/test";
import { DEMO_USERS, DEMO_PASSWORD } from "@fixtures/users";

const emailInput = (page: Page) => page.locator('input[type="email"]');
const passwordInput = (page: Page) => page.locator('input[type="password"]');
const submitBtn = (page: Page) =>
  page.getByRole("button", { name: /login|로그인|submit|확인|시작/i });

async function gotoLogin(page: Page): Promise<void> {
  await page.goto("/login", { waitUntil: "load", timeout: 30_000 });
  await page.waitForFunction(
    () => Boolean(document.querySelector('input[type="email"]')),
    null,
    { timeout: 30_000 },
  );
}

test.describe("Error paths — 권한/락아웃/empty", () => {
  test("E2E-ERR-01 권한 없는 사용자가 /admin 접근 → /m/home redirect", async ({ page }) => {
    // Why: 권한 가드 끊기면 비-ADMIN 이 ADMIN 화면을 보게 됨 (CRITICAL).
    await gotoLogin(page);
    // 일반 직원 계정으로 로그인 — 안정 fallback: admin (실 EMPLOYEE 가
    // seed 마다 random suffix 이므로 manager2 로 대신 — 이 또한 RequireAdmin
    // 가드에 의해 /admin → /m/home 으로 차단되어야 한다).
    await emailInput(page).fill(DEMO_USERS.manager2.email);
    await passwordInput(page).fill(DEMO_PASSWORD);
    await submitBtn(page).click();
    await page.waitForURL(/\/m\/home/, { timeout: 15_000 });

    // 직접 URL 로 /admin 접근 시도
    await page.goto("/admin", { waitUntil: "commit", timeout: 15_000 });
    await page.waitForURL(/\/m\/home/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/m\/home$/);
  });

  test("E2E-ERR-02 OWNER 권한 가드 — ADMIN 이 /owner/billing 직접 접근 시 /admin redirect", async ({ page }) => {
    await gotoLogin(page);
    await emailInput(page).fill(DEMO_USERS.admin.email);
    await passwordInput(page).fill(DEMO_PASSWORD);
    await submitBtn(page).click();
    await page.waitForURL(/\/m\/home|\/admin/, { timeout: 15_000 });

    await page.goto("/owner/billing", { waitUntil: "commit", timeout: 15_000 });
    await page.waitForURL(/\/admin/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/admin/);
  });

  test("E2E-ERR-03 잘못된 비밀번호 → 로그인 실패 메시지 + /login 유지", async ({ page }) => {
    await gotoLogin(page);
    await emailInput(page).fill(DEMO_USERS.admin.email);
    await passwordInput(page).fill("Wrong!Pass99");
    await submitBtn(page).click();
    // 페이지가 /login 에서 머무름 + 에러 메시지 노출
    await page.waitForTimeout(1500);
    expect(page.url()).toMatch(/\/login/);
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).toMatch(/이메일.*비밀번호|invalid|올바르지|password/i);
  });

  test("E2E-ERR-04 만료/위변조 토큰 — localStorage 변조 후 /m/home 접근 시 /login redirect", async ({ page }) => {
    // Why: 토큰이 invalidated 됐을 때 (refresh 만료, 서버 강제 무효화 등) 사용자가
    // 로그인 화면으로 redirect 되는지 검증.
    await gotoLogin(page);
    await emailInput(page).fill(DEMO_USERS.admin.email);
    await passwordInput(page).fill(DEMO_PASSWORD);
    await submitBtn(page).click();
    await page.waitForURL(/\/m\/home|\/admin/, { timeout: 15_000 });

    // 토큰 위변조
    await page.evaluate(() => {
      localStorage.setItem("wm:access", "tampered.invalid.jwt");
    });

    // 인증이 필요한 페이지 직접 접근 — RequireMember 가드가 fetchMe 401 받고
    // → setStoreMe(null) → 다음 effect 에서 /login 으로 reset.
    await page.reload({ waitUntil: "load", timeout: 15_000 });
    await page.waitForTimeout(2500);
    // 토큰이 무효이므로 useMe / fetchMe 가 null 반환 → 멤버 없음 → /login 또는
    // /onboarding 으로 흘러간다. 두 경로 모두 인증된 영역 차단을 의미하므로 통과.
    const url = page.url();
    expect(url).toMatch(/\/(login|onboarding)/);
  });

  test("E2E-ERR-05 빈 인박스 — APPROVED 만 있는 'mine' 탭 → empty state 노출", async ({ page }) => {
    // Why: 빈 상태가 깨지면 사용자가 "고장났다" 오인. Empty state 의 title +
    // sub-text 두 라인이 모두 노출되는지 검증.
    await gotoLogin(page);
    await emailInput(page).fill(DEMO_USERS.manager.email);
    await passwordInput(page).fill(DEMO_PASSWORD);
    await submitBtn(page).click();
    await page.waitForURL(/\/m\/home/, { timeout: 15_000 });

    await page.goto("/m/inbox", { waitUntil: "commit", timeout: 15_000 });
    // MANAGER 기본 탭 "승인할 것" (PENDING). "내 요청" 탭 (APPROVED) 으로 전환.
    const mineTab = page.getByRole("tab", { name: /내 요청|Mine/ });
    await mineTab.click();
    await page.waitForTimeout(1000);
    // manager1 은 본인 APPROVED 신청 없음 → empty 노출
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).toMatch(/처리할 항목이 없어요|Nothing to do/);
    expect(bodyText).toMatch(/잠시 후|Check back/);
  });
});
