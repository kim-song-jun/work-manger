/**
 * Test: pages/m-leave-apply · LeaveApplyPage
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  end-to-end form submit는 실제 사용자가 거치는 가장 중요한 흐름이며,
 *       범위가 깨지면 휴가가 잘못 계산되거나 잘못된 인원에게 알림이 가요.
 *       또 calendar↔RHF 동기화가 깨지면 사용자가 캘린더에서 고른 날짜가
 *       제출 본문에 포함되지 않아 BE 가 today 만 받게 됩니다.
 * Covers:
 *   - 페이지가 SubHeader + 캘린더 + 폼을 모두 렌더
 *   - 사유 입력 후 "신청하기" 클릭 시 applyLeave mutation이 호출되어 success 라우트로 이동
 *   - 캘린더에서 시작/종료 일자 두 번 클릭 후 제출 시 mutation 본문에 picked dates가 포함
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
    start_date: "2026-05-04",
    end_date: "2026-05-04",
    kind: "FULL" as const,
    days: 1,
    status: "PENDING" as const,
  })),
  leaveDays: () => 1,
}));

import * as leaveApi from "@entities/leave";

import { LeaveApplyPage } from "../index";

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

  it("syncs calendar picks into RHF and submits picked dates", async () => {
    // Why: B5 회귀 — 사용자가 캘린더에서 고른 날짜가 제출 body 에 반영
    //      되지 않으면 BE 는 today 만 보고 예측 못 할 휴가 차감을 한다.
    applyLeave.mockClear();
    renderPage();

    // Calendar renders day cells as <button>$N</button>. Pick two days
    // that always exist in any month (1, 2). Exact regex avoids matching
    // "12", "21" etc.
    const day1 = screen.getAllByRole("button", { name: /^1$/ })[0];
    const day2 = screen.getAllByRole("button", { name: /^2$/ })[0];
    await userEvent.click(day1);
    await userEvent.click(day2);

    const submit = screen.getByRole("button", { name: /신청하기|Submit/i });
    await userEvent.click(submit);

    await waitFor(() => expect(applyLeave).toHaveBeenCalledTimes(1));
    const body = applyLeave.mock.calls[0][0] as {
      start_date: string;
      end_date: string;
    };
    // Day-of-month should match what we clicked (zero-padded).
    expect(body.start_date.endsWith("-01")).toBe(true);
    expect(body.end_date.endsWith("-02")).toBe(true);
  });
});
