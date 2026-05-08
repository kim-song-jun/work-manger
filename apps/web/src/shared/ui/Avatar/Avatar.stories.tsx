import type { Meta, StoryObj } from "@storybook/react";

import { Avatar } from "./Avatar";

const meta: Meta<typeof Avatar> = {
  title: "shared/ui/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: { name: "김민수", size: 40 },
  argTypes: {
    size: { control: { type: "number", min: 16, max: 96, step: 4 } },
    color: { control: "color" },
    src: { control: "text" },
  },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};
export const Size24: Story = { args: { size: 24, name: "박" } };
export const Size32: Story = { args: { size: 32, name: "이지원" } };
export const Size40: Story = { args: { size: 40, name: "최성준" } };
export const Size48: Story = { args: { size: 48, name: "조하은" } };

export const WithImage: Story = {
  args: {
    name: "Image",
    size: 48,
    src: "https://placekitten.com/96/96",
  },
};

export const SizesRow: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Avatar name="A" size={24} />
      <Avatar name="B" size={32} />
      <Avatar name="C" size={40} />
      <Avatar name="D" size={48} />
    </div>
  ),
};
