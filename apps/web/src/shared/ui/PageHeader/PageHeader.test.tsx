/**
 * Test: shared/ui · PageHeader
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  Header is the orientation cue on every mobile page. Title regression
 *       leaves users unsure which screen they are on.
 * Covers:
 *   - Renders title (h1) and optional date / subtitle
 *   - Renders a custom action when provided (overrides default bell)
 *   - Renders default bell SVG when no action supplied
 * Out of scope:
 *   - Theme color tokens (Storybook visual)
 * Coverage target: ≥ 90% lines for PageHeader.tsx
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders title as h1", () => {
    render(<PageHeader title="오늘" />);
    expect(screen.getByRole("heading", { level: 1, name: "오늘" })).toBeInTheDocument();
  });

  it("renders date and subtitle when provided", () => {
    render(<PageHeader title="t" date="2026.05.04" subtitle="설명" />);
    expect(screen.getByText("2026.05.04")).toBeInTheDocument();
    expect(screen.getByText("설명")).toBeInTheDocument();
  });

  it("renders custom action when provided", () => {
    render(
      <PageHeader title="t" action={<button type="button">설정</button>} />,
    );
    expect(screen.getByRole("button", { name: "설정" })).toBeInTheDocument();
  });

  it("renders default bell svg when no action provided", () => {
    const { container } = render(<PageHeader title="t" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
