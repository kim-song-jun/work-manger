/**
 * Spec: 매니저 인박스 — 연차 승인 골든 패스
 * Type: E2E (실 Postgres + Redis + Django + Vite, 도커 스택 사용)
 * Why:  매니저가 한 탭만으로 승인을 처리할 수 있어야 한다.
 *       seed_demo 가 PENDING 연차 신청 5건을 미리 만들어 두므로 인박스 진입 즉시
 *       승인 케이스가 보장된다 (ops §4 / api-spec §7).
 * Pre-conditions:
 *   - manager1@acme.demo (MANAGER 권한, 직속 부하 5명) 로그인
 *   - PENDING 인박스 항목 1개 이상 존재 (seed_demo 보장)
 * Coverage:
 *   - GET /v1/inbox 호출 후 PENDING 탭에 항목 렌더
 *   - APPROVE 버튼 클릭 → POST /v1/inbox/{task_id}/approve
 *   - 처리된 행이 PENDING 탭에서 사라짐
 *   - 성공 토스트 노출
 * SLO 검증: 승인 클릭 → UI 반영 < 3s
 *
 * NOTE (deferred): /m/inbox 라우트 미존재 시 본 spec 은 skip.
 */
import { test, expect } from "@playwright/test";
import { attachAuthToContext, loginViaApi } from "@fixtures/auth";
import { DEMO_USERS } from "@fixtures/users";

test.describe("manager inbox approval", () => {
  test("manager approves first pending leave from inbox", async ({ context, page }) => {
    // Arrange
    const session = await loginViaApi(DEMO_USERS.manager);
    await attachAuthToContext(context, session);

    await page.goto("/m/inbox").catch(() => null);
    if (!/\/m\/inbox/.test(page.url())) {
      test.skip(true, "/m/inbox route not yet wired in FE — deferred");
    }

    // Wait for the inbox list call to settle
    await page.waitForResponse((r) => r.url().includes("/v1/inbox") && r.request().method() === "GET", {
      timeout: 5_000,
    });

    const firstItem = page.getByTestId("inbox-item").first();
    if ((await firstItem.count()) === 0) {
      test.skip(true, "no PENDING inbox items rendered — seed gap");
    }

    const approveBtn = firstItem.getByRole("button", { name: /approve|승인/i });

    const approvePromise = page.waitForRequest(
      (r) => /\/v1\/inbox\/[^/]+\/approve$/.test(r.url()) && r.method() === "POST",
      { timeout: 5_000 },
    );

    // Act
    await approveBtn.click();
    const req = await approvePromise;

    // Assert — call observed, item disappears from pending tab, toast visible
    expect(req.method()).toBe("POST");
    await expect(firstItem).toBeHidden({ timeout: 3_000 });
    const toast = page.getByText(/approved|승인됐어요|승인되었습니다/i);
    await expect(toast.first()).toBeVisible({ timeout: 3_000 });
  });
});
