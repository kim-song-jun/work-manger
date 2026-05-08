import type { Meta, StoryObj } from "@storybook/react";

import { Avatar } from "../Avatar";
import { StatusDot } from "../StatusDot";

import { ListRow } from "./ListRow";

const meta: Meta<typeof ListRow> = {
  title: "shared/ui/ListRow",
  component: ListRow,
  tags: ["autodocs"],
  args: { title: "기본 행", subtitle: "보조 텍스트" },
  argTypes: {
    selected: { control: "boolean" },
    danger: { control: "boolean" },
    divider: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof ListRow>;

export const Default: Story = {};
export const WithLeading: Story = {
  args: { leading: <Avatar name="김민수" size={32} /> },
};
export const WithMeta: Story = { args: { meta: "08:42" } };
export const WithStatusLeading: Story = {
  args: { leading: <StatusDot status="office" />, title: "재실 중" },
};
export const TrailingNone: Story = { args: { trailing: "none" } };
export const Selected: Story = { args: { selected: true } };
export const Danger: Story = { args: { danger: true, title: "회원 탈퇴" } };
export const NoDivider: Story = { args: { divider: false } };
