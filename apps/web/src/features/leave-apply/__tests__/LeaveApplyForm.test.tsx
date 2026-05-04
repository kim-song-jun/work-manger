/**
 * Test: features/leave-apply · LeaveApplyForm
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  연차 신청 폼은 잘못된 입력(종료 < 시작, 잔여 초과)으로
 *       서버 호출을 발생시키면 실수로 휴가가 차감되거나 사용자 신뢰가
 *       깨질 수 있어 클라이언트 검증 회귀를 막아야 합니다. BE 키
 *       (`start_date`/`end_date`) 정합성도 함께 보호합니다.
 * Covers:
 *   - 종료일이 시작일보다 이전이면 zod refine가 invalid_dates 에러를 노출
 *   - 종류(SegmentedControl)에서 오전 반차 선택 시 폼 상태가 갱신
 * Out of scope:
 *   - 백엔드 통합 응답 검증 → MSW 도입 후 별도 e2e
 *   - Sheet 애니메이션 → 시각 회귀 도구로 검증
 * Coverage target: 80%+ for LeaveApplyForm.tsx core branches.
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@shared/ui";
import { LeaveApplyForm } from "../ui/LeaveApplyForm";
import "@shared/i18n";

vi.mock("@entities/leave", async () => {
  return {
    fetchBalance: async () => ({ remaining: 10, used: 0, accrued: 10, expiring: 0 }),
    applyLeave: vi.fn(async () => null),
    leaveDays: ({ kind, start_date, end_date }: { kind: string; start_date: string; end_date: string }) => {
      if (kind !== "FULL") return 0.5;
      const a = new Date(start_date).getTime();
      const b = new Date(end_date).getTime();
      return Math.floor((b - a) / 86400000) + 1;
    },
  };
});

function renderWithProviders(ui: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <ToastProvider>{ui}</ToastProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe("LeaveApplyForm", () => {
  it("rejects end-date before start-date", async () => {
    // Why: 일관된 zod refine를 통해 사용자가 잘못된 기간으로 제출하지 못하도록 보장.
    renderWithProviders(<LeaveApplyForm />);
    const inputs = screen.getAllByDisplayValue(new Date().toISOString().slice(0, 10));
    // first is start_date, second is end_date
    await userEvent.clear(inputs[1]);
    await userEvent.type(inputs[1], "1900-01-01");
    const submit = screen.getByRole("button", { name: /신청하기|submit/i });
    await userEvent.click(submit);
    await waitFor(() => {
      // The form surfaces the message via FormField error slot.
      // i18n key invalid_dates resolves to 한국어 "이후" or English "after start".
      expect(document.body.textContent ?? "").toMatch(/이후|after start|invalid/i);
    });
  });

  it("supports kind selection switching to AM_HALF", async () => {
    // Why: 반차 선택 시 사용 일수 계산이 0.5로 바뀌므로 RHF Controller 가
    //      값을 정확히 갱신해야 합니다.
    renderWithProviders(<LeaveApplyForm />);
    const am = screen.getByRole("tab", { name: /오전 반차|AM half/i });
    await userEvent.click(am);
    expect(am).toHaveAttribute("aria-selected", "true");
  });
});
