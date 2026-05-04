/**
 * Test: shared/ui · StatusDot
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  StatusDot is the at-a-glance presence indicator across the team grid.
 *       Wrong color = wrong status = manager misjudgement.
 * Covers:
 *   - Each status maps to its --s-{status} CSS variable background
 *   - size prop controls width/height
 *   - ring prop adds a white border
 * Out of scope:
 *   - Token color definitions (theming concern)
 * Coverage target: 100% lines for StatusDot.tsx
 */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { StatusDot, type StatusKind } from "./StatusDot";

describe("StatusDot", () => {
  it.each(["office", "wfh", "leave", "break", "off"] as StatusKind[])(
    "applies the --s-%s background",
    (s) => {
      const { container } = render(<StatusDot status={s} />);
      const el = container.firstElementChild as HTMLElement;
      expect(el.style.background).toBe(`var(--s-${s})`);
    },
  );

  it("respects custom size", () => {
    const { container } = render(<StatusDot status="office" size={20} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe("20px");
    expect(el.style.height).toBe("20px");
  });

  it("adds a ring border when ring=true", () => {
    const { container } = render(<StatusDot status="office" ring />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.border).toBe("2px solid var(--white)");
  });
});
