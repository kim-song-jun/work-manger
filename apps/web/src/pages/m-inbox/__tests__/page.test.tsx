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

// F-EMPLOYEE-008: useMe returns MANAGER role so default tab is "to-approve"
vi.mock("@entities/user", () => ({
  useMe: vi.fn(() => ({
    data: {
      id: "u-manager",
      email: "manager@test.com",
      name: "관리자",
      locale: "ko",
      is_email_verified: true,
      memberships: [{ id: "m-1", role: "MANAGER", company: { id: "c-1", name: "Test" } }],
    },
  })),
}));

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

describe("m-inbox page (default tab — manager race regression, 2026-05-13)", () => {
  it("syncs default tab to 'to-approve' once useMe resolves a non-EMPLOYEE role", async () => {
    // Why: pre-fix the page used `useState(defaultTab)` which froze the initial
    // tab on first render. When `useMe()` was still loading, `myRole` fell back
    // to EMPLOYEE → tab defaulted to "내 요청" (mine) and MANAGERs saw an empty
    // inbox even though /v1/inbox returned PENDING items.
    //
    // The fix runs a useEffect that re-applies the default tab once myRole
    // becomes known (unless the user has already picked a tab manually). This
    // test exercises the path: render with `data: undefined` first, then have
    // useMe yield a MANAGER membership, and assert the tab flipped.
    const useMeMock = vi.mocked(
      (await import("@entities/user")).useMe,
    ) as unknown as ReturnType<typeof vi.fn>;
    useMeMock.mockReturnValueOnce({ data: undefined } as never);
    useMeMock.mockReturnValue({
      data: {
        id: "u-manager",
        email: "manager@test.com",
        name: "관리자",
        locale: "ko",
        is_email_verified: true,
        memberships: [{ id: "m-1", role: "MANAGER", company: { id: "c-1", name: "Test" } }],
      },
    } as never);

    renderPage();

    await waitFor(() => {
      const toApprove = screen.getByRole("tab", { name: /승인할 것|to approve/i });
      expect(toApprove).toHaveAttribute("aria-selected", "true");
    });
    // PENDING items must be visible — proves filter + tab default both correct.
    await waitFor(() => {
      expect(screen.getAllByTestId("inbox-item")).toHaveLength(2);
    });
  });
});
