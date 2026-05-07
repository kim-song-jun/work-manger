/**
 * Test: features/auth · SignupForm design shell
 * Type: Unit (vitest + RTL, jsdom)
 * Why: Signup is a first-run surface and must stay aligned with the auth
 *      mobile shell rather than falling back to an unstyled centered card.
 */
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "../../../test/renderWithRouter";
import { SignupForm } from "./SignupForm";

describe("SignupForm", () => {
  it("renders inside the shared auth design shell", () => {
    renderWithRouter(<SignupForm />);
    expect(screen.getByTestId("auth-shell")).toBeInTheDocument();
    expect(screen.getAllByDisplayValue("").length).toBeGreaterThanOrEqual(3);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
