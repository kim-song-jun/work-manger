/**
 * Test: features/auth · ForgotForm
 * Type: Unit (vitest + RTL, jsdom)
 * Why: Password reset should call the real API route, not the removed
 *      placeholder endpoint that masked 404s as success.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../../../test/renderWithRouter";
import { ForgotForm } from "./ForgotForm";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("ForgotForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts the real password-forgot endpoint", async () => {
    const fetchSpy = vi.spyOn(window, "fetch").mockResolvedValue(
      jsonResponse({ data: { sent: true } }),
    );

    renderWithRouter(<ForgotForm />);
    await userEvent.type(
      document.querySelector('input[type="email"]') as HTMLInputElement,
      "person@example.test",
    );
    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });
    const call = fetchSpy.mock.calls[0];
    expect(String(call[0])).toBe("/v1/auth/password/forgot");
    expect((call[1] as RequestInit).method).toBe("POST");
  });
});
