/**
 * Test: desktop/main · AutoClockInScheduler
 * Type: Unit (vitest fake timers, node)
 * Why:  Auto clock-in is the headline desktop feature — a wrong offset or
 *       a stale timer either fires at the wrong minute or never fires,
 *       silently breaking the entire commute UX. Cancellation on settings
 *       update is the only thing keeping a stale schedule from racing the
 *       new one after a user changes their start time.
 * Covers:
 *   - schedule() arms a timer that fires `scheduledStart + offset`
 *   - the fired event payload is sent on `wm:auto-clock-in`
 *   - schedule() returns null when the trigger is already in the past
 *   - cancel() drops a pending timer and isScheduled() reflects state
 *   - re-schedule() replaces the prior timer (only one fire)
 * Out of scope:
 *   - WebContents / IPC plumbing (covered by ipc.ts integration smoke)
 * Coverage target: 100% lines for auto-clock-in.ts
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AutoClockInScheduler } from "../auto-clock-in.js";

const NOW = new Date("2026-05-04T08:55:00.000Z").getTime();
const START_ISO = "2026-05-04T09:00:00.000Z";

function makeWindow(): {
  win: { webContents: { send: ReturnType<typeof vi.fn> } };
  send: ReturnType<typeof vi.fn>;
} {
  const send = vi.fn();
  return { win: { webContents: { send } }, send };
}

describe("AutoClockInScheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(NOW));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires `scheduledStart + offset` and sends the payload", () => {
    const { win, send } = makeWindow();
    const scheduler = new AutoClockInScheduler({
      getMainWindow: () => win as never,
    });
    const result = scheduler.schedule({
      scheduledStartIso: START_ISO,
      offsetSeconds: 30,
    });
    // 5 minutes + 30 seconds = 330_000 ms
    expect(result?.scheduledInMs).toBe(5 * 60_000 + 30_000);
    expect(scheduler.isScheduled()).toBe(true);

    // 1ms before fire → still pending
    vi.advanceTimersByTime(5 * 60_000 + 30_000 - 1);
    expect(send).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(send).toHaveBeenCalledTimes(1);
    const [channel, payload] = send.mock.calls[0];
    expect(channel).toBe("wm:auto-clock-in");
    expect(payload.scheduledStartIso).toBe(START_ISO);
    expect(typeof payload.firedAtIso).toBe("string");
    expect(scheduler.isScheduled()).toBe(false);
  });

  it("returns null when the target time has already passed", () => {
    const { win, send } = makeWindow();
    const scheduler = new AutoClockInScheduler({
      getMainWindow: () => win as never,
    });
    const result = scheduler.schedule({
      scheduledStartIso: "2026-05-04T08:00:00.000Z",
      offsetSeconds: 30,
    });
    expect(result).toBeNull();
    expect(scheduler.isScheduled()).toBe(false);
    vi.advanceTimersByTime(60_000);
    expect(send).not.toHaveBeenCalled();
  });

  it("cancel() drops a pending timer", () => {
    const { win, send } = makeWindow();
    const scheduler = new AutoClockInScheduler({
      getMainWindow: () => win as never,
    });
    scheduler.schedule({ scheduledStartIso: START_ISO });
    expect(scheduler.isScheduled()).toBe(true);
    scheduler.cancel();
    expect(scheduler.isScheduled()).toBe(false);
    vi.advanceTimersByTime(10 * 60_000);
    expect(send).not.toHaveBeenCalled();
  });

  it("re-schedule() replaces the prior timer (only fires once)", () => {
    const { win, send } = makeWindow();
    const scheduler = new AutoClockInScheduler({
      getMainWindow: () => win as never,
    });
    scheduler.schedule({ scheduledStartIso: START_ISO, offsetSeconds: 30 });
    // Reschedule with a later start time.
    scheduler.schedule({
      scheduledStartIso: "2026-05-04T09:10:00.000Z",
      offsetSeconds: 30,
    });
    vi.advanceTimersByTime(15 * 60_000 + 30_000);
    expect(send).toHaveBeenCalledTimes(1);
    const [, payload] = send.mock.calls[0];
    expect(payload.scheduledStartIso).toBe("2026-05-04T09:10:00.000Z");
  });
});
