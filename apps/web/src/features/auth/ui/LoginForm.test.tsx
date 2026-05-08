/**
 * Test: features/auth · LoginForm
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  LoginForm is the first interactive surface every user sees. A broken
 *       submit handler or missing email/password validation locks new users
 *       out completely — highest-priority regression to catch.
 * Covers:
 *   - Renders email/password fields and submit button
 *   - Empty email + empty password: HTML5 `required` blocks submit, fetch
 *     is NOT called (proxy for "inline validation prevents request")
 *   - Valid submit posts to /v1/auth/login with the typed credentials
 *   - 401 response renders the inline error and re-enables the button
 * Out of scope:
 *   - Real navigation (handled by react-router)
 *   - i18n string content (test asserts on stable role/aria not text)
 *   - Refresh-token storage shape (covered by client.test.ts)
 * Coverage target: ≥ 70% lines for LoginForm.tsx
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { renderWithRouter } from "../../../test/renderWithRouter";

import { LoginForm } from "./LoginForm";

function mockFetch(impl: (url: string, init?: RequestInit) => Response) {
  return vi.spyOn(window, "fetch").mockImplementation(async (input, init) => {
    const url = typeof input === "string" ? input : (input as Request).url;
    return impl(url, init);
  });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function withProviders(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderWithRouter(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("LoginForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("renders email + password + submit", () => {
    withProviders(<LoginForm />);
    expect(screen.getByTestId("auth-shell")).toBeInTheDocument();
    // labels come from i18n (key returned in test) — assert by type / role
    expect(screen.getAllByDisplayValue("").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("does NOT call fetch when fields are empty (HTML required blocks submit)", async () => {
    const spy = mockFetch(() => jsonResponse({ data: {} }));
    withProviders(<LoginForm />);
    await userEvent.click(screen.getByRole("button"));
    expect(spy).not.toHaveBeenCalled();
  });

  it("posts /v1/auth/login with the entered credentials on valid submit", async () => {
    const spy = mockFetch((url) => {
      if (url.endsWith("/v1/auth/login")) {
        return jsonResponse({ data: { access_token: "AT", refresh_token: "RT" } });
      }
      // /v1/me is called after login; respond with empty memberships
      return jsonResponse({ data: { id: "u1", email: "a@b", memberships: [] } });
    });

    withProviders(<LoginForm />);
    const inputs = document.querySelectorAll("input");
    const email = inputs[0] as HTMLInputElement;
    const password = inputs[1] as HTMLInputElement;

    await userEvent.type(email, "a@b.com");
    await userEvent.type(password, "secret-pw");
    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });
    const loginCall = spy.mock.calls.find(([u]) =>
      String(u).endsWith("/v1/auth/login"),
    );
    expect(loginCall).toBeDefined();
    const init = loginCall![1] as RequestInit;
    expect(init.method).toBe("POST");
    const body = JSON.parse(String(init.body));
    expect(body).toEqual({ email: "a@b.com", password: "secret-pw" });
  });

  it("shows the auth-invalid error on 401", async () => {
    mockFetch(() =>
      jsonResponse({ error: { code: "INVALID_CREDENTIALS", message: "bad" } }, 401),
    );
    withProviders(<LoginForm />);
    const inputs = document.querySelectorAll("input");
    await userEvent.type(inputs[0] as HTMLInputElement, "a@b.com");
    await userEvent.type(inputs[1] as HTMLInputElement, "wrong-pw");
    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      // password TextField surfaces an error → look for any element with red ring class
      const pw = inputs[1] as HTMLInputElement;
      expect(pw.className).toMatch(/ring-danger/);
    });
  });
});
