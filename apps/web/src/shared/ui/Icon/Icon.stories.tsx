import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "./Icon";

const names = Object.keys(Icon) as Array<keyof typeof Icon>;

const meta: Meta = {
  title: "shared/ui/Icon",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj;

export const Gallery: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 16,
        textAlign: "center",
        color: "var(--grey-700)",
      }}
    >
      {names.map((n) => {
        const Ic = Icon[n];
        return (
          <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <Ic width={28} height={28} />
            <span style={{ fontSize: 11, color: "var(--grey-500)" }}>{n}</span>
          </div>
        );
      })}
    </div>
  ),
};

export const Single: Story = {
  render: () => <Icon.home width={32} height={32} />,
};

export const Brand: Story = {
  render: () => (
    <div style={{ color: "var(--brand)" }}>
      <Icon.check width={48} height={48} />
    </div>
  ),
};
