/**
 * Test: shared/ui · Skeleton
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  Skeleton is the universal loading placeholder; if width/height props
 *       silently break, every loading state collapses to 0×0.
 * Covers:
 *   - Default width/height/radius applied
 *   - Custom width/height/radius applied
 *   - wm-skeleton class always present
 *   - Custom className appended
 * Out of scope:
 *   - Shimmer animation (CSS, not testable in jsdom)
 * Coverage target: 100% lines for Skeleton.tsx
 */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders with default styles and class", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveClass("wm-skeleton");
    expect(el.style.width).toBe("100%");
    expect(el.style.height).toBe("16px");
    expect(el.style.borderRadius).toBe("8px");
  });

  it("applies custom dimensions", () => {
    const { container } = render(<Skeleton width={120} height={40} radius={20} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe("120px");
    expect(el.style.height).toBe("40px");
    expect(el.style.borderRadius).toBe("20px");
  });

  it("appends custom className", () => {
    const { container } = render(<Skeleton className="extra" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveClass("wm-skeleton");
    expect(el).toHaveClass("extra");
  });
});
