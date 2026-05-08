/**
 * Desktop shell adapter.
 *
 * Mirrors the surface a `native.ts` (mobile) adapter would expose so callers
 * can branch by capability without knowing whether they're inside Electron,
 * Flutter WebView, or a plain browser.
 *
 * Contract: when `window.ElectronBridge` is present, we delegate to OS
 * notifications + the main-process auto-clock-in scheduler. When absent
 * (web / mobile), each method is a safe no-op so the renderer can still
 * fall back to in-app Toasts / setTimeout-based scheduling without a
 * branch at every call-site.
 */

export type WorkStatus = "WORKING" | "BREAK" | "OFF" | "REMOTE";

export interface DesktopNotifyPayload {
  kind: string;
  title: string;
  body: string;
  deepLink?: string;
}

export interface DesktopAutoClockInConfig {
  scheduledStartIso: string;
  offsetSeconds?: number;
}

export interface DesktopAutoClockInFiredPayload {
  firedAtIso: string;
  scheduledStartIso: string;
}

export interface DesktopNotificationClickedPayload {
  kind: string;
  deepLink?: string;
}

interface ElectronBridgeShape {
  getAppVersion: () => Promise<string>;
  setStatus: (status: WorkStatus) => Promise<void>;
  notify: (payload: DesktopNotifyPayload) => Promise<boolean>;
  scheduleAutoClockIn: (
    config: DesktopAutoClockInConfig,
  ) => Promise<{ scheduledInMs: number } | null>;
  cancelAutoClockIn: () => Promise<void>;
  openExternal: (url: string) => Promise<void>;
  on: (channel: string, cb: (payload: unknown) => void) => () => void;
}

declare global {
   
  interface Window {
    ElectronBridge?: ElectronBridgeShape;
  }
}

export function isDesktop(): boolean {
  return typeof window !== "undefined" && !!window.ElectronBridge;
}

function bridge(): ElectronBridgeShape | null {
  return typeof window !== "undefined" ? (window.ElectronBridge ?? null) : null;
}

export async function getAppVersion(): Promise<string | null> {
  const b = bridge();
  return b ? b.getAppVersion() : null;
}

export async function setStatus(status: WorkStatus): Promise<void> {
  const b = bridge();
  if (b) await b.setStatus(status);
}

export async function notify(payload: DesktopNotifyPayload): Promise<boolean> {
  const b = bridge();
  if (!b) return false;
  return b.notify(payload);
}

export async function scheduleAutoClockIn(
  config: DesktopAutoClockInConfig,
): Promise<{ scheduledInMs: number } | null> {
  const b = bridge();
  return b ? b.scheduleAutoClockIn(config) : null;
}

export async function cancelAutoClockIn(): Promise<void> {
  const b = bridge();
  if (b) await b.cancelAutoClockIn();
}

export async function openExternal(url: string): Promise<void> {
  const b = bridge();
  if (b) await b.openExternal(url);
  else if (typeof window !== "undefined") window.open(url, "_blank", "noopener");
}

export function onAutoClockInFired(
  cb: (payload: DesktopAutoClockInFiredPayload) => void,
): () => void {
  const b = bridge();
  if (!b) return () => undefined;
  return b.on("wm:auto-clock-in", (p) =>
    cb(p as DesktopAutoClockInFiredPayload),
  );
}

export function onNotificationClicked(
  cb: (payload: DesktopNotificationClickedPayload) => void,
): () => void {
  const b = bridge();
  if (!b) return () => undefined;
  return b.on("wm:notification-clicked", (p) =>
    cb(p as DesktopNotificationClickedPayload),
  );
}
