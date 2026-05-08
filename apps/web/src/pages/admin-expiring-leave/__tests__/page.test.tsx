/**
 * Test: pages/admin-expiring-leave · AdminExpiringLeavePage
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  Guards F-ADMIN-05 — subtitle must display 60 days (aligned to BE
 *       DEFAULT_EXPIRING_WINDOW_DAYS=60), not the previous 30.
 * Covers:
 *   - Page renders subtitle with "60일" when API returns data
 *   - Empty state renders when list is empty
 * Out of scope:
 *   - Table sorting (server-side)
 *   - Leave-days calculation (entity-level)
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@shared/i18n";

import { AdminExpiringLeavePage } from "../index";

function makeResponse(body: unknown, status = 200): Response {
  const text = JSON.stringify(body);
  return { ok: status < 400, status, text: () => Promise.resolve(text) } as unknown as Response;
}

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <AdminExpiringLeavePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("pages/admin-expiring-leave · AdminExpiringLeavePage", () => {
  afterEach(() => vi.restoreAllMocks());

  // F-ADMIN-05: subtitle must show 60 days (matches BE DEFAULT_EXPIRING_WINDOW_DAYS)
  it("subtitle shows 60 days (aligned to BE window)", async () => {
    vi.spyOn(window, "fetch").mockResolvedValue(
      makeResponse({ data: [] }),
    );
    renderPage();
    await waitFor(() => {
      // i18n key: admin.expiring_sub interpolated with days=60
      // Pattern matches both ko ("60일") and en ("60 days")
      expect(screen.getByText(/60/)).toBeInTheDocument();
    });
  });

  it("renders empty state when no expiring rows", async () => {
    vi.spyOn(window, "fetch").mockResolvedValue(
      makeResponse({ data: [] }),
    );
    renderPage();
    await waitFor(() => {
      // ko: "소멸 위험이 없어요" | en: "No expiry risk"
      expect(screen.getByText(/소멸 위험이 없어요|No expiry risk/i)).toBeInTheDocument();
    });
  });
});
