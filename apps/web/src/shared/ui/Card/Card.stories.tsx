import type { Meta, StoryObj } from "@storybook/react";

import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  title: "shared/ui/Card",
  component: Card,
  tags: ["autodocs"],
  args: { children: "카드 내용", padding: 16 },
  argTypes: {
    variant: { control: "select", options: ["plain", "elevated", "subtle", "flat"] },
    padding: { control: { type: "number", min: 0, max: 32 } },
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Plain: Story = { args: { variant: "plain" } };
export const Elevated: Story = { args: { variant: "elevated" } };
export const Subtle: Story = { args: { variant: "subtle" } };
export const Flat: Story = { args: { variant: "flat" } };

export const DensePadding: Story = {
  args: { variant: "plain", padding: 8, children: "Dense" },
};

export const Clickable: Story = {
  args: {
    variant: "elevated",
    children: "Click me",
    onClick: () => alert("clicked"),
  },
};
