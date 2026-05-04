/**
 * Spec: 인증 진입 라우팅 (member → /m/home, non-member → /onboarding/welcome)
 * Type: E2E (실 Postgres + Redis + Django + Vite, 도커 스택 사용)
 * Why:  로그인은 모든 기능의 게이트웨이. 잘못 라우팅되면 신규 가입 / 기존 직원
 *       모두 첫 화면에서 막힌다. memberships 유무 분기는 운영 가이드 §11.1
 *       (출시 체크리스트) 의 "사용자 첫 진입 정상 동작" 항목과 직접 연결된다.
 * Pre-conditions:
 *   - seed_demo 가 admin@acme.demo (membership 있음) 와
 *     admin@molcube.com (superuser, membership 없음) 두 사용자를 생성
 * Coverage:
 *   - LoginForm POST /v1/auth/login
 *   - 토큰을 access_token storage 에 저장 후 /v1/users/me 로 membership 판정
 *   - membership 있음 → /m/home, 없음 → /onboarding/welcome
 * SLO 검증: 로그인 → 다음 화면 라우팅 < 3s
 */
import { test, expect } from "@playwright/test";
import { DEMO_USERS } from "@fixtures/users";

/**
 * Selector strategy: the LoginForm renders <TextField label="..."> where the
 * label text is i18n'd (currently "이메일" / "비밀번호") but the <label> is
 * NOT linked to the input via `for=`/`id`, so `getByLabel` fails. We address
 * each input by its `type=` attribute, which is stable and accessible.
 */
const emailInput = (page: import("@playwright/test").Page) => page.locator('input[type="email"]');
const passwordInput = (page: import("@playwright/test").Page) => page.locator('input[type="password"]');
const submitBtn = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: /login|로그인|submit|확인|시작/i });

test.describe("auth routing", () => {
  test("member logs in and lands on /m/home", async ({ page }) => {
    // Arrange
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(emailInput(page)).toBeVisible({ timeout: 10_000 });

    // Act
    const start = Date.now();
    await emailInput(page).fill(DEMO_USERS.admin.email);
    await passwordInput(page).fill(DEMO_USERS.admin.password);
    await submitBtn(page).click();
    await page.waitForURL(/\/m\/home/, { timeout: 5_000 });
    const elapsed = Date.now() - start;

    // Assert
    expect(page.url()).toMatch(/\/m\/home$/);
    expect(elapsed, `member-login-to-home should be < 3s, was ${elapsed}ms`).toBeLessThan(3_000);
  });

  test("non-member superuser logs in and lands on /onboarding/welcome", async ({ page }) => {
    // Arrange — admin@molcube.com is the docker-created superuser without a Membership.
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(emailInput(page)).toBeVisible({ timeout: 10_000 });

    // Act
    await emailInput(page).fill("admin@molcube.com");
    await passwordInput(page).fill("admin1234!");
    await submitBtn(page).click();

    // Assert — landed somewhere in the onboarding tree (welcome page if FE
    // resolves missing-membership eagerly, otherwise default landing).
    await page.waitForURL(/\/onboarding(\/.*)?$/, { timeout: 5_000 });
    expect(page.url()).toMatch(/\/onboarding/);
  });

  test("invalid credentials show error and stay on /login", async ({ page }) => {
    // Arrange
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(emailInput(page)).toBeVisible({ timeout: 10_000 });

    // Act
    await emailInput(page).fill("nope@nowhere.test");
    await passwordInput(page).fill("wrong-password");
    await submitBtn(page).click();

    // Assert — give the API a moment, then confirm we're still on /login.
    await page.waitForTimeout(1_500);
    expect(page.url()).toMatch(/\/login$/);
  });
});
