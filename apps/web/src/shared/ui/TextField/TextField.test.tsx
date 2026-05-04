/**
 * Test: shared/ui · TextField
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  TextField is used in every form (login, signup, leave-apply, ...).
 *       Lost ref / silenced onChange = forms users can't submit.
 * Covers:
 *   - Renders label + input
 *   - Forwarded ref attaches to the input
 *   - onChange fires per keystroke; controlled value updates round-trip
 *   - Error overrides hint; danger ring class applied
 *   - Disabled prevents typing
 * Out of scope:
 *   - Inputmode/autoComplete (browser concern)
 * Coverage target: ≥ 95% lines for TextField.tsx
 */
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextField } from "./TextField";

describe("TextField", () => {
  it("renders label and input", () => {
    render(<TextField label="이메일" />);
    expect(screen.getByText("이메일")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("forwards ref to the input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextField ref={ref} label="x" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("calls onChange on keystroke", async () => {
    const onChange = vi.fn();
    render(<TextField label="x" onChange={onChange} />);
    await userEvent.type(screen.getByRole("textbox"), "ab");
    expect(onChange).toHaveBeenCalled();
  });

  it("supports controlled value", async () => {
    function Wrap() {
      const [v, setV] = useState("");
      return <TextField label="x" value={v} onChange={(e) => setV(e.target.value)} />;
    }
    render(<Wrap />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    await userEvent.type(input, "hello");
    expect(input.value).toBe("hello");
  });

  it("renders error text and applies the danger ring class", () => {
    render(<TextField label="x" error="bad" hint="ok" />);
    expect(screen.getByText("bad")).toBeInTheDocument();
    expect(screen.queryByText("ok")).not.toBeInTheDocument();
    const input = screen.getByRole("textbox");
    expect(input.className).toMatch(/ring-danger/);
  });

  it("renders hint when no error", () => {
    render(<TextField label="x" hint="hint-text" />);
    expect(screen.getByText("hint-text")).toBeInTheDocument();
  });

  it("disabled prevents typing", async () => {
    const onChange = vi.fn();
    render(<TextField label="x" disabled onChange={onChange} />);
    await userEvent.type(screen.getByRole("textbox"), "a");
    expect(onChange).not.toHaveBeenCalled();
  });
});
