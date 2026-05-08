/**
 * Test: shared/ui · Switch
 * Type: Unit (vitest + RTL, jsdom)
 * Spec: docs/design/design-system.md §7.2 — F-DESIGN-013
 *
 * Covers:
 *   - role="switch" + aria-checked presence (a11y)
 *   - onChange emitted on click
 *   - disabled blocks onChange
 *   - Space key toggles (keyboard a11y)
 *   - label renders and is accessible
 *   - hit-target ≥44×44 px (WCAG 2.5.8) for size=md
 *   - hit-target ≥32×32 px for size=sm
 *   - aria-label used when no label text
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Switch } from "./Switch";

describe("Switch", () => {
  it("renders with role=switch and correct aria-checked (OFF)", () => {
    render(<Switch checked={false} onChange={vi.fn()} aria-label="test toggle" />);
    const btn = screen.getByRole("switch");
    expect(btn).toHaveAttribute("aria-checked", "false");
  });

  it("renders aria-checked=true when checked", () => {
    render(<Switch checked={true} onChange={vi.fn()} aria-label="test toggle" />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange with toggled value on click", async () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} aria-label="test toggle" />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not call onChange when disabled", async () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} disabled aria-label="test toggle" />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("toggles via Space key (keyboard a11y)", async () => {
    const onChange = vi.fn();
    render(<Switch checked={true} onChange={onChange} aria-label="test toggle" />);
    const btn = screen.getByRole("switch");
    btn.focus();
    await userEvent.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("renders visible label text", () => {
    render(<Switch checked={false} onChange={vi.fn()} label="52시간 초과 차단" />);
    expect(screen.getByText("52시간 초과 차단")).toBeInTheDocument();
  });

  it("has aria-disabled when disabled", () => {
    render(<Switch checked={false} onChange={vi.fn()} disabled aria-label="test" />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-disabled", "true");
  });

  it("md size hit-target wrapper is ≥44×44px", () => {
    render(<Switch checked={false} onChange={vi.fn()} size="md" aria-label="test" />);
    const btn = screen.getByRole("switch");
    // The wrapper span has minWidth/minHeight 44 via inline style; check via parent
    const wrapper = btn.parentElement!;
    expect(wrapper).toHaveStyle({ minWidth: "44px", minHeight: "44px" });
  });

  it("sm size hit-target wrapper is ≥32×32px", () => {
    render(<Switch checked={false} onChange={vi.fn()} size="sm" aria-label="test" />);
    const btn = screen.getByRole("switch");
    const wrapper = btn.parentElement!;
    expect(wrapper).toHaveStyle({ minWidth: "32px", minHeight: "32px" });
  });
});
