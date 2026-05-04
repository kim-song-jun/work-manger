/**
 * Test: shared/ui · FormField
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  Form fields ship label/hint/error semantics — losing the error
 *       slot regresses every form's inline validation, a high-impact bug.
 * Covers:
 *   - Renders label + asterisk when required
 *   - Renders hint when no error
 *   - Renders error and suppresses hint when both supplied (error wins)
 *   - Renders children inside the field wrapper
 * Out of scope:
 *   - aria-invalid wiring on the child input (FormField is layout-only)
 * Coverage target: 100% lines for FormField.tsx
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "./FormField";

describe("FormField", () => {
  it("renders label and child input", () => {
    render(
      <FormField label="이메일">
        <input data-testid="in" />
      </FormField>,
    );
    expect(screen.getByText("이메일")).toBeInTheDocument();
    expect(screen.getByTestId("in")).toBeInTheDocument();
  });

  it("shows required asterisk when required", () => {
    render(
      <FormField label="이름" required>
        <input />
      </FormField>,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("shows hint when no error", () => {
    render(
      <FormField hint="도움말">
        <input />
      </FormField>,
    );
    expect(screen.getByText("도움말")).toBeInTheDocument();
  });

  it("shows error and hides hint when error present", () => {
    render(
      <FormField hint="도움말" error="에러">
        <input />
      </FormField>,
    );
    expect(screen.getByText("에러")).toBeInTheDocument();
    expect(screen.queryByText("도움말")).not.toBeInTheDocument();
  });
});
