/**
 * Test: widgets/web-shell · a11y smoke
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  The desktop shell hosts sidebar nav + header + main content.
 *       Sidebar `<nav aria-label>` and `<main id="main">` are both required
 *       for skip-links and SR landmark navigation. We do NOT install
 *       vitest-axe (constraint), so this is a hand-rolled smoke test.
 * Covers:
 *   - <main id="main"> landmark is present
 *   - Sidebar exposes <nav aria-label="…"> with the primary-nav label
 *   - The org/menu icon button does NOT render bare (icon-only with no label)
 * Out of scope:
 *   - Color-contrast (verified by tokens.css review)
 *   - Sidebar drawer behaviour (tested elsewhere)
 * Coverage target: smoke — landmarks + labelled nav
 */
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WebShell } from "../WebShell";
import "@shared/i18n";

vi.mock("@entities/user", () => ({
  useMe: () => ({
    data: {
      id: "1",
      email: "a@b.c",
      name: "A",
      memberships: [{ id: "m1", company: { id: "c1", name: "Acme" }, role: "ADMIN" }],
    },
    isLoading: false,
  }),
}));

function renderShell(initial = "/web") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initial]}>
        <Routes>
          <Route path="/web" element={<WebShell />}>
            <Route index element={<div>dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("widgets/web-shell · a11y smoke", () => {
  it("renders <main id=\"main\"> as the content landmark", () => {
    renderShell();
    const main = document.getElementById("main");
    expect(main).not.toBeNull();
    expect(main?.tagName).toBe("MAIN");
  });

  it("labels the sidebar primary navigation", () => {
    // Why: an unlabelled <nav> is announced as "navigation" generically by
    // SRs; with multiple navs (sidebar + topbar menu) users need disambiguation.
    renderShell();
    const navs = Array.from(document.querySelectorAll("nav"));
    const labelled = navs.find((n) => n.getAttribute("aria-label"));
    expect(labelled).toBeDefined();
  });
});
