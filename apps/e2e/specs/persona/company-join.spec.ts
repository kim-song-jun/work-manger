/**
 * Spec: 회사 코드 가입 플로우 (iter13 T4)
 * Type: E2E (실 Postgres + Redis + Django + Vite, 도커 스택 사용)
 * Why:  신규 직원이 처음 받는 안내가 "회사 이메일로 가입 → 6자리 코드 입력".
 *       이 플로우가 끊기면 신규 입사자가 단 한 명도 회사에 합류할 수 없다
 *       (ops §11.1 "사용자 첫 진입 정상 동작").
 * Pre-conditions:
 *   - seed_demo 가 ACMEDM 코드 + Acme 회사 생성
 *   - /signup, /login, /onboarding/* 라우트 활성
 * Coverage:
 *   - /signup — 신규 계정 생성 (랜덤 이메일)
 *   - /login — 신규 계정 로그인 → /onboarding/welcome
 *   - /onboarding/company-code — 6자리 코드 입력 → POST /v1/onboarding/join-company
 *   - 응답 201 검증 → /onboarding/profile 라우트 진입
 *
 * Note: onboarding.spec.ts 가 전체 happy-path 를 다루므로, 이 스펙은 "회사 코드
 * 가입" 단일 단계까지만 좁혀 검증한다 (T4 task 분담 — onboarding.spec.ts 와의
 * 중복을 피해 재현 비용을 낮춤).
 */
import { test, expect } from "@playwright/test";
import { DEMO_COMPANY_CODE } from "@fixtures/users";

test.describe("persona: company-join @persona @new-user", () => {
  test("new account → enter company code → joins Acme", async ({ page }, testInfo) => {
    const nonce = `${testInfo.project.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const email = `e2e-cjoin-${nonce}@example.test`;
    const password = "StrongPass!9";

    // 1) Sign up.
    await page.goto("/signup", { waitUntil: "load", timeout: 120_000 });
    await page.waitForFunction(
      () => document.querySelectorAll("input").length >= 3,
      null,
      { timeout: 120_000 },
    );
    const signupInputs = page.locator("input");
    await signupInputs.nth(0).fill("E2E CJoin");
    await signupInputs.nth(1).fill(email);
    await signupInputs.nth(2).fill(password);
    await page.locator("button").last().click();
    await page.waitForURL(/\/login$/, { timeout: 30_000 });

    // 2) Log in with the new account.
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.locator("button").last().click();
    await page.waitForURL(/\/onboarding\/welcome$/, { timeout: 30_000 });

    // 3) Welcome → company-code page.
    await page.locator("button").last().click();
    await page.waitForURL(/\/onboarding\/company-code$/, { timeout: 30_000 });

    // 4) Enter ACMEDM into the 6-char input grid.
    const codeInputs = page.locator('input[aria-label^="Code character"]');
    await expect(codeInputs).toHaveCount(6);
    for (let i = 0; i < DEMO_COMPANY_CODE.length; i += 1) {
      await codeInputs.nth(i).fill(DEMO_COMPANY_CODE[i]);
    }
    const joinResp = page.waitForResponse(
      (res) =>
        res.url().includes("/v1/onboarding/join-company") &&
        res.request().method() === "POST",
      { timeout: 10_000 },
    );
    await page.locator("button").last().click();
    const resp = await joinResp;
    expect(resp.status(), "join-company should return 201").toBe(201);

    // 5) Lands on /onboarding/profile.
    await page.waitForURL(/\/onboarding\/profile$/, { timeout: 30_000 });
    await expect(page).toHaveURL(/\/onboarding\/profile$/);
  });
});
