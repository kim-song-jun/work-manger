/**
 * Test: shared/ui · KPIStat
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  KPIStat is the headline number on every dashboard card. Hiding the
 *       unit or showing the wrong delta sign misleads managers reading at a glance.
 * Covers:
 *   - Renders label + value + unit
 *   - Renders hint when supplied
 *   - Delta colour switches by deltaPositive
 *   - Omits delta block when neither delta nor hint supplied
 * Out of scope:
 *   - Token-based number font (Storybook visual)
 * Coverage target: 100% lines for KPIStat.tsx
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { KPIStat } from "./KPIStat";

describe("KPIStat", () => {
  it("renders label, value, and unit", () => {
    render(<KPIStat label="근무" value={152} unit="h" />);
    expect(screen.getByText("근무")).toBeInTheDocument();
    expect(screen.getByText("152")).toBeInTheDocument();
    expect(screen.getByText("h")).toBeInTheDocument();
  });

  it("renders hint when provided", () => {
    render(<KPIStat label="x" value={1} hint="지난주 대비" />);
    expect(screen.getByText("지난주 대비")).toBeInTheDocument();
  });

  it("colors delta green when deltaPositive=true", () => {
    render(<KPIStat label="x" value={1} delta="+1%" deltaPositive />);
    const el = screen.getByText("+1%");
    expect(el).toHaveStyle({ color: "var(--success)" });
  });

  it("colors delta red when deltaPositive=false", () => {
    render(<KPIStat label="x" value={1} delta="-1%" deltaPositive={false} />);
    const el = screen.getByText("-1%");
    expect(el).toHaveStyle({ color: "var(--danger)" });
  });

  it("omits the delta/hint row when neither supplied", () => {
    render(<KPIStat label="x" value={1} />);
    expect(screen.queryByText(/대비/)).not.toBeInTheDocument();
  });
});
