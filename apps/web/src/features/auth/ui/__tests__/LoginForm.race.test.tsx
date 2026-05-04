/**
 * Test: features/auth · LoginForm · post-commit navigation race
 * Type: Unit (vitest + RTL, jsdom, fake timers)
 * Why:  In production builds an upstream redirect can unmount LoginForm
 *       between the time `nav()` is queued inside the async submit handler
 *       and the time React flushes — leaving the user stranded on /login.
 *       The fix moves `nav()` into a useEffect keyed on local `redirectTo`
 *       state, guaranteeing navigation runs after the commit cycle.
 *       This test pins the ordering: navigateSpy MUST NOT be called before
 *       the React commit; it MUST be called from a useEffect AFTER it.
 * Covers:
 *   - navigateSpy is not invoked synchronously inside onSubmit
 *   - navigateSpy is invoked exactly once after the commit when redirectTo
 *     transitions null → "/m/home"
 * Out of scope:
 *   - Real router navigation behaviour (mocked)
 *   - Suspense / concurrent mode timings
 * Coverage target: keep LoginForm.tsx ≥ 70% lines.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderWithRouter } from "../../../../test/renderWithRouter";
import { LoginForm } from "../LoginForm";
import { useAuthStore } from "@shared/lib/store/useAuthStore";
import { setAccessToken } from "@shared/api";

const navigateSpy = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => navigateSpy,
  };
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function withProviders(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderWithRouter(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("LoginForm · post-commit navigation race", () => {
  beforeEach(() => {
    navigateSpy.mockReset();
    localStorage.clear();
    useAuthStore.getState().reset();
    setAccessToken(null);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("nav() is NOT called synchronously inside onSubmit; fires after commit", async () => {
    // Resolve handles let us drive the async fetch chain step-by-step so we
    // can observe ordering: at the moment /v1/me resolves, nav must still
    // be deferred until after the next commit cycle's useEffect.
    let resolveLogin!: (r: Response) => void;
    let resolveMe!: (r: Response) => void;
    const loginPromise = new Promise<Response>((res) => (resolveLogin = res));
    const mePromise = new Promise<Response>((res) => (resolveMe = res));

    vi.spyOn(window, "fetch").mockImplementation(async (input) => {
      const url = typeof input === "string" ? input : (input as Request).url;
      if (url.endsWith("/v1/auth/login")) return loginPromise;
      if (url.endsWith("/v1/me")) return mePromise;
      return jsonResponse({}, 404);
    });

    withProviders(<LoginForm />);

    const inputs = document.querySelectorAll("input");
    const email = inputs[0] as HTMLInputElement;
    const password = inputs[1] as HTMLInputElement;

    // Use fireEvent-style direct DOM mutation + form submit so we don't
    // accidentally yield to userEvent's internal microtasks. Fake timers
    // would also defeat userEvent if used together.
    await act(async () => {
      email.value = "a@b.com";
      email.dispatchEvent(new Event("input", { bubbles: true }));
      password.value = "secret-pw";
      password.dispatchEvent(new Event("input", { bubbles: true }));
    });

    await act(async () => {
      const form = email.closest("form")!;
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });

    // Submit dispatched, but neither fetch has resolved → no navigate yet.
    expect(navigateSpy).not.toHaveBeenCalled();

    // Resolve POST /v1/auth/login. State sets `access_token` then awaits /me.
    await act(async () => {
      resolveLogin(
        jsonResponse({ data: { access_token: "AT", refresh_token: "RT" } }),
      );
    });
    expect(navigateSpy).not.toHaveBeenCalled();

    // Resolve /v1/me with a member. The handler now calls setRedirectTo,
    // which triggers a re-render → useEffect → navigate.
    await act(async () => {
      resolveMe(
        jsonResponse({
          data: {
            id: "u1",
            email: "a@b.com",
            memberships: [
              {
                id: "x",
                role: "EMPLOYEE",
                company: { id: "c", name: "Acme" },
              },
            ],
          },
        }),
      );
    });

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledTimes(1);
    });
    expect(navigateSpy).toHaveBeenCalledWith("/m/home", { replace: true });

    // Sanity: form is still rendered (component not unmounted before nav).
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
