/**
 * Test: pages/m-inbox · InboxPage
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  /v1/inbox 응답 스키마(target_type/status/requester_name)에 맞춰
 *       to-approve 탭이 PENDING 항목을 정확히 렌더해야 매니저가 한 탭으로
 *       승인 작업을 시작할 수 있어요.
 * Covers:
 *   - to-approve 탭이 BE 페이로드의 status === "PENDING" 두 건을 모두 렌더
 *   - inbox-item testid 두 개가 존재 (e2e/inbox-approve.spec.ts 와 동일 hook)
 *   - target_type → kind 라벨 매핑이 i18n 키로 노출
 * Out of scope:
 *   - 실제 API 응답 (MSW 미도입; fetchInbox mock)
 *   - 거절 시트 동작 (InboxQuickActions 별도 테스트)
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import { ToastProvider } from "@shared/ui";
import "@shared/i18n";

vi.mock("@entities/inbox", () => ({
  fetchInbox: vi.fn(async () => ({
    items: [
      {
        id: "task-leave-1",
        target_type: "LEAVE",
        target_id: "lr-1",
        status: "PENDING",
        requester_name: "김지은",
        summary: { kind: "leave", reason: "병원 진료" },
        created_at: "2026-05-04T01:00:00Z",
        decided_at: null,
      },
      {
        id: "task-ot-1",
        target_type: "OVERTIME",
        target_id: "ot-1",
        status: "PENDING",
        requester_name: "박지훈",
        summary: { kind: "overtime", reason: "장애 대응" },
        created_at: "2026-05-04T02:00:00Z",
        decided_at: null,
      },
      {
        id: "task-trip-decided",
        target_type: "TRIP",
        target_id: "trip-1",
        status: "APPROVED",
        requester_name: "이수정",
        summary: { kind: "trip" },
        created_at: "2026-05-03T01:00:00Z",
        decided_at: "2026-05-03T05:00:00Z",
      },
    ],
    next_cursor: null,
  })),
  approveInbox: vi.fn(),
  rejectInbox: vi.fn(),
}));

import { InboxPage } from "../index";

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <ToastProvider>
          <InboxPage />
        </ToastProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe("m-inbox page (BE payload shape)", () => {
  it("renders two PENDING tasks under the to-approve tab using BE fields", async () => {
    // Why: BE /v1/inbox returns {target_type, status, requester_name} — the
    // page must filter on `status === "PENDING"` (not the legacy `role`).
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByTestId("inbox-item")).toHaveLength(2);
    });
    expect(screen.getByText(/김지은/)).toBeInTheDocument();
    expect(screen.getByText(/박지훈/)).toBeInTheDocument();
  });
});
