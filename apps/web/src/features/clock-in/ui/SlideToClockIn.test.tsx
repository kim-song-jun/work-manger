/**
 * Test: features/clock-in · SlideToClockIn
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  Slide-to-confirm 위젯은 09:00 트래픽 피크의 1차 액션. 라벨이 깨지면
 *       사용자가 출근 vs 퇴근을 구분 못 한다. onCommit 가 disabled 시 호출되면
 *       중복 출근으로 이어져 회귀 비용이 매우 크다.
 * Covers:
 *   - role=slider 와 적절한 aria-label 노출 (출근 / 퇴근 라벨 분기)
 *   - active=true 시 퇴근 라벨 노출
 *   - disabled 일 때 aria-disabled 가 true
 * Out of scope:
 *   - 실제 포인터 드래그 동작 (브라우저 e2e 영역)
 *   - 네트워크 호출 (HomePage 통합 테스트가 다룸)
 * Coverage target: ≥ 80% lines for SlideToClockIn.tsx
 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SlideToClockIn } from "./SlideToClockIn";

describe("SlideToClockIn", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the clock-in label when inactive", () => {
    render(
      <SlideToClockIn
        active={false}
        onCommit={() => {}}
        labelIn="밀어서 출근"
        labelOut="밀어서 퇴근"
      />,
    );
    expect(screen.getByRole("slider", { name: "밀어서 출근" })).toBeInTheDocument();
  });

  it("shows the clock-out label when active", () => {
    render(
      <SlideToClockIn
        active={true}
        onCommit={() => {}}
        labelIn="밀어서 출근"
        labelOut="밀어서 퇴근"
      />,
    );
    expect(screen.getByRole("slider", { name: "밀어서 퇴근" })).toBeInTheDocument();
  });

  it("renders aria-disabled when disabled", () => {
    const onCommit = vi.fn();
    render(
      <SlideToClockIn
        active={false}
        disabled
        onCommit={onCommit}
        labelIn="A"
        labelOut="B"
      />,
    );
    const el = screen.getByRole("slider");
    expect(el).toHaveAttribute("aria-disabled", "true");
  });

  it("commits from the keyboard fallback", () => {
    vi.useFakeTimers();
    const onCommit = vi.fn();
    render(
      <SlideToClockIn
        active={false}
        onCommit={onCommit}
        labelIn="A"
        labelOut="B"
      />,
    );
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "Enter" });

    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(onCommit).toHaveBeenCalledTimes(1);
  });
});
