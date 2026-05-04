/**
 * Test: shared/ui · Avatar
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  Avatar is rendered for every member in team rosters; a regression
 *       (wrong initial / missing image) is immediately visible to all users.
 * Covers:
 *   - Renders the first upper-cased character of `name` when no src
 *   - Falls back to "?" when name is empty
 *   - Renders an <img> with the provided src and decorative empty alt
 *   - Applies the requested pixel size to width/height inline style
 * Out of scope:
 *   - Color hash collision / theming (visual concern → Storybook)
 * Coverage target: 100% lines + branches for Avatar.tsx
 */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("renders the first upper-cased initial of the name", () => {
    const { getByText } = render(<Avatar name="민수" />);
    expect(getByText("민")).toBeInTheDocument();
  });

  it("renders an upper-cased ASCII initial", () => {
    const { getByText } = render(<Avatar name="alice" />);
    expect(getByText("A")).toBeInTheDocument();
  });

  it("falls back to '?' when name is empty", () => {
    const { getByText } = render(<Avatar name="" />);
    expect(getByText("?")).toBeInTheDocument();
  });

  it("renders an <img> when src is provided", () => {
    const { container } = render(<Avatar name="x" src="/avatar.png" />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("src", "/avatar.png");
    // decorative — empty alt so screen readers skip it
    expect(img).toHaveAttribute("alt", "");
  });

  it("applies custom size to inline style", () => {
    const { container } = render(<Avatar name="x" size={56} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.width).toBe("56px");
    expect(root.style.height).toBe("56px");
  });
});
