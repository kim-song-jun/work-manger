/**
 * Test: pages/owner-billing · OwnerBillingPage
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  iter13 T6 SKELETON guard — verifies the page wires both billing
 *       endpoints, renders the seeded plan, and disables "Change plan"
 *       (Stripe is deferred to iter14).
 * Covers:
 *   - Renders the seeded plan name + status pill from /v1/billing/subscription
 *   - "Change plan" button is disabled with the iter14 tooltip
 *   - Empty invoice table shows the empty-state copy
 * Out of scope:
 *   - Stripe checkout flow (iter14)
 *   - Pagination of invoices (iter14, switches to cursor)
 */
import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@shared/i18n";

import { OwnerBillingPage } from "../index";

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <OwnerBillingPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("pages/owner-billing · OwnerBillingPage", () => {
  it("renders seeded plan name + price from MSW handler", async () => {
    renderPage();
    // Plan name from billing.ts seed
    await waitFor(() => {
      expect(screen.getByText("Standard")).toBeInTheDocument();
    });
    // Price formatted with KRW separator (50,000)
    expect(screen.getByText(/50,000/)).toBeInTheDocument();
  });

  it("disables Change plan with iter14 tooltip", async () => {
    renderPage();
    const btn = await screen.findByRole("button", { name: /플랜 변경|Change plan/i });
    expect(btn).toBeDisabled();
    // Tooltip mentions iter14
    expect(btn.getAttribute("title")).toMatch(/iter14/);
  });

  it("renders empty invoice state when handler returns []", async () => {
    renderPage();
    await waitFor(() => {
      // ko: "발행된 결제 내역이 없어요" | en: "No invoices issued yet"
      expect(
        screen.getByText(/발행된 결제 내역이 없어요|No invoices issued yet/i),
      ).toBeInTheDocument();
    });
  });
});
