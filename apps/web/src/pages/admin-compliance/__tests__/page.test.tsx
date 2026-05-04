/**
 * Test: pages/admin-compliance · AdminCompliancePage
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  관리자 보드는 회사 전체 주간 누적을 한눈에 보여주므로 행 렌더링과
 *       상태별 색상이 어긋나면 운영 결정에 영향을 준다. mocked GET 응답으로
 *       테이블 렌더링과 status 셀 data-status 속성을 회귀 보호한다.
 * Covers:
 *   - 인증된 응답에서 회사 멤버 행이 렌더링된다
 *   - status 셀에 data-status 속성이 정확히 매핑된다 (WARN/OVER)
 * Out of scope:
 *   - 정렬 로직 (서버 사이드)
 *   - bulk message 실제 전송 (현재는 stub)
 * Coverage target: 행 렌더링 + status 매핑
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@shared/i18n";
import { AdminCompliancePage } from "../index";
import { setAccessToken } from "@shared/api";

function makeResponse(body: unknown, init: { ok?: boolean; status?: number } = {}): Response {
  const text = body === undefined ? "" : JSON.stringify(body);
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    text: () => Promise.resolve(text),
  } as unknown as Response;
}

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <AdminCompliancePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("pages/admin-compliance · AdminCompliancePage", () => {
  beforeEach(() => setAccessToken(null));
  afterEach(() => vi.restoreAllMocks());

  it("renders rows from /v1/admin/compliance/52h with status pills", async () => {
    vi.spyOn(window, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url.includes("/v1/admin/compliance/52h")) {
        return Promise.resolve(
          makeResponse({
            data: {
              week_start: "2026-04-27",
              threshold_hours: "52",
              members: [
                {
                  membership_id: "m-over",
                  name: "이도현",
                  department: "엔지니어링",
                  role: "EMPLOYEE",
                  hours: "53.00",
                  threshold_hours: "52",
                  remaining_hours: "0",
                  status: "OVER",
                },
                {
                  membership_id: "m-warn",
                  name: "윤소라",
                  department: "디자인",
                  role: "MANAGER",
                  hours: "49.50",
                  threshold_hours: "52",
                  remaining_hours: "2.50",
                  status: "WARN",
                },
              ],
            },
          }),
        );
      }
      return Promise.reject(new Error(`unmocked: ${url}`));
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("이도현")).toBeInTheDocument();
      expect(screen.getByText("윤소라")).toBeInTheDocument();
    });
    const overPill = screen.getByTestId("status-m-over");
    const warnPill = screen.getByTestId("status-m-warn");
    expect(overPill.getAttribute("data-status")).toBe("OVER");
    expect(warnPill.getAttribute("data-status")).toBe("WARN");
  });
});
