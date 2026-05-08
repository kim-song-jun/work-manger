import type { Meta, StoryObj } from "@storybook/react";

import { TextField } from "./TextField";

const meta: Meta<typeof TextField> = {
  title: "shared/ui/TextField",
  component: TextField,
  tags: ["autodocs"],
  args: { placeholder: "이메일을 입력하세요" },
  argTypes: {
    type: { control: "select", options: ["text", "email", "password", "number"] },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof TextField>;

export const Default: Story = {};
export const WithLabel: Story = { args: { label: "이메일", type: "email" } };
export const WithHint: Story = {
  args: { label: "비밀번호", type: "password", hint: "8자 이상, 영문+숫자" },
};
export const WithError: Story = {
  args: { label: "이메일", type: "email", error: "올바른 이메일 형식이 아닙니다" },
};
export const Disabled: Story = { args: { label: "이메일", disabled: true, value: "you@co.kr" } };
