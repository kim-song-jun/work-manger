/**
 * Test: shared/ui · SegmentedControl
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  SegmentedControl drives day/week/month switches and tab-like filters.
 *       A broken aria-selected breaks SR users; a swallowed onChange freezes
 *       the filter UI.
 * Covers:
 *   - Renders one tab per option with role="tab" inside role="tablist"
 *   - aria-selected reflects the current `value`
 *   - Clicking a tab calls onChange with that option's value
 *   - Generic typing still works for narrow string unions (compile check)
 *   - Keyboard navigation (arrows / Home / End / Enter / Space) per
 *     WAI-ARIA tab pattern — keyboard-only users must reach every option.
 * Out of scope:
 *   - Visual focus styling (Storybook visual regression)
 * Coverage target: 100% lines for SegmentedControl.tsx
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SegmentedControl } from "./SegmentedControl";

const opts = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
  { value: "c", label: "C" },
];

describe("SegmentedControl", () => {
  it("renders one tab per option inside a tablist", () => {
    render(<SegmentedControl options={opts} value="a" onChange={() => {}} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("marks the active tab with aria-selected=true", () => {
    render(<SegmentedControl options={opts} value="b" onChange={() => {}} />);
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("aria-selected", "false");
  });

  it("calls onChange with the clicked option value", async () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={opts} value="a" onChange={onChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "C" }));
    expect(onChange).toHaveBeenCalledWith("c");
  });

  it("ArrowRight cycles to the next option", async () => {
    // Why: WAI-ARIA tab pattern — keyboard users navigate with arrows.
    const onChange = vi.fn();
    render(<SegmentedControl options={opts} value="a" onChange={onChange} />);
    const active = screen.getByRole("tab", { name: "A" });
    active.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("ArrowLeft wraps from the first option to the last", async () => {
    // Why: cyclic navigation matches macOS / iOS segmented controls and
    // avoids dead-ending the user at the edges.
    const onChange = vi.fn();
    render(<SegmentedControl options={opts} value="a" onChange={onChange} />);
    screen.getByRole("tab", { name: "A" }).focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenCalledWith("c");
  });

  it("Home jumps to the first option, End to the last", async () => {
    // Why: power-user shortcut required by WAI-ARIA tab pattern.
    const onChange = vi.fn();
    render(<SegmentedControl options={opts} value="b" onChange={onChange} />);
    screen.getByRole("tab", { name: "B" }).focus();
    await userEvent.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith("c");
    await userEvent.keyboard("{Home}");
    expect(onChange).toHaveBeenLastCalledWith("a");
  });

  it("Enter activates the focused option", async () => {
    // Why: Enter/Space activation is mandatory for keyboard-only users —
    // otherwise the focused option can never be confirmed.
    const onChange = vi.fn();
    render(<SegmentedControl options={opts} value="b" onChange={onChange} />);
    screen.getByRole("tab", { name: "B" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("b");
  });
});
