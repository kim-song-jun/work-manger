/**
 * Test: features/auth · LoginForm · post-login routing regression
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  e2e/auth.spec.ts caught a production race where POST /v1/auth/login
 *       returned 200 but the FE never navigated to /m/home because the
 *       direct `nav()` call inside the async handler raced with React
 *       batching / upstream redirect unmount. We now defer navigation to a
 *       useEffect keyed on local `redirectTo` state. This test pins the
 *       behaviour so a refactor cannot silently revert.
 * Covers:
 *   - 200 /v1/auth/login + /v1/me with one membership → navigate("/m/home")
 *   - 200 /v1/auth/login + /v1/me 401 → navigate("/onboarding/welcome")
 *     (NOT /m/home — was the original bug)
 *   - access_token is written to BOTH the localStorage shim ("wm:access")
 *     and the zustand persist key ("wm:auth") before /v1/me fires
 * Out of scope:
 *   - Network retry / refresh-token rotation
 *   - Visual error styling (covered by LoginForm.test.tsx)
 * Coverage target: keep LoginForm.tsx ≥ 70% lines (existing gate).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useAuthStore } from "@shared/lib/store/useAuthStore";
import { setAccessToken } from "@shared/api";

import { renderWithRouter } from "../../../../test/renderWithRouter";
import { LoginForm } from "../LoginForm";

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

function mockFetch(impl: (url: string, init?: RequestInit) => Response) {
  return vi.spyOn(window, "fetch").mockImplementation(async (input, init) => {
    const url = typeof input === "string" ? input : (input as Request).url;
    return impl(url, init);
  });
}

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

async function fillAndSubmit() {
  const inputs = document.querySelectorAll("input");
  await userEvent.type(inputs[0] as HTMLInputElement, "a@b.com");
  await userEvent.type(inputs[1] as HTMLInputElement, "secret-pw");
  await userEvent.click(screen.getByRole("button"));
}

describe("LoginForm · routing regression", () => {
  beforeEach(() => {
    navigateSpy.mockReset();
    localStorage.clear();
    useAuthStore.getState().reset();
    setAccessToken(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("member (memberships.length>0) → nav('/m/home')", async () => {
    mockFetch((url) => {
      if (url.endsWith("/v1/auth/login")) {
        return jsonResponse({
          data: { access_token: "AT", refresh_token: "RT" },
        });
      }
      if (url.endsWith("/v1/me")) {
        return jsonResponse({
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
        });
      }
      return jsonResponse({}, 404);
    });

    withProviders(<LoginForm />);
    await fillAndSubmit();

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith("/m/home", { replace: true });
    });

    // Token persisted to BOTH stores so route guards can't read stale state.
    expect(localStorage.getItem("wm:access")).toBe("AT");
    expect(useAuthStore.getState().accessToken).toBe("AT");
    expect(useAuthStore.getState().me?.memberships).toHaveLength(1);
  });

  it("/v1/me 401 (unauthenticated /me) → nav('/onboarding/welcome'), NOT '/m/home'", async () => {
    mockFetch((url) => {
      if (url.endsWith("/v1/auth/login")) {
        return jsonResponse({
          data: { access_token: "AT", refresh_token: "RT" },
        });
      }
      if (url.endsWith("/v1/me")) {
        return jsonResponse(
          { error: { code: "UNAUTHENTICATED", message: "no" } },
          401,
        );
      }
      return jsonResponse({}, 404);
    });

    withProviders(<LoginForm />);
    await fillAndSubmit();

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalled();
    });

    // The original bug: catch-block would route to /m/home on /me failure.
    expect(navigateSpy).toHaveBeenCalledWith("/onboarding/welcome", {
      replace: true,
    });
    const targets = navigateSpy.mock.calls.map(([target]) => target);
    expect(targets).not.toContain("/m/home");
    expect(useAuthStore.getState().me).toBeNull();
  });

  it("/v1/me network error (non-HttpError throw) → nav('/onboarding/welcome')", async () => {
    let callIdx = 0;
    mockFetch((url) => {
      if (url.endsWith("/v1/auth/login")) {
        return jsonResponse({
          data: { access_token: "AT", refresh_token: "RT" },
        });
      }
      if (url.endsWith("/v1/me")) {
        callIdx += 1;
        // Simulate a non-HttpError thrown from /me by returning malformed JSON
        // (causes JSON.parse inside `api()` to throw a SyntaxError).
        return new Response("{not json", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return jsonResponse({}, 404);
    });

    withProviders(<LoginForm />);
    await fillAndSubmit();

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith("/onboarding/welcome", {
        replace: true,
      });
    });
    expect(callIdx).toBe(1);
  });
});
