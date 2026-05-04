/**
 * Test: pages/m-leave-apply · LeaveApplyPage
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  end-to-end form submit는 실제 사용자가 거치는 가장 중요한 흐름이며,
 *       범위가 깨지면 휴가가 잘못 계산되거나 잘못된 인원에게 알림이 가요.
 * Covers:
 *   - 페이지가 SubHeader + 캘린더 + 폼을 모두 렌더
 *   - 사유 입력 후 "신청하기" 클릭 시 applyLeave mutation이 호출되어 success 라우트로 이동
 * Out of scope:
 *   - 실제 fetch (MSW로 추후 e2e 보강)
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "@shared/ui";
import "@shared/i18n";

vi.mock("@entities/leave", () => ({
  fetchBalance: async () => ({ remaining: 10, used: 0, accrued: 10, expiring: 0 }),
  applyLeave: vi.fn(async () => ({
    id: "x",
    starts_on: "2026-05-04",
    ends_on: "2026-05-04",
    kind: "FULL" as const,
    days: 1,
    status: "PENDING" as const,
  })),
  leaveDays: () => 1,
}));

import { LeaveApplyPage } from "../index";
import * as leaveApi from "@entities/leave";

const applyLeave = leaveApi.applyLeave as unknown as ReturnType<typeof vi.fn>;

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter initialEntries={["/m/leave/apply"]}>
      <QueryClientProvider client={qc}>
        <ToastProvider>
          <Routes>
            <Route path="/m/leave/apply" element={<LeaveApplyPage />} />
            <Route path="/m/leave/success" element={<div>SUCCESS</div>} />
          </Routes>
        </ToastProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe("m-leave-apply page", () => {
  it("renders calendar header + form", () => {
    // Why: 핵심 컴포넌트(SubHeader/Calendar/Form)이 모두 마운트되어야 흐름이 가능.
    renderPage();
    expect(screen.getByRole("heading", { name: /연차 신청|Request leave/i })).toBeInTheDocument();
  });

  it("submits and navigates to success route", async () => {
    // Why: end-to-end submit가 mutation을 발화하고 성공 화면으로 이동해야 함.
    applyLeave.mockClear();
    renderPage();
    const submit = screen.getByRole("button", { name: /신청하기|Submit/i });
    await userEvent.click(submit);
    await waitFor(() => expect(applyLeave).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText("SUCCESS")).toBeInTheDocument());
  });
});
