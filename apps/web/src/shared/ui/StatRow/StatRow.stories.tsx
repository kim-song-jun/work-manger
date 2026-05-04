import type { Meta, StoryObj } from "@storybook/react";
import { StatRow } from "./StatRow";

const meta: Meta<typeof StatRow> = {
  title: "shared/ui/StatRow",
  component: StatRow,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "radio", options: ["default", "inverse"] },
  },
};
export default meta;

type Story = StoryObj<typeof StatRow>;

export const Default: Story = {
  args: {
    items: [
      { label: "출근", value: "08:42" },
      { label: "퇴근", value: "18:01" },
      { label: "근무", value: "8h 19m" },
    ],
  },
};

export const Inverse: Story = {
  args: {
    variant: "inverse",
    items: [
      { label: "이번주", value: "32h" },
      { label: "이번달", value: "152h" },
    ],
  },
  parameters: { backgrounds: { default: "dark" } },
};
