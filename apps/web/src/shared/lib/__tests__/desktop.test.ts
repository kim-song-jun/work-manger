/**
 * Test: shared/lib · desktop adapter
 * Type: Unit (vitest, jsdom)
 * Why:  This adapter is the only renderer-side code that knows whether
 *       Electron is present. Wrong branching either silently swallows OS
 *       notifications (bridge present but not invoked) or hard-crashes the
 *       web build (bridge absent but called unconditionally). Both are
 *       silent regressions that ship cleanly through type-checks.
 * Covers:
 *   - bridge present → calls through to window.ElectronBridge.*
 *   - bridge absent → no-ops, returns null/false where typed
 *   - on*() subscriptions: fires renderer callback + returns unsubscribe
 *   - openExternal falls back to window.open when bridge absent
 * Out of scope:
 *   - Actual Electron IPC plumbing (covered by main-process unit tests)
 * Coverage target: 100% lines for desktop.ts
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as desktop from "../desktop";

type Listener = (payload: unknown) => void;

interface MockBridge {
  getAppVersion: ReturnType<typeof vi.fn>;
  setStatus: ReturnType<typeof vi.fn>;
  notify: ReturnType<typeof vi.fn>;
  scheduleAutoClockIn: ReturnType<typeof vi.fn>;
  cancelAutoClockIn: ReturnType<typeof vi.fn>;
  openExternal: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  __emit: (channel: string, payload: unknown) => void;
}

function installBridge(): MockBridge {
  const listeners = new Map<string, Set<Listener>>();
  const bridge: MockBridge = {
    getAppVersion: vi.fn(async () => "0.1.0"),
    setStatus: vi.fn(async () => undefined),
    notify: vi.fn(async () => true),
    scheduleAutoClockIn: vi.fn(async () => ({ scheduledInMs: 1000 })),
    cancelAutoClockIn: vi.fn(async () => undefined),
    openExternal: vi.fn(async () => undefined),
    on: vi.fn((channel: string, cb: Listener) => {
      if (!listeners.has(channel)) listeners.set(channel, new Set());
      listeners.get(channel)!.add(cb);
      return () => listeners.get(channel)?.delete(cb);
    }),
    __emit: (channel, payload) =>
      listeners.get(channel)?.forEach((cb) => cb(payload)),
  };
  (window as unknown as { ElectronBridge: MockBridge }).ElectronBridge =
    bridge;
  return bridge;
}

function clearBridge(): void {
  delete (window as unknown as { ElectronBridge?: unknown }).ElectronBridge;
}

describe("desktop adapter — bridge present", () => {
  let bridge: MockBridge;
  beforeEach(() => {
    bridge = installBridge();
  });
  afterEach(() => {
    clearBridge();
  });

  it("isDesktop() reports true and getAppVersion calls through", async () => {
    expect(desktop.isDesktop()).toBe(true);
    await expect(desktop.getAppVersion()).resolves.toBe("0.1.0");
    expect(bridge.getAppVersion).toHaveBeenCalledOnce();
  });

  it("setStatus / notify / schedule / cancel / openExternal all delegate", async () => {
    await desktop.setStatus("WORKING");
    expect(bridge.setStatus).toHaveBeenCalledWith("WORKING");

    await desktop.notify({ kind: "k", title: "t", body: "b" });
    expect(bridge.notify).toHaveBeenCalledWith({
      kind: "k",
      title: "t",
      body: "b",
    });

    await desktop.scheduleAutoClockIn({
      scheduledStartIso: "2026-05-04T09:00:00.000Z",
    });
    expect(bridge.scheduleAutoClockIn).toHaveBeenCalledOnce();

    await desktop.cancelAutoClockIn();
    expect(bridge.cancelAutoClockIn).toHaveBeenCalledOnce();

    await desktop.openExternal("https://example.com");
    expect(bridge.openExternal).toHaveBeenCalledWith("https://example.com");
  });

  it("on*() subscribes and the unsubscribe stops further callbacks", () => {
    const cb = vi.fn();
    const off = desktop.onAutoClockInFired(cb);
    bridge.__emit("wm:auto-clock-in", {
      firedAtIso: "2026-05-04T09:00:30.000Z",
      scheduledStartIso: "2026-05-04T09:00:00.000Z",
    });
    expect(cb).toHaveBeenCalledOnce();
    off();
    bridge.__emit("wm:auto-clock-in", {
      firedAtIso: "2026-05-04T09:01:00.000Z",
      scheduledStartIso: "2026-05-04T09:00:00.000Z",
    });
    expect(cb).toHaveBeenCalledOnce();
  });

  it("onNotificationClicked() forwards the payload", () => {
    const cb = vi.fn();
    desktop.onNotificationClicked(cb);
    bridge.__emit("wm:notification-clicked", {
      kind: "approval",
      deepLink: "/inbox/1",
    });
    expect(cb).toHaveBeenCalledWith({ kind: "approval", deepLink: "/inbox/1" });
  });
});

describe("desktop adapter — bridge absent", () => {
  beforeEach(() => clearBridge());

  it("isDesktop() reports false and getAppVersion returns null", async () => {
    expect(desktop.isDesktop()).toBe(false);
    await expect(desktop.getAppVersion()).resolves.toBeNull();
  });

  it("notify returns false and schedule returns null when no bridge", async () => {
    await expect(
      desktop.notify({ kind: "k", title: "", body: "" }),
    ).resolves.toBe(false);
    await expect(
      desktop.scheduleAutoClockIn({
        scheduledStartIso: "2026-05-04T09:00:00.000Z",
      }),
    ).resolves.toBeNull();
  });

  it("setStatus / cancelAutoClockIn no-op without throwing", async () => {
    await expect(desktop.setStatus("OFF")).resolves.toBeUndefined();
    await expect(desktop.cancelAutoClockIn()).resolves.toBeUndefined();
  });

  it("openExternal falls back to window.open", async () => {
    const open = vi
      .spyOn(window, "open")
      .mockImplementation(() => null as never);
    await desktop.openExternal("https://example.com");
    expect(open).toHaveBeenCalledWith(
      "https://example.com",
      "_blank",
      "noopener",
    );
    open.mockRestore();
  });

  it("on*() returns a no-op unsubscribe when bridge absent", () => {
    const cb = vi.fn();
    const off = desktop.onAutoClockInFired(cb);
    expect(typeof off).toBe("function");
    off();
    expect(cb).not.toHaveBeenCalled();
  });
});
