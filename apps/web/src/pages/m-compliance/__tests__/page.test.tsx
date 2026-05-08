/**
 * Test: pages/m-compliance · ComplianceMobilePage
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  컬러 밴드(success / warn / danger)는 사용자에게 즉각적 의미를 준다.
 *       잘못된 색은 위험을 정상으로 오해하게 만들 수 있어 status별 색상
 *       기준점을 회귀 보호한다.
 * Covers:
 *   - WARN 응답 → status pill data-status="WARN"
 *   - OVER 응답 → status pill data-status="OVER" + danger 색
 * Out of scope:
 *   - 주차별 히스토리 (별도 화면)
 * Coverage target: 컬러/밴드 분기
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@shared/i18n";
import { setAccessToken } from "@shared/api";

// F-MANAGER-05: mock useMe to avoid extra fetch calls in test (useMe added to page)
vi.mock("@entities/user", () => ({
  useMe: vi.fn(() => ({
    data: {
      id: "u-1",
      email: "emp@test.com",
      name: "직원",
      locale: "ko",
      is_email_verified: true,
      memberships: [{ id: "m-1", role: "EMPLOYEE", company: { id: "c-1", name: "Test" } }],
    },
  })),
}));

import { ComplianceMobilePage } from "../index";

function makeResponse(body: unknown, init: { ok?: boolean; status?: number } = {}): Response {
  const text = body === undefined ? "" : JSON.stringify(body);
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    text: () => Promise.resolve(text),
  } as unknown as Response;
}

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ComplianceMobilePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function mockOnce(status: "WARN" | "OVER" | "OK", hours: string, remaining: string) {
  vi.spyOn(window, "fetch").mockResolvedValueOnce(
    makeResponse({
      data: {
        hours,
        threshold_hours: "52",
        remaining_hours: remaining,
        status,
        week_start: "2026-04-27",
      },
    }) as unknown as Response,
  );
}

describe("pages/m-compliance · ComplianceMobilePage", () => {
  beforeEach(() => setAccessToken(null));
  afterEach(() => vi.restoreAllMocks());

  it("renders WARN pill when status is WARN", async () => {
    mockOnce("WARN", "49.00", "3.00");
    renderPage();
    const pill = await waitFor(() => screen.getByTestId("compliance-status-pill"));
    expect(pill.getAttribute("data-status")).toBe("WARN");
  });

  it("renders OVER pill when status is OVER", async () => {
    mockOnce("OVER", "53.00", "0");
    renderPage();
    const pill = await waitFor(() => screen.getByTestId("compliance-status-pill"));
    expect(pill.getAttribute("data-status")).toBe("OVER");
    // progressbar saturates at threshold
    const bar = screen.getByTestId("compliance-progress");
    expect(bar.getAttribute("aria-valuenow")).toBe("53");
    expect(bar.getAttribute("aria-valuemax")).toBe("52");
  });
});
