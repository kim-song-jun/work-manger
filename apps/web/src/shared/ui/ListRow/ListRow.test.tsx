/**
 * Test: shared/ui · ListRow
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  ListRow is the dominant tap target in every settings/inbox/team list.
 *       Click handler must fire and visual cues for `selected`/`danger`
 *       must render reliably (a swallowed click means a stuck UI).
 * Covers:
 *   - Title / subtitle / meta render
 *   - onClick fires once
 *   - Trailing chevron rendered by default; `trailing="none"` hides it
 *   - Selected applies brand background; danger applies danger title color
 *   - Custom trailing slot is used as-is
 * Out of scope:
 *   - Keyboard activation (ListRow currently is a div, not button — tracked separately)
 * Coverage target: ≥ 90% lines for ListRow.tsx
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListRow } from "./ListRow";

describe("ListRow", () => {
  it("renders title, subtitle, and meta", () => {
    render(<ListRow title="제목" subtitle="설명" meta="08:42" />);
    expect(screen.getByText("제목")).toBeInTheDocument();
    expect(screen.getByText("설명")).toBeInTheDocument();
    expect(screen.getByText("08:42")).toBeInTheDocument();
  });

  it("fires onClick when row clicked", async () => {
    const onClick = vi.fn();
    render(<ListRow title="t" onClick={onClick} />);
    await userEvent.click(screen.getByText("t"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders default chevron and hides it when trailing=none", () => {
    const { container, rerender } = render(<ListRow title="t" />);
    expect(container.querySelector("svg")).not.toBeNull();
    rerender(<ListRow title="t" trailing="none" />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("renders custom trailing slot", () => {
    render(<ListRow title="t" trailing={<span>custom</span>} />);
    expect(screen.getByText("custom")).toBeInTheDocument();
  });

  it("applies selected background and brand title color", () => {
    const { container } = render(<ListRow title="sel" selected />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.background).toBe("var(--brand-soft)");
    expect(screen.getByText("sel")).toHaveStyle({ color: "var(--brand)" });
  });

  it("applies danger color for title", () => {
    render(<ListRow title="del" danger />);
    expect(screen.getByText("del")).toHaveStyle({ color: "var(--danger)" });
  });
});
