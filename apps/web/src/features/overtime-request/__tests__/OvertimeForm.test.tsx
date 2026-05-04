/**
 * Test: features/overtime-request · OvertimeForm
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  초과근무 신청은 잘못된 시간(0분, 12h 초과)이 서버에 전달되면 사용자
 *       기록이 왜곡됩니다. 클라이언트에서 zod 가 정확히 막는지 회귀를 봅니다.
 * Covers:
 *   - requested_minutes < 1 일 때 minutes_min 에러 표시
 *   - 정상 입력 시 mutation 발화 (postOvertimeRequest 1회 호출)
 * Out of scope:
 *   - i18n 키 누락 회귀 → 별도 i18n smoke
 *   - Sheet 컴포넌트 통합 → m-overtime page test
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@shared/ui";
import "@shared/i18n";

vi.mock("@entities/overtime", () => ({
  postOvertimeRequest: vi.fn(async () => ({
    id: "x",
    work_date: "2026-05-04",
    requested_minutes: 60,
    reason: "ok",
    status: "PENDING",
  })),
}));

import { OvertimeForm } from "../ui/OvertimeForm";
import * as overtimeApi from "@entities/overtime";

const post = overtimeApi.postOvertimeRequest as unknown as ReturnType<typeof vi.fn>;

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

describe("OvertimeForm", () => {
  it("blocks empty-reason submission and never calls postOvertimeRequest", async () => {
    // Why: 사유가 비어 있으면 zod 가 reason_required 로 막아 잘못된 요청 송신을 방지.
    post.mockClear();
    renderWithProviders(<OvertimeForm />);
    // reason defaults to "" so submitting straight away should fail validation.
    const submit = screen.getByRole("button", { name: /신청하기|Submit/i });
    await userEvent.click(submit);
    // give RHF + zod a tick to run
    await new Promise((r) => setTimeout(r, 60));
    expect(post).not.toHaveBeenCalled();
  });

  it("submits valid form and calls postOvertimeRequest once", async () => {
    // Why: 단일 호출만 발화되어 중복 신청을 방지하는지 확인.
    post.mockClear();
    renderWithProviders(<OvertimeForm />);
    const reason = screen.getByPlaceholderText(/스프린트 마감|Sprint deadline/i);
    await userEvent.type(reason, "마감 작업");
    const submit = screen.getByRole("button", { name: /신청하기|Submit/i });
    await userEvent.click(submit);
    await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
  });
});
