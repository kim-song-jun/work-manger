/**
 * OS notifications. Wraps Electron's Notification with:
 *   - per-`kind` debounce (1/min) so a flapping backend can't carpet-bomb
 *     the user with toasts
 *   - click handler that focuses the window and forwards the payload to
 *     the renderer via `wm:notification-clicked`
 *
 * The `Deps` indirection lets vitest swap Electron primitives without
 * `vi.mock('electron')` poisoning the entire suite.
 */
import type { BrowserWindow } from "electron";
import { IPC_EVENT, type NotifyPayload } from "../shared/ipc-contracts.js";

export interface NotificationCtor {
  new (opts: {
    title: string;
    body: string;
    silent?: boolean;
  }): NotificationInstance;
  isSupported(): boolean;
}

export interface NotificationInstance {
  show(): void;
  on(event: "click", listener: () => void): this;
}

export interface NotificationsDeps {
  Notification: NotificationCtor;
  getMainWindow: () => BrowserWindow | null;
  /** Override for tests; defaults to Date.now. */
  now?: () => number;
}

/** 1 notification per kind per minute. */
export const DEBOUNCE_WINDOW_MS = 60_000;

export class NotificationsService {
  private readonly lastFiredByKind = new Map<string, number>();

  constructor(private readonly deps: NotificationsDeps) {}

  /** Returns true if the notification was actually shown. */
  notify(payload: NotifyPayload): boolean {
    if (!this.deps.Notification.isSupported()) return false;
    const now = (this.deps.now ?? Date.now)();
    const last = this.lastFiredByKind.get(payload.kind) ?? 0;
    if (now - last < DEBOUNCE_WINDOW_MS) return false;
    this.lastFiredByKind.set(payload.kind, now);

    const n = new this.deps.Notification({
      title: payload.title,
      body: payload.body,
      silent: false,
    });
    n.on("click", () => this.handleClick(payload));
    n.show();
    return true;
  }

  /** Test-only escape hatch. */
  resetDebounce(): void {
    this.lastFiredByKind.clear();
  }

  private handleClick(payload: NotifyPayload): void {
    const win = this.deps.getMainWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
      win.webContents.send(IPC_EVENT.NotificationClicked, {
        kind: payload.kind,
        deepLink: payload.deepLink,
      });
    }
  }
}
