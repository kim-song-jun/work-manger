import type { Meta, StoryObj } from "@storybook/react";
import { FormField } from "./FormField";

const meta: Meta<typeof FormField> = {
  title: "shared/ui/FormField",
  component: FormField,
  tags: ["autodocs"],
  args: {
    label: "이메일",
    children: <input className="block w-full h-12 rounded-md bg-ink-100 px-4" />,
  },
  argTypes: {
    label: { control: "text" },
    hint: { control: "text" },
    error: { control: "text" },
    required: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof FormField>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: "회사 이메일 주소" } };
export const Required: Story = { args: { required: true } };
export const WithError: Story = { args: { error: "올바른 이메일을 입력하세요" } };
