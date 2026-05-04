/**
 * Test: pages/web-inbox · WebInboxPage
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  통합 인박스는 매니저의 1일 1회 이상 동선. 리스트 → 상세 → 승인 플로우가
 *       깨지면 결재가 멈춘다. 세 윈도우 (필터 / 리스트 / 상세) 의 데이터 바인딩과
 *       승인 mutation 호출을 회귀 보호한다.
 * Covers:
 *   - 리스트가 fetch 결과를 렌더한다 (요청자명 + 제목)
 *   - 행 선택 시 상세 패널이 해당 항목을 보여준다
 *   - 승인 버튼 클릭 시 POST /v1/inbox/:id/approve 가 호출된다
 * Out of scope:
 *   - 실시간 WS 이벤트 (별도 hook 단위 테스트로 보강 예정)
 *   - 권한 (admin) 분기 — entity test 가 다룸
 * Coverage target: ≥ 70% lines for WebInbox + decideInbox
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@shared/ui";
import "@shared/i18n";
import { WebInboxPage } from "./index";

type Recorded = { url: string; init?: RequestInit };

function setupFetch(items: unknown[]) {
  const calls: Recorded[] = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    calls.push({ url, init });
    if (url.includes("/v1/inbox") && (!init || init.method === undefined || init.method === "GET")) {
      return new Response(JSON.stringify({ data: items }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.includes("/v1/me")) {
      return new Response(
        JSON.stringify({ data: { id: "u1", email: "u@x", memberships: [] } }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (url.match(/\/v1\/inbox\/.+\/approve/)) {
      return new Response(JSON.stringify({ data: { ok: true } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
  });
  vi.spyOn(window, "fetch").mockImplementation(fetchMock as unknown as typeof fetch);
  return { calls };
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <MemoryRouter initialEntries={["/web/inbox"]}>
          <WebInboxPage />
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe("WebInboxPage", () => {
  beforeEach(() => {
    // jsdom has no WebSocket; stub a no-op constructor so useInboxStream is a noop.
    (globalThis as unknown as { WebSocket?: unknown }).WebSocket = class {
      addEventListener() { /* noop */ }
      close() { /* noop */ }
    } as unknown as typeof WebSocket;
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the list returned by /v1/inbox", async () => {
    setupFetch([
      {
        id: "rq-1",
        kind: "LEAVE",
        status: "PENDING",
        role: "approve",
        requester: { id: "u2", name: "박서연", team: "디자인" },
        title: "5월 2일 연차",
        reason: "가족 여행",
        requested_at: "2026-04-22T11:18:00Z",
      },
    ]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId("inbox-row-rq-1")).toBeInTheDocument();
    });
    expect(screen.getAllByText(/박서연/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/5월 2일 연차/).length).toBeGreaterThan(0);
  });

  it("approves the selected item", async () => {
    const { calls } = setupFetch([
      {
        id: "rq-1",
        kind: "LEAVE",
        status: "PENDING",
        role: "approve",
        requester: { id: "u2", name: "박서연" },
        title: "5월 2일",
        requested_at: "2026-04-22T11:18:00Z",
      },
    ]);
    renderPage();
    await waitFor(() => screen.getByTestId("inbox-row-rq-1"));
    await userEvent.click(screen.getByTestId("inbox-row-rq-1"));
    await userEvent.click(await screen.findByTestId("inbox-approve"));
    await waitFor(() => {
      expect(calls.some((c) => c.url.includes("/v1/inbox/rq-1/approve"))).toBe(true);
    });
  });
});
