/**
 * Test: shared/ui · TabBar
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  Bottom tab bar is the primary navigation on every mobile screen.
 *       Lost link or wrong active state strands the user; badge regressions
 *       hide pending leave approvals.
 * Covers:
 *   - Renders four NavLink tabs (home, team, leave, my)
 *   - Active tab uses brand color when route matches
 *   - Badge count rendered when provided; absent when not
 * Out of scope:
 *   - i18n string content (route key returned)
 *   - Real navigation (handled by react-router)
 * Coverage target: ≥ 90% lines for TabBar.tsx
 */
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithRouter } from "../../../test/renderWithRouter";

import { TabBar } from "./TabBar";

describe("TabBar", () => {
  it("renders four tabs as links", () => {
    renderWithRouter(<TabBar />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(4);
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toEqual(
      expect.arrayContaining(["/m/home", "/m/team", "/m/leave", "/m/my"]),
    );
  });

  it("renders a badge when one is supplied", () => {
    renderWithRouter(<TabBar badges={{ leave: 3 }} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders no badges when badges map empty", () => {
    renderWithRouter(<TabBar />);
    // numeric badges are rendered as small <span> with the number
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
  });

  it("highlights the active route by URL match", () => {
    renderWithRouter(<TabBar />, { route: "/m/team" });
    const teamLink = screen
      .getAllByRole("link")
      .find((l) => l.getAttribute("href") === "/m/team")!;
    // NavLink applies inline style with brand color when active
    expect(teamLink.getAttribute("style")).toContain("var(--brand)");
  });

  it("marks the active tab with aria-current=page", () => {
    // Why: SR users must hear which tab they are on. NavLink's `aria-current`
    // is wired on the inner label span.
    renderWithRouter(<TabBar />, { route: "/m/leave" });
    const current = document.querySelector('[aria-current="page"]');
    expect(current).not.toBeNull();
  });

  it("focuses the next tab on Tab key", async () => {
    // Why: keyboard users navigate the tab strip with the Tab key. Each
    // NavLink must be in the natural tab order with a visible focus ring
    // (CSS-tested elsewhere, here we just confirm focus moves).
    const user = userEvent.setup();
    renderWithRouter(<TabBar />);
    const links = screen.getAllByRole("link");
    links[0].focus();
    expect(document.activeElement).toBe(links[0]);
    await user.tab();
    expect(document.activeElement).toBe(links[1]);
  });
});
