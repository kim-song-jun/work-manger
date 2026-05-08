/**
 * Test: shared/ui · Card
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  Card wraps every dashboard widget; a broken click handler or layout
 *       can hide entire features. Confirm the public contract (children +
 *       optional onClick) remains stable.
 * Covers:
 *   - Renders children
 *   - onClick fires once on click and pointer cursor is applied
 *   - No onClick → no cursor:pointer
 *   - variant=elevated applies a box-shadow
 * Out of scope:
 *   - Token color values (theming concern → Storybook)
 * Coverage target: 100% lines + ≥ 80% branches for Card.tsx
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Card } from "./Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>hello</Card>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("fires onClick once when clicked and applies pointer cursor", async () => {
    const onClick = vi.fn();
    const { container } = render(<Card onClick={onClick}>x</Card>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.cursor).toBe("pointer");
    await userEvent.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("has no pointer cursor when onClick is absent", () => {
    const { container } = render(<Card>x</Card>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.cursor).toBe("");
  });

  it("applies elevated shadow when variant=elevated", () => {
    const { container } = render(<Card variant="elevated">x</Card>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.boxShadow).toBe("var(--shadow-2)");
  });

  it("applies subtle background when variant=subtle", () => {
    const { container } = render(<Card variant="subtle">x</Card>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.background).toBe("var(--grey-100)");
  });
});
