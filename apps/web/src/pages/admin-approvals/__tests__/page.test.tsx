/**
 * Test: pages/admin-approvals · AdminApprovalsPage
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  Bulk approval is the highest-throughput admin workflow. This test
 *       guards (a) row rendering from a mocked GET /v1/admin/approvals and
 *       (b) bulk approve issuing one PATCH per selected row, since the
 *       fan-out lives in the feature until backend ships a bulk endpoint.
 * Covers:
 *   - Initial pending list renders rows from the mocked list response
 *   - Selecting two checkboxes + "일괄 승인" issues two PATCH calls in parallel
 * Out of scope:
 *   - Rejection happy path (mirrors approve; covered by feature unit)
 *   - Filter tab change refetch (covered indirectly by react-query queryKey)
 * Coverage target: render + bulk approve flow on this page
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@shared/i18n";
import { ToastProvider } from "@shared/ui";
import { setAccessToken } from "@shared/api";

import { AdminApprovalsPage } from "../index";

type MockResp = { ok: boolean; status: number; body: unknown };

function makeResponse({ ok, status, body }: MockResp): Response {
  const text = body === undefined ? "" : JSON.stringify(body);
  return {
    ok,
    status,
    text: () => Promise.resolve(text),
  } as unknown as Response;
}

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <MemoryRouter>
          <AdminApprovalsPage />
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe("pages/admin-approvals · AdminApprovalsPage", () => {
  beforeEach(() => {
    setAccessToken(null);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders pending rows from /v1/admin/approvals", async () => {
    vi.spyOn(window, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url.includes("/v1/admin/approvals")) {
        return Promise.resolve(
          makeResponse({
            ok: true,
            status: 200,
            body: {
              data: [
                {
                  id: "a1",
                  target_type: "LEAVE",
                  status: "PENDING",
                  requester_id: "e1",
                  requester_name: "이도현",
                  team: "개발",
                  summary: "5/2 ~ 5/3 · 2일",
                  reason: "가족 행사",
                  submitted_at: "2026-05-01T00:00:00Z",
                },
                {
                  id: "a2",
                  target_type: "OVERTIME",
                  status: "PENDING",
                  requester_id: "e2",
                  requester_name: "윤소라",
                  team: "마케팅",
                  summary: "4/21 18:00~21:30",
                  reason: null,
                  submitted_at: "2026-05-01T00:00:00Z",
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
      expect(screen.getByText("이도현")).toBeInTheDocument();
      expect(screen.getByText("윤소라")).toBeInTheDocument();
    });
  });

  it("bulk approve issues a PATCH per selected row", async () => {
    const fetchSpy = vi.spyOn(window, "fetch").mockImplementation((input, init) => {
      const url = String(input);
      const method = (init?.method ?? "GET").toUpperCase();
      if (method === "GET" && url.includes("/v1/admin/approvals")) {
        return Promise.resolve(
          makeResponse({
            ok: true,
            status: 200,
            body: {
              data: [
                {
                  id: "a1",
                  target_type: "LEAVE",
                  status: "PENDING",
                  requester_id: "e1",
                  requester_name: "이도현",
                  summary: "5/2 ~ 5/3",
                  submitted_at: "2026-05-01T00:00:00Z",
                },
                {
                  id: "a2",
                  target_type: "LEAVE",
                  status: "PENDING",
                  requester_id: "e2",
                  requester_name: "윤소라",
                  summary: "5/4",
                  submitted_at: "2026-05-01T00:00:00Z",
                },
              ],
            },
          }),
        );
      }
      if (method === "PATCH" && url.match(/\/v1\/admin\/approvals\/(a1|a2)$/)) {
        return Promise.resolve(makeResponse({ ok: true, status: 200, body: { data: { ok: true } } }));
      }
      return Promise.reject(new Error(`unmocked: ${method} ${url}`));
    });

    renderPage();

    await screen.findByText("이도현");

    await userEvent.click(screen.getByLabelText("select-a1"));
    await userEvent.click(screen.getByLabelText("select-a2"));
    await userEvent.click(screen.getByRole("button", { name: /일괄 승인|Approve selected/ }));

    await waitFor(() => {
      const patchCalls = fetchSpy.mock.calls.filter(
        ([url, init]) => (init?.method ?? "GET").toUpperCase() === "PATCH" && String(url).includes("/v1/admin/approvals/"),
      );
      expect(patchCalls).toHaveLength(2);
    });
  });
});
