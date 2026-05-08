import type { Meta, StoryObj } from "@storybook/react";

import { KPIStat } from "./KPIStat";

const meta: Meta<typeof KPIStat> = {
  title: "shared/ui/KPIStat",
  component: KPIStat,
  tags: ["autodocs"],
  args: { label: "이번 달 근무", value: 152, unit: "h" },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
    deltaPositive: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof KPIStat>;

export const Default: Story = {};
export const WithUnit: Story = { args: { value: 24.5, unit: "일" } };
export const WithDeltaUp: Story = {
  args: { delta: "+2.5%", deltaPositive: true, hint: "지난주 대비" },
};
export const WithDeltaDown: Story = {
  args: { delta: "-1.0%", deltaPositive: false, hint: "지난달 대비" },
};
export const Large: Story = { args: { size: "xl", value: 7, unit: "건" } };
