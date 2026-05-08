import type { Meta, StoryObj } from "@storybook/react";

import { PageHeader } from "./PageHeader";

const meta: Meta<typeof PageHeader> = {
  title: "shared/ui/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  args: { title: "오늘", date: "2026.05.04 (월)" },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    hasBadge: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {};
export const WithSubtitle: Story = { args: { subtitle: "오전 9시 출근 권장" } };
export const WithBadge: Story = { args: { hasBadge: true } };
export const Dark: Story = { args: { theme: "dark", hasBadge: true } };

export const WithCustomAction: Story = {
  args: {
    title: "팀",
    action: (
      <button
        type="button"
        style={{
          padding: "6px 12px",
          background: "var(--brand)",
          color: "#fff",
          borderRadius: 6,
          border: "none",
        }}
      >
        설정
      </button>
    ),
  },
};
