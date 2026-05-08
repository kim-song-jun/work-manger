/**
 * Test: shared/ui · Button
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  Button 은 모든 화면의 1차 액션 트리거 (출근, 신청, 승인 등).
 *       disabled 가 깨지면 사용자가 더블탭으로 중복 요청을 발생시킬 위험 — 회귀 비용 큼.
 * Covers:
 *   - 라벨 렌더 (스크린리더 접근성: role=button)
 *   - disabled 시 onClick 미호출
 *   - 정상 클릭 시 onClick 1회 호출
 * Out of scope:
 *   - variant/size 스타일 시각 검증 → Storybook 스냅샷 (chromatic 도입 후)
 *   - 키보드 enter/space 활성화 → 별도 a11y 테스트로 추가 예정
 * Coverage target: 100% lines + 100% branches for Button.tsx
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "./Button";

describe("Button", () => {
  it("renders label", () => {
    render(<Button>출근하기</Button>);
    expect(screen.getByRole("button", { name: "출근하기" })).toBeInTheDocument();
  });

  it("respects disabled", async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>x</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>x</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
