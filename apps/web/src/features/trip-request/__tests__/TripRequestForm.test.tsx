/**
 * Test: features/trip-request · TripRequestForm
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  m-trip 폼은 잘못된 입력으로 백엔드를 호출하면 사용자가 "신청 중"
 *       상태에 갇히고 결재함이 오염된다. zod refine + RHF Controller
 *       (kind switch) 회귀를 막는다.
 * Covers:
 *   - end_date < start_date → invalid_range 에러 노출, mutation 미호출
 *   - 종류(SegmentedControl)에서 외근(FIELD_WORK) 선택 가능
 * Out of scope:
 *   - 서버 응답 메시지 매핑 → e2e
 *   - Sheet 애니메이션 → 시각 회귀
 * Coverage target: 80%+ for TripRequestForm.tsx core branches
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ToastProvider } from "@shared/ui";

import { TripRequestForm } from "../ui/TripRequestForm";
import "@shared/i18n";

const createTripMock = vi.fn(async () => ({
  id: "trip-1",
  kind: "BUSINESS_TRIP",
  start_date: "2026-06-01",
  end_date: "2026-06-02",
  location_label: "Seoul",
  purpose: "",
  status: "PENDING",
  decided_at: null,
  created_at: "",
  updated_at: "",
}));

vi.mock("@entities/trip", () => ({
  createTrip: (...args: unknown[]) => createTripMock(...(args as [])),
}));

function renderWithProviders(ui: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <ToastProvider>{ui}</ToastProvider>
    </QueryClientProvider>,
  );
}

describe("TripRequestForm", () => {
  it("rejects end-date before start-date and does not submit", async () => {
    // Why: zod refine 가 잘못된 기간 제출을 막아 결재함 오염을 예방.
    createTripMock.mockClear();
    renderWithProviders(<TripRequestForm />);

    const today = new Date().toISOString().slice(0, 10);
    const dateInputs = screen.getAllByDisplayValue(today);
    // first is start_date, second is end_date
    await userEvent.clear(dateInputs[1]);
    await userEvent.type(dateInputs[1], "1900-01-01");

    // Fill the required location (queried by name attribute since FormField
    // does not associate label[for] with the input).
    const placeInput = document.querySelector(
      'input[name="location_label"]',
    ) as HTMLInputElement;
    expect(placeInput).toBeTruthy();
    await userEvent.type(placeInput, "Busan");

    const submit = screen.getByRole("button", { name: /신청하기|Submit/i });
    await userEvent.click(submit);

    await waitFor(() => {
      expect(document.body.textContent ?? "").toMatch(
        /이후|on or after|invalid/i,
      );
    });
    expect(createTripMock).not.toHaveBeenCalled();
  });

  it("supports kind selection switching to FIELD_WORK", async () => {
    // Why: SegmentedControl Controller 가 form state 와 동기화되어야 한다.
    renderWithProviders(<TripRequestForm />);
    const field = screen.getByRole("tab", { name: /외근|Field work/i });
    await userEvent.click(field);
    expect(field).toHaveAttribute("aria-selected", "true");
  });
});
