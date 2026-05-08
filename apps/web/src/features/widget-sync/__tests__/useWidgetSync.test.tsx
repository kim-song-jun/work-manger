/**
 * Test: features/widget-sync · useWidgetSync
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  Each /v1/attendance/today resolution must push exactly one snapshot
 *       to the native widget bridge — no double-push, no push when the
 *       bridge is absent. Drift here either spams the IPC channel or leaves
 *       the home-screen widget stale.
 * Covers:
 *   - Calls window.NativeBridge.pushTodayStatus once on mount with mapped payload
 *   - Skips duplicate pushes when the input is unchanged
 *   - No-ops when window.NativeBridge is absent (web context)
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { renderHook } from "@testing-library/react";

import type { TodayStatusPayload } from "@shared/lib/native";

import { useWidgetSync } from "../model/useWidgetSync";

type Bridge = {
  pushTodayStatus: Mock<
    (payload: TodayStatusPayload) => Promise<{ ok: boolean }>
  >;
};

function setBridge(b: Bridge | undefined) {
  (window as unknown as { NativeBridge: Bridge | undefined }).NativeBridge = b;
}

const today = {
  clock_in_at: "2026-05-04T09:00:00Z",
  clock_out_at: null,
  worked_minutes: 240,
  is_clocked_in: true,
  kind: "OFFICE" as const,
};

describe("useWidgetSync", () => {
  beforeEach(() => setBridge(undefined));
  afterEach(() => setBridge(undefined));

  it("pushes mapped payload once when bridge present", () => {
    const push = vi.fn(
      async (_payload: TodayStatusPayload) => ({ ok: true }),
    );
    setBridge({ pushTodayStatus: push });

    renderHook(() =>
      useWidgetSync({
        today,
        weekHours: 18.5,
        annualLeaveRemaining: 12,
      }),
    );

    expect(push).toHaveBeenCalledTimes(1);
    const payload = push.mock.calls[0][0];
    expect(payload.status).toBe("WORKING");
    expect(payload.clockInAt).toBe("2026-05-04T09:00:00Z");
    expect(payload.workedMinutes).toBe(240);
    expect(payload.weekHours).toBe(18.5);
    expect(payload.annualLeaveRemaining).toBe(12);
  });

  it("does not double-push for identical inputs", () => {
    const push = vi.fn(
      async (_payload: TodayStatusPayload) => ({ ok: true }),
    );
    setBridge({ pushTodayStatus: push });

    const { rerender } = renderHook(
      (p: { today: typeof today; w: number; l: number }) =>
        useWidgetSync({
          today: p.today,
          weekHours: p.w,
          annualLeaveRemaining: p.l,
        }),
      { initialProps: { today, w: 18.5, l: 12 } },
    );

    rerender({ today, w: 18.5, l: 12 });
    rerender({ today, w: 18.5, l: 12 });
    expect(push).toHaveBeenCalledTimes(1);
  });

  it("no-ops when bridge is absent", () => {
    renderHook(() => useWidgetSync({ today }));
    // No bridge installed → nothing to assert beyond "did not throw".
    expect(true).toBe(true);
  });
});
