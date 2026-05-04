import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Sheet } from "./Sheet";

const meta: Meta<typeof Sheet> = {
  title: "shared/ui/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof Sheet>;

function Demo({ initialOpen = true, title = "필터" }: { initialOpen?: boolean; title?: string }) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <div style={{ position: "relative", width: 380, height: 600, background: "var(--grey-100)" }}>
      <button type="button" onClick={() => setOpen(true)} style={{ margin: 16 }}>
        Open
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={title}>
        <p style={{ marginTop: 12 }}>여기에 콘텐츠가 들어갑니다.</p>
        <button type="button" onClick={() => setOpen(false)}>
          닫기
        </button>
      </Sheet>
    </div>
  );
}

export const OpenSnapshot: Story = { render: () => <Demo /> };
export const Closed: Story = { render: () => <Demo initialOpen={false} /> };
export const NoTitle: Story = { render: () => <Demo title={undefined as unknown as string} /> };
