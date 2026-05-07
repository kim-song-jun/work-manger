/**
 * Spec: 실시간 인박스 — 직원 OT 신청이 매니저 화면에 즉시 도착
 * Type: E2E (실 Postgres + Redis + Django + Vite + ws/daphne, 도커 스택 사용)
 * Why:  WebSocket 채널 inbox:{membership_id} 가 끊기면 매니저는 새 신청을 30초~수분
 *       지연 후에야 인지하게 되어 SLA 와 사용자 신뢰가 무너짐 (api-spec §9 / ops §3.1).
 * Pre-conditions:
 *   - manager1@acme.demo (직속 부하 employee 보유)
 *   - 동일 회사 employee 계정 (resolveEmployeeEmail 로 동적 검색)
 *   - ws/daphne 컨테이너 healthy
 *   - 모바일 라우트 /m/inbox 활성, FE 카드에 data-testid="inbox-item"
 * Coverage:
 *   - manager 컨텍스트 /m/inbox 오픈 → ws 연결 (wss /v1/ws?token=...)
 *   - employee 컨텍스트가 POST /v1/overtime/requests 로 OT 요청 생성
 *   - manager 화면이 새 인박스 항목을 2초 이내 렌더 (WS push → query refetch)
 * SLO 검증: 생성 → 매니저 UI 반영 < 2s
 */
import { test, expect, request as pwRequest } from "@playwright/test";
import { loginAs, loginViaApi, resolveEmployeeEmail, API_URL } from "@fixtures/auth";
import { DEMO_USERS } from "@fixtures/users";

test.describe("realtime inbox push @manager", () => {
  test("manager sees employee OT request within 2s via WebSocket", async ({ browser }) => {
    // Arrange — manager browser context with programmatic auth
    const managerCtx = await browser.newContext();
    const managerPage = await managerCtx.newPage();
    const managerSession = await loginAs(managerPage, DEMO_USERS.manager);
    const wsReady = managerPage.waitForEvent("websocket", { timeout: 5_000 }).catch(() => null);

    await managerPage.goto("/m/inbox", { waitUntil: "load", timeout: 30_000 });
    await expect(managerPage).toHaveURL(/\/m\/inbox/);
    await wsReady;

    // Settle initial inbox list and snapshot row count
    await managerPage
      .waitForResponse(
        (r) => r.url().includes("/v1/inbox") && r.request().method() === "GET",
        { timeout: 10_000 },
      )
      .catch(() => null);
    const initialCount = await managerPage.getByTestId("inbox-item").count();

    // Resolve an EMPLOYEE-role member under this manager (or any in the company).
    const employeeEmail = await resolveEmployeeEmail(managerSession);
    if (!employeeEmail) {
      await managerCtx.close();
      throw new Error("[realtime] could not locate an employee email under this manager");
    }
    const empSession = await loginViaApi({
      email: employeeEmail,
      password: DEMO_USERS.employee.password,
      role: "EMPLOYEE",
    });

    // Act — employee submits an OT request via API. The OT serializer expects
    // `work_date` (YYYY-MM-DD) + `requested_minutes` + optional `reason`.
    const empApi = await pwRequest.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: { authorization: `Bearer ${empSession.accessToken}` },
    });

    // The FE invalidates ["inbox"] on push → refetch hits /v1/inbox.
    const start = Date.now();
    const otRes = await empApi.post("/v1/overtime/requests", {
      data: {
        work_date: new Date().toISOString().slice(0, 10),
        requested_minutes: 90,
        reason: "E2E realtime test",
      },
      headers: { "content-type": "application/json" },
    });
    await empApi.dispose();
    if (!otRes.ok()) {
      await managerCtx.close();
      throw new Error(`employee OT submit failed: ${otRes.status()} ${await otRes.text()}`);
    }

    // Wait for either the WS-triggered refetch OR the row count delta — whichever
    // arrives within the SLO window.
    await expect
      .poll(async () => managerPage.getByTestId("inbox-item").count(), {
        timeout: 2_000,
        intervals: [100, 100, 100, 100, 100, 200, 200, 200, 200],
      })
      .toBeGreaterThan(initialCount);
    const elapsed = Date.now() - start;

    // Assert
    expect(elapsed, `realtime push should arrive < 2s, was ${elapsed}ms`).toBeLessThan(2_000);

    await managerCtx.close();
  });
});
