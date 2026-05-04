import type { Meta, StoryObj } from "@storybook/react";
import { StatusDot } from "./StatusDot";

const meta: Meta<typeof StatusDot> = {
  title: "shared/ui/StatusDot",
  component: StatusDot,
  tags: ["autodocs"],
  args: { status: "office", size: 10 },
  argTypes: {
    status: { control: "select", options: ["office", "wfh", "leave", "break", "off"] },
    size: { control: { type: "number", min: 6, max: 24 } },
    ring: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof StatusDot>;

export const Office: Story = { args: { status: "office" } };
export const Wfh: Story = { args: { status: "wfh" } };
export const Leave: Story = { args: { status: "leave" } };
export const Break: Story = { args: { status: "break" } };
export const Off: Story = { args: { status: "off" } };

export const All: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <StatusDot status="office" />
      <StatusDot status="wfh" />
      <StatusDot status="leave" />
      <StatusDot status="break" />
      <StatusDot status="off" />
    </div>
  ),
};

export const WithRing: Story = { args: { ring: true, size: 14 } };
