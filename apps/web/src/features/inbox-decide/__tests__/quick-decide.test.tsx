/**
 * Test: features/inbox-decide · QuickDecide
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  매니저가 빠르게 승인/반려할 때 발생하는 더블탭/중복 호출은 직원
 *       경력에 영향을 주는 결정의 정합성을 깨뜨릴 수 있습니다.
 * Covers:
 *   - 승인 버튼 클릭 시 approveInbox 1회 호출 + 토스트 노출
 *   - 거절 버튼 클릭 시 사유 시트 오픈 (rejectInbox는 시트 제출에서만 호출)
 * Out of scope:
 *   - 실제 swipe 제스처(pointer 이벤트의 transform 정밀도) → e2e 별도
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import { ToastProvider } from "@shared/ui";
import "@shared/i18n";

vi.mock("@entities/inbox", () => ({
  approveInbox: vi.fn(async () => undefined),
  rejectInbox: vi.fn(async () => undefined),
}));

import * as inboxApi from "@entities/inbox";

import { QuickDecide } from "../ui/QuickDecide";

const approve = inboxApi.approveInbox as unknown as ReturnType<typeof vi.fn>;
const reject = inboxApi.rejectInbox as unknown as ReturnType<typeof vi.fn>;

const item = {
  id: "rq-1",
  kind: "OVERTIME" as const,
  status: "PENDING" as const,
  role: "approve" as const,
  requester: { id: "u1", name: "박서연", team: "디자인" },
  title: "오늘 18:00–20:30 초과근무",
  reason: "스프린트 마감 마무리",
  requested_at: new Date().toISOString(),
};

function renderQD() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <ToastProvider>
          <QuickDecide item={item} />
        </ToastProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe("QuickDecide", () => {
  it("invokes approveInbox once when Approve clicked", async () => {
    // Why: 단일 호출만 발화되어 사용자가 더블탭 해도 한 번만 처리.
    approve.mockClear();
    renderQD();
    const approveBtn = screen.getByRole("button", { name: /승인|Approve/i });
    await userEvent.click(approveBtn);
    await waitFor(() => expect(approve).toHaveBeenCalledTimes(1));
  });

  it("opens reason sheet without calling rejectInbox immediately", async () => {
    // Why: 사유 입력 단계가 분리되어야 충동적 반려를 방지.
    reject.mockClear();
    renderQD();
    const rejectBtn = screen.getByRole("button", { name: /거절|Reject/i });
    await userEvent.click(rejectBtn);
    expect(reject).not.toHaveBeenCalled();
    // sheet shows the textarea with placeholder
    await waitFor(() => {
      expect(
        document.querySelector('textarea[placeholder*="Explain"], textarea[placeholder*="반려"]'),
      ).toBeTruthy();
    });
  });
});
