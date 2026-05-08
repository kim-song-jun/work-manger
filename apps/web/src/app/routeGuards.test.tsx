import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { useAuthStore, type MeUser } from "@shared/lib/store/useAuthStore";

import { RequireAdmin, RequireMember } from "./routeGuards";

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

function renderGuarded(ui: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={["/private"]}>
      <Routes>
        <Route path="/private" element={ui} />
        <Route path="/login" element={<div>login-screen</div>} />
        <Route path="/m/home" element={<div>mobile-home</div>} />
        <Route path="/onboarding/welcome" element={<div>onboarding-screen</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("route guards", () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, me: null });
  });

  it("RequireMember redirects unauthenticated users to login", () => {
    renderGuarded(
      <RequireMember>
        <div>private-content</div>
      </RequireMember>,
    );
    expect(screen.getByText("login-screen")).toBeInTheDocument();
  });

  it("RequireMember waits while token exists but me is bootstrapping", () => {
    useAuthStore.setState({ accessToken: "tok", me: null });
    renderGuarded(
      <RequireMember>
        <div>private-content</div>
      </RequireMember>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
  });

  it("RequireMember redirects token-only users without membership to onboarding", () => {
    useAuthStore.setState({
      accessToken: "tok",
      me: { ...meWithRole("EMPLOYEE"), memberships: [] },
    });
    renderGuarded(
      <RequireMember>
        <div>private-content</div>
      </RequireMember>,
    );
    expect(screen.getByText("onboarding-screen")).toBeInTheDocument();
  });

  it("RequireAdmin allows admin roles after me is available", () => {
    useAuthStore.setState({ accessToken: "tok", me: meWithRole("ADMIN") });
    renderGuarded(
      <RequireAdmin>
        <div>admin-content</div>
      </RequireAdmin>,
    );
    expect(screen.getByText("admin-content")).toBeInTheDocument();
  });

  it("RequireAdmin redirects non-admin members to home", () => {
    useAuthStore.setState({ accessToken: "tok", me: meWithRole("MANAGER") });
    renderGuarded(
      <RequireAdmin>
        <div>admin-content</div>
      </RequireAdmin>,
    );
    expect(screen.getByText("mobile-home")).toBeInTheDocument();
  });
});
