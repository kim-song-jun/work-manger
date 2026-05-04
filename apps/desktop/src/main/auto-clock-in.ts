/**
 * Auto clock-in trigger.
 *
 * Schedules a one-shot timer that fires at the user's scheduled start time
 * + N seconds (default 30). On fire, the main process emits `wm:auto-clock-in`
 * to the renderer; the renderer is responsible for actually calling
 * `POST /attendance/clock-in` (so geo capture, idempotency-key, and confirm
 * UX stay in one place).
 *
 * Cancel/reset on settings update or on a successful clock-in (renderer
 * triggers cancel via IPC). Keeps the dependency surface small so the
 * scheduler is unit-testable with vi.useFakeTimers().
 */
import type { BrowserWindow } from "electron";
import {
  IPC_EVENT,
  type AutoClockInConfig,
  type AutoClockInFiredPayload,
} from "../shared/ipc-contracts.js";

export interface AutoClockInDeps {
  getMainWindow: () => BrowserWindow | null;
  /** Override for tests. Defaults to Date.now. */
  now?: () => number;
  /** Override for tests. Defaults to globalThis.setTimeout. */
  setTimeout?: typeof setTimeout;
  /** Override for tests. Defaults to globalThis.clearTimeout. */
  clearTimeout?: typeof clearTimeout;
}

const DEFAULT_OFFSET_SECONDS = 30;
/** setTimeout caps at ~24.8d; we re-arm rather than letting it overflow. */
const MAX_DELAY_MS = 2_147_483_000;

export class AutoClockInScheduler {
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly deps: AutoClockInDeps) {}

  schedule(config: AutoClockInConfig): { scheduledInMs: number } | null {
    this.cancel();
    const fireAtMs = this.computeFireAt(config);
    const now = (this.deps.now ?? Date.now)();
    const delay = fireAtMs - now;
    if (delay <= 0) {
      // Already past the scheduled time + offset for today; do not auto-fire.
      // The renderer will catch this on next session and decide.
      return null;
    }
    const setT = this.deps.setTimeout ?? globalThis.setTimeout;
    const armDelay = Math.min(delay, MAX_DELAY_MS);
    this.timer = setT(() => {
      if (armDelay < delay) {
        // Re-arm for the remaining slice.
        this.schedule(config);
        return;
      }
      this.fire(config);
    }, armDelay);
    return { scheduledInMs: delay };
  }

  cancel(): void {
    if (this.timer) {
      const clearT = this.deps.clearTimeout ?? globalThis.clearTimeout;
      clearT(this.timer);
      this.timer = null;
    }
  }

  isScheduled(): boolean {
    return this.timer !== null;
  }

  private computeFireAt(config: AutoClockInConfig): number {
    const offset = (config.offsetSeconds ?? DEFAULT_OFFSET_SECONDS) * 1000;
    return new Date(config.scheduledStartIso).getTime() + offset;
  }

  private fire(config: AutoClockInConfig): void {
    this.timer = null;
    const win = this.deps.getMainWindow();
    if (!win) return;
    const payload: AutoClockInFiredPayload = {
      firedAtIso: new Date((this.deps.now ?? Date.now)()).toISOString(),
      scheduledStartIso: config.scheduledStartIso,
    };
    win.webContents.send(IPC_EVENT.AutoClockInFired, payload);
  }
}
