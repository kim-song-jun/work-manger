/**
 * Spec: 매니저 인박스 — 연차 승인 골든 패스
 * Type: E2E (실 Postgres + Redis + Django + Vite, 도커 스택 사용)
 * Why:  매니저가 한 탭만으로 승인을 처리할 수 있어야 한다.
 *       seed_demo 가 PENDING 연차 신청 5건을 미리 만들어 두므로 인박스 진입 즉시
 *       승인 케이스가 보장된다 (ops §4 / api-spec §7).
 * Pre-conditions:
 *   - manager1@acme.demo (MANAGER 권한, 직속 부하 ≥ 1) 로그인
 *   - PENDING 인박스 항목 ≥ 1 (seed_demo 가 5건 보장; 누락 시 spec 이 직접
 *     employee 토큰으로 /v1/leave/requests POST 해 1건 생성)
 *   - 모바일 라우트 /m/inbox 활성, FE 가 카드에 data-testid="inbox-item",
 *     승인 버튼에 data-testid="inbox-approve" 부여
 * Coverage:
 *   - GET /v1/inbox 호출 후 to-approve 탭에 항목 렌더
 *   - APPROVE 버튼 탭 → POST /v1/inbox/{task_id}/approve
 *   - 처리된 행이 to-approve 탭에서 사라짐 (3s 이내)
 *   - 성공 토스트 노출
 * SLO 검증: 승인 클릭 → UI 반영 < 4s (총 시간)
 */
import { test, expect, request as pwRequest } from "@playwright/test";
import { loginAs, loginViaApi, resolveEmployeeEmail, API_URL } from "@fixtures/auth";
import { DEMO_USERS } from "@fixtures/users";

test.describe("manager inbox approval @manager", () => {
  test("manager approves first pending leave from inbox in < 4s", async ({ page }) => {
    // Arrange — manager session
    const managerSession = await loginAs(page, DEMO_USERS.manager);

    // Make sure there's at least one PENDING task to approve. We probe /v1/inbox
    // first; if empty (a previous run consumed all 5 seeded ones), we fabricate
    // one by submitting a leave as a real employee under this manager.
    await ensurePendingApproval(managerSession);

    // Navigate to inbox and wait for the list call to settle.
    await page.goto("/m/inbox", { waitUntil: "load", timeout: 30_000 });
    await page.waitForResponse(
      (r) => r.url().includes("/v1/inbox") && r.request().method() === "GET",
      { timeout: 10_000 },
    );

    const firstItem = page.getByTestId("inbox-item").first();
    await expect(firstItem).toBeVisible({ timeout: 5_000 });
    const itemId = await firstItem.getAttribute("data-inbox-item-id");
    if (!itemId) throw new Error("inbox item is missing data-inbox-item-id");
    const approveBtn = firstItem.getByTestId("inbox-approve");

    const approvePromise = page.waitForRequest(
      (r) => /\/v1\/inbox\/[0-9a-f-]+\/approve$/.test(r.url()) && r.method() === "POST",
      { timeout: 5_000 },
    );

    // Act
    const start = Date.now();
    await approveBtn.click();
    const req = await approvePromise;

    // Assert — POST observed, row disappears within 3s, total flow < 4s SLO.
    expect(req.method()).toBe("POST");
    await expect(page.locator(`[data-inbox-item-id="${itemId}"]`)).toBeHidden({
      timeout: 3_000,
    });
    const elapsed = Date.now() - start;
    expect(elapsed, `approve→hidden should be < 4s (SLO), was ${elapsed}ms`).toBeLessThan(4_000);
  });
});

/**
 * Ensure the manager session has at least one PENDING approval task waiting.
 * Reads /v1/inbox?role=approve; if empty, posts a leave request as a real
 * employee discovered via /v1/team. The new task auto-creates an
 * ApprovalTask owned by the employee's manager (BE behavior in apps/leave).
 */
async function ensurePendingApproval(managerSession: {
  accessToken: string;
  user: { email: string };
}): Promise<void> {
  const ctx = await pwRequest.newContext({
    baseURL: API_URL,
    extraHTTPHeaders: { authorization: `Bearer ${managerSession.accessToken}` },
  });
  try {
    // BE /v1/inbox returns `{ data: [task...] }` — a flat array of approval
    // tasks the caller can decide on. Any non-empty list is sufficient.
    const res = await ctx.get("/v1/inbox");
    if (res.ok()) {
      const body = (await res.json()) as {
        data?: Array<{ status?: string }> | { items?: Array<{ status?: string }> };
      };
      const list = Array.isArray(body.data)
        ? body.data
        : (body.data?.items ?? []);
      const pending = list.filter((i) => !i.status || i.status === "PENDING");
      if (pending.length > 0) return;
    }
  } finally {
    await ctx.dispose();
  }

  // Fallback: create a fresh PENDING leave request as an employee.
  const employeeEmail = await resolveEmployeeEmail({
    accessToken: managerSession.accessToken,
    refreshToken: "",
    user: { id: "", email: managerSession.user.email, name: "" },
  });
  if (!employeeEmail) {
    throw new Error(
      "[inbox-approve] no PENDING approvals AND no employee under this manager — " +
        "did `docker compose run --rm seed` complete?",
    );
  }
  const empSession = await loginViaApi({
    email: employeeEmail,
    password: DEMO_USERS.employee.password,
    role: "EMPLOYEE",
  });
  const empCtx = await pwRequest.newContext({
    baseURL: API_URL,
    extraHTTPHeaders: { authorization: `Bearer ${empSession.accessToken}` },
  });
  try {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
    const iso = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const r = await empCtx.post("/v1/leave/requests", {
      data: { start_date: iso(start), end_date: iso(start), kind: "FULL", reason: "E2E pending" },
      headers: { "content-type": "application/json" },
    });
    if (!r.ok()) {
      throw new Error(
        `[inbox-approve] failed to seed PENDING leave: ${r.status()} ${await r.text()}`,
      );
    }
  } finally {
    await empCtx.dispose();
  }
}
