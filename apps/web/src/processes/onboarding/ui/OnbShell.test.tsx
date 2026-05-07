/**
 * Test: processes/onboarding · OnbShell design frame
 * Type: Unit (vitest + RTL, jsdom)
 * Why: Onboarding screens should keep the mobile design-system frame instead
 *      of drifting into generic full-page layouts.
 */
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "../../../test/renderWithRouter";
import { OnbShell } from "./OnbShell";

describe("OnbShell", () => {
  it("renders the shared onboarding frame and progress", () => {
    renderWithRouter(
      <OnbShell step={2}>
        <div>step content</div>
      </OnbShell>,
    );
    expect(screen.getByTestId("onboarding-shell")).toBeInTheDocument();
    expect(screen.getByText("step content")).toBeInTheDocument();
  });
});
