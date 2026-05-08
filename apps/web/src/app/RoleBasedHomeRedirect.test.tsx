/**
 * Test: app · RoleBasedHomeRedirect — F-LIVE-008
 * Type: Unit (vitest + RTL, jsdom)
 *
 * Covers:
 *   - ADMIN → redirected to /admin
 *   - OWNER → redirected to /admin
 *   - EMPLOYEE → redirected to /m/home
 *   - MANAGER → redirected to /m/home
 *   - loading state (token present, me null) → loading spinner shown
 *   - unauthenticated (no token) → redirected to /login
 */
import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { useAuthStore, type MeUser } from "@shared/lib/store/useAuthStore";

import { RoleBasedHomeRedirect } from "./RoleBasedHomeRedirect";

function meWithRole(role: MeUser["memberships"][number]["role"]): MeUser {
  return {
    id: "u1",
    email: "user@acme.demo",
    name: "User",
    locale: "ko",
    is_email_verified: true,
    memberships: [{ id: "m1", role, company: { id: "c1", name: "Acme" } }],
  };
}

function renderRedirect() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<RoleBasedHomeRedirect />} />
        <Route path="/login" element={<div>login-screen</div>} />
        <Route path="/admin" element={<div>admin-screen</div>} />
        <Route path="/m/home" element={<div>mobile-home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RoleBasedHomeRedirect", () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, me: null });
  });

  it("redirects ADMIN to /admin", () => {
    useAuthStore.setState({ accessToken: "tok", me: meWithRole("ADMIN") });
    renderRedirect();
    expect(screen.getByText("admin-screen")).toBeInTheDocument();
  });

  it("redirects OWNER to /admin", () => {
    useAuthStore.setState({ accessToken: "tok", me: meWithRole("OWNER") });
    renderRedirect();
    expect(screen.getByText("admin-screen")).toBeInTheDocument();
  });

  it("redirects EMPLOYEE to /m/home", () => {
    useAuthStore.setState({ accessToken: "tok", me: meWithRole("EMPLOYEE") });
    renderRedirect();
    expect(screen.getByText("mobile-home")).toBeInTheDocument();
  });

  it("redirects MANAGER to /m/home", () => {
    useAuthStore.setState({ accessToken: "tok", me: meWithRole("MANAGER") });
    renderRedirect();
    expect(screen.getByText("mobile-home")).toBeInTheDocument();
  });

  it("shows loading spinner while me is bootstrapping (token present, me null)", () => {
    useAuthStore.setState({ accessToken: "tok", me: null });
    renderRedirect();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("redirects unauthenticated user to /login", () => {
    useAuthStore.setState({ accessToken: null, me: null });
    renderRedirect();
    expect(screen.getByText("login-screen")).toBeInTheDocument();
  });
});
