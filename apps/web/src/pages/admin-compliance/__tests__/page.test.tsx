/**
 * Test: pages/admin-compliance - AdminCompliancePage
 * Type: Unit (vitest + RTL, jsdom)
 * Why: The admin compliance board is the company-wide 52h weekly hours view.
 *      It must render real API rows and map status colors/data attributes
 *      correctly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setAccessToken } from "@shared/api";
import "@shared/i18n";
import { AdminCompliancePage } from "../index";

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
        <AdminCompliancePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("pages/admin-compliance - AdminCompliancePage", () => {
  beforeEach(() => setAccessToken(null));
  afterEach(() => vi.restoreAllMocks());

  it("renders rows from /v1/admin/compliance/52h with status pills", async () => {
    vi.spyOn(window, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url.includes("/v1/admin/compliance/52h")) {
        return Promise.resolve(
          makeResponse({
            data: {
              week_start: "2026-04-27",
              threshold_hours: "52",
              members: [
                {
                  membership_id: "m-over",
                  name: "Lee",
                  department: "Engineering",
                  role: "EMPLOYEE",
                  hours: "53.00",
                  threshold_hours: "52",
                  remaining_hours: "0",
                  status: "OVER",
                },
                {
                  membership_id: "m-warn",
                  name: "Park",
                  department: "Design",
                  role: "MANAGER",
                  hours: "49.50",
                  threshold_hours: "52",
                  remaining_hours: "2.50",
                  status: "WARN",
                },
              ],
            },
          }),
        );
      }
      return Promise.reject(new Error(`unmocked: ${url}`));
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Lee")).toBeInTheDocument();
      expect(screen.getByText("Park")).toBeInTheDocument();
    });
    expect(screen.getByTestId("status-m-over")).toHaveAttribute("data-status", "OVER");
    expect(screen.getByTestId("status-m-warn")).toHaveAttribute("data-status", "WARN");
  });
});
