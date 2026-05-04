/**
 * Test: desktop/main · NotificationsService
 * Type: Unit (vitest, node)
 * Why:  OS-notification spam is a top user pain — the debounce + click
 *       focus-window contract is the load-bearing behavior of the desktop
 *       shell's notification surface. Regressions here either silently
 *       drop alerts or carpet-bomb the user.
 * Covers:
 *   - notify() spawns a Notification + show() when supported
 *   - debounces by `kind` within a 60s window
 *   - allows the same kind once the window has elapsed
 *   - distinct kinds are independent
 *   - returns false when Notification is unsupported
 *   - click handler focuses the window and forwards the payload
 * Out of scope:
 *   - macOS-only behaviors (subtitle, hasReply) — set in v1.x
 * Coverage target: 100% lines for notifications.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEBOUNCE_WINDOW_MS,
  NotificationsService,
  type NotificationCtor,
  type NotificationInstance,
} from "../notifications.js";

interface MockNotification extends NotificationInstance {
  shown: boolean;
  clickListeners: Array<() => void>;
}

function makeMockNotificationCtor(supported = true): {
  ctor: NotificationCtor;
  instances: MockNotification[];
} {
  const instances: MockNotification[] = [];
  const ctor = class {
    shown = false;
    clickListeners: Array<() => void> = [];
    constructor(_opts: { title: string; body: string }) {
      instances.push(this as unknown as MockNotification);
    }
    show(): void {
      this.shown = true;
    }
    on(_event: "click", listener: () => void): this {
      this.clickListeners.push(listener);
      return this;
    }
    static isSupported(): boolean {
      return supported;
    }
  } as unknown as NotificationCtor;
  return { ctor, instances };
}

function makeMockWindow(): {
  win: {
    isMinimized: () => boolean;
    restore: () => void;
    show: () => void;
    focus: () => void;
    webContents: { send: ReturnType<typeof vi.fn> };
  };
  send: ReturnType<typeof vi.fn>;
} {
  const send = vi.fn();
  return {
    win: {
      isMinimized: () => false,
      restore: vi.fn(),
      show: vi.fn(),
      focus: vi.fn(),
      webContents: { send },
    },
    send,
  };
}

describe("NotificationsService", () => {
  let now = 1_700_000_000_000;
  beforeEach(() => {
    now = 1_700_000_000_000;
  });

  it("spawns a Notification + show() when supported", () => {
    const { ctor, instances } = makeMockNotificationCtor(true);
    const { win } = makeMockWindow();
    const svc = new NotificationsService({
      Notification: ctor,
      getMainWindow: () => win as never,
      now: () => now,
    });
    const fired = svc.notify({ kind: "k1", title: "t", body: "b" });
    expect(fired).toBe(true);
    expect(instances).toHaveLength(1);
    expect(instances[0].shown).toBe(true);
  });

  it("debounces the same kind within 60s", () => {
    const { ctor, instances } = makeMockNotificationCtor(true);
    const { win } = makeMockWindow();
    const svc = new NotificationsService({
      Notification: ctor,
      getMainWindow: () => win as never,
      now: () => now,
    });
    expect(svc.notify({ kind: "k", title: "1", body: "" })).toBe(true);
    now += DEBOUNCE_WINDOW_MS - 1;
    expect(svc.notify({ kind: "k", title: "2", body: "" })).toBe(false);
    expect(instances).toHaveLength(1);
  });

  it("allows the same kind after the debounce window elapses", () => {
    const { ctor, instances } = makeMockNotificationCtor(true);
    const { win } = makeMockWindow();
    const svc = new NotificationsService({
      Notification: ctor,
      getMainWindow: () => win as never,
      now: () => now,
    });
    expect(svc.notify({ kind: "k", title: "1", body: "" })).toBe(true);
    now += DEBOUNCE_WINDOW_MS + 1;
    expect(svc.notify({ kind: "k", title: "2", body: "" })).toBe(true);
    expect(instances).toHaveLength(2);
  });

  it("treats different kinds independently", () => {
    const { ctor, instances } = makeMockNotificationCtor(true);
    const { win } = makeMockWindow();
    const svc = new NotificationsService({
      Notification: ctor,
      getMainWindow: () => win as never,
      now: () => now,
    });
    expect(svc.notify({ kind: "a", title: "", body: "" })).toBe(true);
    expect(svc.notify({ kind: "b", title: "", body: "" })).toBe(true);
    expect(instances).toHaveLength(2);
  });

  it("returns false when Notification.isSupported() is false", () => {
    const { ctor, instances } = makeMockNotificationCtor(false);
    const { win } = makeMockWindow();
    const svc = new NotificationsService({
      Notification: ctor,
      getMainWindow: () => win as never,
      now: () => now,
    });
    expect(svc.notify({ kind: "k", title: "", body: "" })).toBe(false);
    expect(instances).toHaveLength(0);
  });

  it("forwards payload to renderer + focuses window on click", () => {
    const { ctor, instances } = makeMockNotificationCtor(true);
    const { win, send } = makeMockWindow();
    const svc = new NotificationsService({
      Notification: ctor,
      getMainWindow: () => win as never,
      now: () => now,
    });
    svc.notify({
      kind: "approval",
      title: "결재",
      body: "확인 필요",
      deepLink: "/inbox/123",
    });
    instances[0].clickListeners.forEach((fn) => fn());
    expect(win.show).toHaveBeenCalled();
    expect(win.focus).toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith("wm:notification-clicked", {
      kind: "approval",
      deepLink: "/inbox/123",
    });
  });
});
