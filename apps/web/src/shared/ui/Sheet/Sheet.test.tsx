/**
 * Test: shared/ui · Sheet
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  Sheet is the bottom-modal pattern used for filters & confirmations.
 *       Failing to dismiss on backdrop / ESC traps the user — must verify.
 * Covers:
 *   - Returns null when open=false (no DOM)
 *   - Renders title + children when open=true
 *   - onClose fires on backdrop click
 *   - onClose does NOT fire when clicking inside the sheet content
 *   - onClose fires on Escape key
 * Out of scope:
 *   - Animation timing
 *   - Focus trap (not implemented yet)
 * Coverage target: 100% lines for Sheet.tsx
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Sheet } from "./Sheet";

describe("Sheet", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <Sheet open={false} onClose={() => {}} title="t">child</Sheet>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders title and children when open", () => {
    render(
      <Sheet open onClose={() => {}} title="필터">
        <div>body</div>
      </Sheet>,
    );
    expect(screen.getByText("필터")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("calls onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    const { container } = render(
      <Sheet open onClose={onClose} title="t"><div>body</div></Sheet>,
    );
    const backdrop = container.firstElementChild as HTMLElement;
    await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onClose when inner content is clicked", async () => {
    const onClose = vi.fn();
    render(
      <Sheet open onClose={onClose} title="t">
        <button type="button">stay</button>
      </Sheet>,
    );
    await userEvent.click(screen.getByRole("button", { name: "stay" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn();
    render(<Sheet open onClose={onClose} title="t">x</Sheet>);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
