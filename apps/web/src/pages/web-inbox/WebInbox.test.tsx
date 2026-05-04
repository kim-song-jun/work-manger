/**
 * Test: pages/web-inbox · WebInboxPage
 * Type: Unit (vitest + RTL, jsdom, msw)
 * Why:  통합 인박스는 매니저의 1일 1회 이상 동선. 리스트 → 상세 → 승인 플로우가
 *       깨지면 결재가 멈춘다. 세 윈도우 (필터 / 리스트 / 상세) 의 데이터 바인딩과
 *       승인 mutation 호출을 회귀 보호한다.
 * Covers:
 *   - 리스트가 fetch 결과를 렌더한다 (요청자명 + 제목)
 *   - 승인 버튼 클릭 시 POST /v1/inbox/:id/approve 가 호출된다
 * Out of scope:
 *   - 실시간 WS 이벤트 (별도 hook 단위 테스트로 보강 예정)
 *   - 권한 (admin) 분기 — entity test 가 다룸
 * Coverage target: ≥ 70% lines for WebInbox + decideInbox
 */
import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HttpResponse, http } from "msw";
import { ToastProvider } from "@shared/ui";
import "@shared/i18n";
import { server } from "@/test/msw/server";
import { WebInboxPage } from "./index";

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

  it("renders the list returned by /v1/inbox", async () => {
    server.use(
      http.get("*/v1/inbox", () =>
        HttpResponse.json({
          data: [
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
          ],
        }),
      ),
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId("inbox-row-rq-1")).toBeInTheDocument();
    });
    expect(screen.getAllByText(/박서연/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/5월 2일 연차/).length).toBeGreaterThan(0);
  });

  it("approves the selected item", async () => {
    let approved = false;
    server.use(
      http.get("*/v1/inbox", () =>
        HttpResponse.json({
          data: [
            {
              id: "rq-1",
              kind: "LEAVE",
              status: "PENDING",
              role: "approve",
              requester: { id: "u2", name: "박서연" },
              title: "5월 2일",
              requested_at: "2026-04-22T11:18:00Z",
            },
          ],
        }),
      ),
      http.post("*/v1/inbox/rq-1/approve", () => {
        approved = true;
        return HttpResponse.json({ data: { ok: true } });
      }),
    );

    renderPage();
    await waitFor(() => screen.getByTestId("inbox-row-rq-1"));
    await userEvent.click(screen.getByTestId("inbox-row-rq-1"));
    await userEvent.click(await screen.findByTestId("inbox-approve"));
    await waitFor(() => {
      expect(approved).toBe(true);
    });
  });
});
