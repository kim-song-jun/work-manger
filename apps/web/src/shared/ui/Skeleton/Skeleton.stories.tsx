import type { Meta, StoryObj } from "@storybook/react";

import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "shared/ui/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  args: { width: 240, height: 16, radius: 8 },
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Text: Story = { args: { width: 240, height: 16 } };
export const TitleAndLines: Story = {
  render: () => (
    <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 8 }}>
      <Skeleton width={180} height={20} />
      <Skeleton width="100%" height={14} />
      <Skeleton width="80%" height={14} />
    </div>
  ),
};
export const Avatar: Story = { args: { width: 40, height: 40, radius: 20 } };
export const Card: Story = { args: { width: 280, height: 120, radius: 12 } };
