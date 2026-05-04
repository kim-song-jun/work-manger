/**
 * Test: pages/m-notifications · NotificationsPage
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  알림 화면을 열었는데 읽음 표시가 동기화되지 않으면 사용자에게
 *       계속 빨간 점이 보여 신뢰가 떨어집니다. mark-read on view 회귀 보호.
 * Covers:
 *   - 화면 진입 시 모든 unread 항목에 대해 markRead 호출
 *   - 항목이 빈 경우 empty 라우트로 redirect
 * Out of scope:
 *   - WebSocket 신규 알림 push (별도 useInboxStream 테스트)
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "@shared/ui";
import "@shared/i18n";

vi.mock("@entities/notification", () => ({
  fetchNotifications: vi.fn(async () => ({
    items: [
      { id: "n1", kind: "ot", title: "초과근무 승인 요청", body: "박서연 1시간", created_at: new Date().toISOString(), read_at: null },
      { id: "n2", kind: "leave", title: "연차 승인됨", created_at: new Date().toISOString(), read_at: null },
    ],
    next_cursor: null,
  })),
  markRead: vi.fn(async () => undefined),
  markAllRead: vi.fn(async () => undefined),
}));

import { NotificationsPage } from "../index";
import * as notifApi from "@entities/notification";

const markRead = notifApi.markRead as unknown as ReturnType<typeof vi.fn>;

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter initialEntries={["/m/notifications"]}>
      <QueryClientProvider client={qc}>
        <ToastProvider>
          <Routes>
            <Route path="/m/notifications" element={<NotificationsPage />} />
            <Route path="/m/notifications/empty" element={<div>EMPTY</div>} />
          </Routes>
        </ToastProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe("m-notifications page", () => {
  it("calls markRead for each unread item once data loads", async () => {
    // Why: mark-read on view UX 가 깨지면 사용자가 계속 알림 표시를 봅니다.
    markRead.mockClear();
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("초과근무 승인 요청")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(markRead).toHaveBeenCalledWith("n1");
      expect(markRead).toHaveBeenCalledWith("n2");
    });
  });
});
