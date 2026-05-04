import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider, useToast } from "./Toast";

const meta: Meta = {
  title: "shared/ui/Toast",
  tags: ["autodocs"],
};
export default meta;

function Demo({ tone, msg }: { tone?: "default" | "success" | "danger"; msg: string }) {
  const { show } = useToast();
  return (
    <button
      type="button"
      onClick={() => show(msg, tone)}
      style={{ padding: "10px 16px", borderRadius: 6, background: "var(--brand)", color: "#fff", border: "none" }}
    >
      Show {tone ?? "default"}
    </button>
  );
}

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <Demo msg="저장되었습니다" />
    </ToastProvider>
  ),
};

export const Success: Story = {
  render: () => (
    <ToastProvider>
      <Demo tone="success" msg="신청이 완료되었습니다" />
    </ToastProvider>
  ),
};

export const Danger: Story = {
  render: () => (
    <ToastProvider>
      <Demo tone="danger" msg="네트워크 오류가 발생했습니다" />
    </ToastProvider>
  ),
};
