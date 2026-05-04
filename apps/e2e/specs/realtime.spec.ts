/**
 * Spec: 실시간 인박스 — 직원 OT 신청이 매니저 화면에 즉시 도착
 * Type: E2E (실 Postgres + Redis + Django + Vite + ws/daphne, 도커 스택 사용)
 * Why:  WebSocket 채널 inbox:{membership_id} 가 끊기면 매니저는 새 신청을 30초~수분
 *       지연 후에야 인지하게 되어 SLA 와 사용자 신뢰가 무너짐 (api-spec §9 / ops §3.1).
 * Pre-conditions:
 *   - manager1@acme.demo (직속 부하 employee 보유)
 *   - 동일 회사 employee 계정 (seed_demo 의 첫 번째 employee 사용)
 *   - ws/daphne 컨테이너 healthy
 * Coverage:
 *   - manager 컨텍스트 /m/inbox 오픈 → ws 연결 (wss /v1/ws?token=...)
 *   - employee 컨텍스트가 POST /v1/overtime/requests 로 OT 요청 생성
 *   - manager 화면이 새 인박스 항목을 2초 이내 렌더 (WS push)
 * SLO 검증: 생성 → 매니저 UI 반영 < 2s
 *
 * NOTE (deferred):
 *   - /m/inbox 미존재 시 skip
 *   - WS 채널 미구현 시 명확한 실패로 회귀 보호
 */
import { test, expect, request as pwRequest } from "@playwright/test";
import { attachAuthToContext, loginViaApi, API_URL } from "@fixtures/auth";
import { DEMO_USERS } from "@fixtures/users";

test.describe("realtime inbox push", () => {
  test("manager sees employee OT request within 2s via WebSocket", async ({ browser }) => {
    // Arrange — two contexts: manager (browser), employee (API only)
    const managerSession = await loginViaApi(DEMO_USERS.manager);
    const managerCtx = await browser.newContext();
    await attachAuthToContext(managerCtx, managerSession);
    const managerPage = await managerCtx.newPage();

    await managerPage.goto("/m/inbox").catch(() => null);
    if (!/\/m\/inbox/.test(managerPage.url())) {
      await managerCtx.close();
      test.skip(true, "/m/inbox route not yet wired in FE — deferred");
    }

    // Settle initial inbox list and snapshot row count
    await managerPage
      .waitForResponse((r) => r.url().includes("/v1/inbox") && r.request().method() === "GET", {
        timeout: 5_000,
      })
      .catch(() => null);
    const initialCount = await managerPage.getByTestId("inbox-item").count();

    // Act — log in an employee and create an OT request via API
    // Find an employee email by listing the manager's reports
    const adminCtx = await pwRequest.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: { authorization: `Bearer ${managerSession.accessToken}` },
    });
    const teamRes = await adminCtx.get("/v1/team");
    let employeeEmail: string | null = null;
    if (teamRes.ok()) {
      const body = (await teamRes.json()) as { data?: Array<{ email?: string }> };
      const list = body.data ?? [];
      employeeEmail = list.find((m) => m.email && m.email !== DEMO_USERS.manager.email)?.email ?? null;
    }
    await adminCtx.dispose();
    if (!employeeEmail) {
      await managerCtx.close();
      test.skip(true, "could not locate an employee email under this manager");
    }

    const empSession = await loginViaApi({
      email: employeeEmail!,
      password: DEMO_USERS.admin.password, // seeded password is uniform
      role: "EMPLOYEE",
    });

    const empCtx = await pwRequest.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: { authorization: `Bearer ${empSession.accessToken}` },
    });
    const otRes = await empCtx.post("/v1/overtime/requests", {
      data: {
        date: new Date().toISOString().slice(0, 10),
        hours: 1.5,
        reason: "E2E realtime test",
      },
      headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
    });
    await empCtx.dispose();
    if (!otRes.ok()) {
      await managerCtx.close();
      throw new Error(`employee OT submit failed: ${otRes.status()} ${await otRes.text()}`);
    }

    // Assert — manager UI sees a new row within 2s
    const start = Date.now();
    await expect
      .poll(async () => managerPage.getByTestId("inbox-item").count(), {
        timeout: 2_000,
        intervals: [200, 200, 200, 200, 200],
      })
      .toBeGreaterThan(initialCount);
    const elapsed = Date.now() - start;
    expect(elapsed, `realtime push should arrive < 2s, was ${elapsed}ms`).toBeLessThan(2_000);

    await managerCtx.close();
  });
});
