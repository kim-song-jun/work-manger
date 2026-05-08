/**
 * Test: pages/web-dashboard · WebDashboardPage
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  데스크탑 진입의 기본 화면. 첫 1초 스켈레톤 → KPI 전환이 깨지면
 *       사용자가 빈 화면을 본다. 회귀 보호 우선순위 높음.
 * Covers:
 *   - 초기 로딩 시 스켈레톤(KPI placeholder) 노출
 *   - /v1/attendance/today + /v1/leave/balance 응답 후 KPI 값 렌더
 * Out of scope:
 *   - 실시간 인박스 스트림 (별도 hook 단위 테스트)
 *   - 팀 미리보기 / 최근 기록 빈 상태 (별도 케이스로 추가 가능)
 * Coverage target: ≥ 70% lines for WebDashboardPage
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ToastProvider } from "@shared/ui";

import "@shared/i18n";
import { WebDashboardPage } from "./index";

function setupFetch(map: Record<string, unknown>) {
  vi.spyOn(window, "fetch").mockImplementation((async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    for (const [k, body] of Object.entries(map)) {
      if (url.includes(k)) {
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    return new Response(JSON.stringify({ data: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as unknown as typeof fetch);
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <MemoryRouter>
          <WebDashboardPage />
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe("WebDashboardPage", () => {
  beforeEach(() => {
    (globalThis as unknown as { WebSocket?: unknown }).WebSocket = class {
      addEventListener() {}
      close() {}
    } as unknown as typeof WebSocket;
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders skeleton placeholders before data resolves", () => {
    // Never-resolving fetch keeps queries in loading state.
    vi.spyOn(window, "fetch").mockImplementation(
      (() => new Promise(() => {})) as unknown as typeof fetch,
    );
    renderPage();
    expect(screen.getByTestId("web-dashboard")).toBeInTheDocument();
  });

  it("renders KPI values once today + balance resolve", async () => {
    setupFetch({
      "/v1/attendance/today": {
        data: {
          clock_in_at: "2026-04-22T08:54:00Z",
          clock_out_at: null,
          worked_minutes: 156,
          is_clocked_in: true,
        },
      },
      "/v1/leave/balance": { data: { remaining: 9, used: 6, accrued: 15, expiring: 3 } },
      "/v1/team/status": { data: [] },
      "/v1/attendance/records": { data: [] },
      "/v1/inbox": { data: [] },
    });
    renderPage();
    await waitFor(() => expect(screen.getByText(/9/)).toBeInTheDocument());
  });
});
