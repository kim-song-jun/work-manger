/**
 * Test: shared/ui · StatRow
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  StatRow is the compact label/value strip used in the home dashboard.
 *       Wrong column count or swapped colors would mislead employees about
 *       their hours.
 * Covers:
 *   - Renders one column per item with the correct label + value
 *   - grid-template-columns matches the number of items
 *   - inverse variant flips text color to white
 * Out of scope:
 *   - Number formatting (caller's job)
 * Coverage target: 100% lines for StatRow.tsx
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { StatRow } from "./StatRow";

const items = [
  { label: "출근", value: "08:42" },
  { label: "퇴근", value: "18:01" },
  { label: "근무", value: "8h 19m" },
];

describe("StatRow", () => {
  it("renders all items", () => {
    render(<StatRow items={items} />);
    for (const i of items) {
      expect(screen.getByText(i.label)).toBeInTheDocument();
      expect(screen.getByText(i.value)).toBeInTheDocument();
    }
  });

  it("uses gridTemplateColumns matching item count", () => {
    const { container } = render(<StatRow items={items} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.gridTemplateColumns).toBe("repeat(3, 1fr)");
  });

  it("uses white value color in inverse variant", () => {
    render(<StatRow items={items} variant="inverse" />);
    expect(screen.getByText("08:42")).toHaveStyle({ color: "rgb(255, 255, 255)" });
  });
});
