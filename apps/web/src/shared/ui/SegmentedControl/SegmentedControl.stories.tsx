import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { within, userEvent, expect } from "@storybook/test";
import { SegmentedControl } from "./SegmentedControl";

const meta: Meta<typeof SegmentedControl> = {
  title: "shared/ui/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof SegmentedControl<string>>;

function ControlledTwo() {
  const [v, setV] = useState("today");
  return (
    <SegmentedControl
      value={v}
      onChange={setV}
      options={[
        { value: "today", label: "오늘" },
        { value: "week", label: "이번주" },
      ]}
    />
  );
}

function ControlledThree() {
  const [v, setV] = useState("day");
  return (
    <SegmentedControl
      value={v}
      onChange={setV}
      options={[
        { value: "day", label: "일" },
        { value: "week", label: "주" },
        { value: "month", label: "월" },
      ]}
    />
  );
}

export const TwoSegments: Story = {
  render: () => <ControlledTwo />,
};

export const ThreeSegments: Story = {
  render: () => <ControlledThree />,
};

/**
 * Interaction test: clicking the second segment selects it.
 * Storybook 8 `play` runs in-browser via @storybook/test.
 */
export const PlaySelect: Story = {
  render: () => <ControlledThree />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const month = c.getByRole("tab", { name: "월" });
    await userEvent.click(month);
    await expect(month).toHaveAttribute("aria-selected", "true");
  },
};
