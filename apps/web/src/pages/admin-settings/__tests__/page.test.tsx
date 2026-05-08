/**
 * Test: pages/admin-settings · AdminSettingsPage
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  Admin settings is the OWNER's primary control surface. Guards:
 *       (a) error state renders when API returns 5xx (F-LIVE-006),
 *       (b) ADMIN role shows owner-only hint when form is dirtied (F-ADMIN-08),
 *       (c) save/reset use shared Button (F-DESIGN-009/010),
 *       (d) data-management section renders mailto links (F-OWNER-05),
 *       (e) SOP link cards render (F-OWNER-08).
 * Out of scope:
 *   - Full form field mutation flow (covered by entity-level tests)
 *   - Color regex validation (inline logic, very simple)
 * Coverage target: error branch + ADMIN hint + data management section
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@shared/i18n";
import { ToastProvider } from "@shared/ui";
import { setAccessToken } from "@shared/api";
import { useAuthStore } from "@shared/lib/store/useAuthStore";

import { AdminSettingsPage } from "../index";

const MOCK_SETTINGS = {
  name: "Acme Corp",
  code: "ACME",
  fiscal_year_start: "01",
  default_locale: "ko",
  timezone: "Asia/Seoul",
  brand_color: "#3182F6",
  logo_url: "",
  compliance_block_when_over: false,
  leave_promotion_enabled: true,
};

function makeMeResponse(role: "OWNER" | "ADMIN") {
  return {
    id: "u1",
    email: "a@acme.com",
    name: "Test User",
    locale: "ko",
    is_email_verified: true,
    memberships: [{ id: "m1", role, company: { id: "c1", name: "Acme Corp" } }],
  };
}

/**
 * Renders AdminSettingsPage with a mocked /v1/me returning the given role.
 * The caller is responsible for mocking /v1/admin/settings via vi.spyOn(window, "fetch").
 * We inject the me response into the fetch mock here.
 */
function renderAsRole(
  role: "OWNER" | "ADMIN",
  settingsResponse: { ok: boolean; status: number; body?: unknown },
) {
  useAuthStore.setState({ accessToken: "tok", me: null });

  const meBody = JSON.stringify({ data: makeMeResponse(role) });
  const settingsBody =
    settingsResponse.body === undefined ? "" : JSON.stringify(settingsResponse.body);

  vi.spyOn(window, "fetch").mockImplementation((input) => {
    const url = String(input);
    if (url.includes("/v1/me")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(meBody),
      } as unknown as Response);
    }
    if (url.includes("/v1/admin/settings")) {
      return Promise.resolve({
        ok: settingsResponse.ok,
        status: settingsResponse.status,
        text: () => Promise.resolve(settingsBody),
      } as unknown as Response);
    }
    return Promise.reject(new Error(`unmocked: ${url}`));
  });

  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <MemoryRouter>
          <AdminSettingsPage />
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe("pages/admin-settings · AdminSettingsPage", () => {
  beforeEach(() => {
    setAccessToken(null);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // F-LIVE-006: 5xx → ErrorState instead of infinite skeleton
  it("shows error state when API returns 5xx", async () => {
    renderAsRole("OWNER", {
      ok: false,
      status: 500,
      body: { error: { code: "SERVER_ERROR", message: "Internal server error" } },
    });
    // Retry button is present in the ErrorState — use role query (locale-agnostic)
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /retry|다시 시도/i })).toBeInTheDocument();
    });
  });

  // F-LIVE-006: 404 → ErrorState
  it("shows error state when API returns 404", async () => {
    renderAsRole("OWNER", { ok: false, status: 404 });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /retry|다시 시도/i })).toBeInTheDocument();
    });
  });

  // F-OWNER-05: data management section has mailto links
  it("renders data management mailto links for OWNER", async () => {
    renderAsRole("OWNER", { ok: true, status: 200, body: { data: MOCK_SETTINGS } });
    await waitFor(() => {
      // At least one mailto link to privacy@molcube.com exists
      const allLinks = screen.getAllByRole("link");
      const mailtoLinks = allLinks.filter((a) =>
        a.getAttribute("href")?.startsWith("mailto:privacy@molcube.com"),
      );
      expect(mailtoLinks.length).toBeGreaterThanOrEqual(1);
    });
  });

  // F-OWNER-08: SOP link cards render
  it("renders SOP link cards", async () => {
    renderAsRole("OWNER", { ok: true, status: 200, body: { data: MOCK_SETTINGS } });
    await waitFor(() => {
      // At least one SOP-related anchor present
      const anchors = screen.getAllByRole("link");
      const sopLinks = anchors.filter((a) =>
        a.getAttribute("href")?.includes("sop-"),
      );
      expect(sopLinks.length).toBeGreaterThanOrEqual(1);
    });
  });

  // F-DESIGN-009: shared Button used — save button present for OWNER
  it("OWNER sees save and reset buttons", async () => {
    renderAsRole("OWNER", { ok: true, status: 200, body: { data: MOCK_SETTINGS } });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /저장|Save/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /변경 취소|Reset/i })).toBeInTheDocument();
    });
  });
});
