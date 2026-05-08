/**
 * Test: widgets/admin-shell · a11y smoke
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  /admin/* pages exposing mutating actions (role changes, code revoke)
 *       must be reachable via keyboard. Missing landmarks (`<main id="main">`,
 *       `<nav>`) break skip-links and SR navigation. We do NOT install
 *       vitest-axe (constraint), so this is a hand-rolled smoke test.
 * Covers:
 *   - <main id="main"> renders so the App-level skip-link can target it
 *   - AdminNav renders as a <nav> region
 * Out of scope:
 *   - Auth gating (covered by AdminRoute.test.tsx)
 *   - Per-page admin route content (covered by page-level tests)
 * Coverage target: smoke — landmarks present
 */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { useAuthStore } from "@shared/lib/store/useAuthStore";

import { AdminShell } from "../AdminShell";
import "@shared/i18n";

function renderShell() {
  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/admin" element={<AdminShell />}>
          <Route index element={<div>admin-page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("widgets/admin-shell · a11y smoke", () => {
  it("renders <main id=\"main\"> as the content landmark", () => {
    useAuthStore.setState({
      accessToken: "tok",
      me: {
        id: "u1",
        email: "a@x.com",
        name: "Admin",
        locale: "ko",
        is_email_verified: true,
        memberships: [{ id: "m1", role: "ADMIN", company: { id: "c1", name: "Co" } }],
      },
    });
    renderShell();
    const main = document.getElementById("main");
    expect(main).not.toBeNull();
    expect(main?.tagName).toBe("MAIN");
  });

  it("includes the admin <nav> landmark", () => {
    useAuthStore.setState({
      accessToken: "tok",
      me: {
        id: "u1",
        email: "a@x.com",
        name: "Admin",
        locale: "ko",
        is_email_verified: true,
        memberships: [{ id: "m1", role: "ADMIN", company: { id: "c1", name: "Co" } }],
      },
    });
    renderShell();
    const nav = document.querySelector("nav");
    expect(nav).not.toBeNull();
  });

  // F-DESIGN-014: AdminNav aria-label must not be the dashboard item label
  it("AdminNav aria-label is not the dashboard item label (F-DESIGN-014)", () => {
    useAuthStore.setState({
      accessToken: "tok",
      me: {
        id: "u1",
        email: "a@x.com",
        name: "Admin",
        locale: "ko",
        is_email_verified: true,
        memberships: [{ id: "m1", role: "ADMIN", company: { id: "c1", name: "Co" } }],
      },
    });
    renderShell();
    const nav = document.querySelector("nav");
    // aria-label should be "관리자 메뉴" (admin.nav_aria_label), not "대시보드"
    expect(nav?.getAttribute("aria-label")).not.toBe("대시보드");
    expect(nav?.getAttribute("aria-label")).toBeTruthy();
  });
});
