/**
 * Test: widgets/admin-shell · AdminRoute guard
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  /admin/* exposes mutating actions (role changes, code revoke). The
 *       guard must redirect EMPLOYEE/MANAGER away (no peeking at admin UI),
 *       allow ADMIN/OWNER through, and bounce unauthenticated users to login.
 * Covers:
 *   - Renders children when role is ADMIN
 *   - Redirects to /m/home when role is EMPLOYEE
 *   - Redirects to /login when not authenticated
 * Out of scope:
 *   - Server-side authorization (backend RBAC owns)
 *   - Sub-route forwarding (covered by react-router itself)
 * Coverage target: 100% branches for AdminRoute.tsx
 */
import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AdminRoute } from "../AdminRoute";
import { useAuthStore } from "@shared/lib/store/useAuthStore";

function renderAt(initial: string) {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <div>admin-content</div>
            </AdminRoute>
          }
        />
        <Route path="/m/home" element={<div>mobile-home</div>} />
        <Route path="/login" element={<div>login-screen</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("widgets/admin-shell · AdminRoute", () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, me: null });
  });

  it("renders children when current role is ADMIN", () => {
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
    renderAt("/admin");
    expect(screen.getByText("admin-content")).toBeInTheDocument();
  });

  it("redirects to /m/home when role is EMPLOYEE", () => {
    useAuthStore.setState({
      accessToken: "tok",
      me: {
        id: "u1",
        email: "a@x.com",
        name: "Emp",
        locale: "ko",
        is_email_verified: true,
        memberships: [
          { id: "m1", role: "EMPLOYEE", company: { id: "c1", name: "Co" } },
        ],
      },
    });
    renderAt("/admin");
    expect(screen.getByText("mobile-home")).toBeInTheDocument();
  });

  it("redirects to /login when not authenticated", () => {
    useAuthStore.setState({ accessToken: null, me: null });
    renderAt("/admin");
    expect(screen.getByText("login-screen")).toBeInTheDocument();
  });
});
