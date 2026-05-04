import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import { within, userEvent, expect } from "@storybook/test";
import { TabBar } from "./TabBar";

const meta: Meta<typeof TabBar> = {
  title: "shared/ui/TabBar",
  component: TabBar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/m/home"]}>
        <div style={{ width: 380, background: "var(--white)" }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof TabBar>;

export const Default: Story = {};
export const WithBadge: Story = { args: { badges: { leave: 3 } } };
export const MultiBadge: Story = { args: { badges: { team: 1, leave: 2, my: 9 } } };

/**
 * Interaction: clicking a tab should be routable. Even though our story uses
 * MemoryRouter (no real navigation), `userEvent.click` should still complete
 * without throwing, proving NavLink wires up correctly.
 */
export const PlayClickTab: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const links = c.getAllByRole("link");
    await expect(links.length).toBe(4);
    await userEvent.click(links[1]);
  },
};
