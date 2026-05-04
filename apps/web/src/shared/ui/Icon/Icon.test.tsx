/**
 * Test: shared/ui · Icon
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  Icon set is referenced by name across every navigation surface
 *       (TabBar, ListRow, headers). A renamed key crashes the page.
 * Covers:
 *   - Each named icon renders an <svg>
 *   - viewBox stays "0 0 24 24" (any change rescales the entire UI)
 *   - SVG props (width/height) are passed through
 * Out of scope:
 *   - Path d-attribute correctness (visual concern → Storybook gallery)
 * Coverage target: 100% lines for Icon.tsx
 */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Icon } from "./Icon";

const names = Object.keys(Icon) as Array<keyof typeof Icon>;

describe("Icon", () => {
  it("exports the expected nav icons", () => {
    for (const required of ["home", "team", "calendar", "user", "settings", "bell", "close"]) {
      expect(Icon).toHaveProperty(required);
    }
  });

  it.each(names)("renders an <svg> for %s", (name) => {
    const Ic = Icon[name];
    const { container } = render(<Ic />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("viewBox")).toBe("0 0 24 24");
  });

  it("passes through width/height props", () => {
    const { container } = render(<Icon.home width={48} height={48} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("48");
    expect(svg.getAttribute("height")).toBe("48");
  });
});
