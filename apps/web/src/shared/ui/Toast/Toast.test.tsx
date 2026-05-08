/**
 * Test: shared/ui · Toast
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  Toasts confirm async outcomes (clock-in success, leave submit). A
 *       silently dropped toast leaves users uncertain whether their action
 *       was accepted.
 * Covers:
 *   - useToast outside provider falls back to no-op (no throw)
 *   - show() renders the message inside the provider
 *   - tone="success" / "danger" pick the corresponding background color
 *   - Toast auto-dismisses after timeout (vi.useFakeTimers + advance)
 * Out of scope:
 *   - Animation classnames
 *   - Multiple-toast stacking layout
 * Coverage target: ≥ 90% lines for Toast.tsx
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ToastProvider, useToast } from "./Toast";

function Trigger({ tone, msg }: { tone?: "default" | "success" | "danger"; msg: string }) {
  const { show } = useToast();
  return (
    <button type="button" onClick={() => show(msg, tone)}>
      go
    </button>
  );
}

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("useToast outside provider returns a no-op (no throw)", () => {
    function Lone() {
      const { show } = useToast();
      show("hello"); // must not throw
      return <div>ok</div>;
    }
    expect(() => render(<Lone />)).not.toThrow();
  });

  it("renders the message after show() is called", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <ToastProvider>
        <Trigger msg="저장됨" />
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "go" }));
    expect(screen.getByText("저장됨")).toBeInTheDocument();
  });

  it("uses success background when tone=success", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <ToastProvider>
        <Trigger tone="success" msg="ok" />
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "go" }));
    expect(screen.getByText("ok")).toHaveStyle({ background: "var(--success)" });
  });

  it("uses danger background when tone=danger", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <ToastProvider>
        <Trigger tone="danger" msg="err" />
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "go" }));
    expect(screen.getByText("err")).toHaveStyle({ background: "var(--danger)" });
  });

  it("auto-dismisses after the timeout", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <ToastProvider>
        <Trigger msg="bye" />
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "go" }));
    expect(screen.getByText("bye")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(screen.queryByText("bye")).not.toBeInTheDocument();
  });
});
