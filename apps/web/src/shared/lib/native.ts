/**
 * Typed wrapper around `window.NativeBridge` (Flutter WebView shell).
 *
 * Falls back gracefully when the bridge is absent (plain web, dev server,
 * Storybook) so feature code can call these without environment branching.
 */

export type NativePlatform = "ANDROID" | "IOS";
export type HapticIntensity = "light" | "medium" | "heavy";

export type DeviceTokenInfo = { platform: NativePlatform; token: string };
export type AppInfo = {
  version: string;
  build: string;
  platform: NativePlatform | "WEB";
};

export type LocationOk = {
  latitude: number;
  longitude: number;
  accuracy_m: number;
  ts?: string;
};

type BridgeError = { error: string };

type RawLocation = LocationOk | BridgeError;
type RawDeviceToken = DeviceTokenInfo | BridgeError;
type RawAppInfo =
  | { version: string; build: string; platform: NativePlatform }
  | BridgeError;

type NativeBridgeShape = {
  requestLocation?: () => Promise<RawLocation>;
  registerDeviceToken?: () => Promise<RawDeviceToken>;
  haptic?: (intensity: HapticIntensity) => Promise<{ ok: true } | BridgeError>;
  appInfo?: () => Promise<RawAppInfo>;
};

declare global {
  interface Window {
    NativeBridge?: NativeBridgeShape;
  }
}

function bridge(): NativeBridgeShape | undefined {
  return typeof window !== "undefined" ? window.NativeBridge : undefined;
}

export function hasNativeBridge(): boolean {
  return !!bridge();
}

function isErr<T>(v: T | BridgeError): v is BridgeError {
  return typeof (v as BridgeError)?.error === "string";
}

/**
 * One-shot location read. Throws `Error(code)` on failure so callers can
 * funnel through their existing geolocation error handling.
 */
export async function requestLocation(): Promise<LocationOk> {
  const b = bridge();
  if (!b?.requestLocation) {
    throw new Error("BRIDGE_UNAVAILABLE");
  }
  const res = await b.requestLocation();
  if (isErr(res)) throw new Error(res.error);
  return res;
}

/**
 * Asks the OS for an FCM/APNs token. Resolves to `null` (not throws) when
 * the bridge is missing — callers shouldn't hard-fail in browser context.
 */
export async function registerDeviceToken(): Promise<DeviceTokenInfo | null> {
  const b = bridge();
  if (!b?.registerDeviceToken) return null;
  const res = await b.registerDeviceToken();
  if (isErr(res)) return null;
  return res;
}

/**
 * Best-effort haptic. Silently no-ops on web (and on Android/iOS without
 * bridge) so callers can sprinkle this on any tap-confirm gesture.
 */
export async function haptic(intensity: HapticIntensity = "light"): Promise<void> {
  const b = bridge();
  if (!b?.haptic) {
    // Browser fallback: navigator.vibrate where available (Android Chrome).
    try {
      const ms = intensity === "heavy" ? 30 : intensity === "medium" ? 15 : 8;
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        (navigator as Navigator & { vibrate: (p: number) => boolean }).vibrate(ms);
      }
    } catch {
      /* noop */
    }
    return;
  }
  await b.haptic(intensity);
}

/** App / build metadata. Returns sensible WEB defaults outside the shell. */
export async function appInfo(): Promise<AppInfo> {
  const b = bridge();
  if (!b?.appInfo) {
    return { version: "0.0.0", build: "web", platform: "WEB" };
  }
  const res = await b.appInfo();
  if (isErr(res)) {
    return { version: "0.0.0", build: "web", platform: "WEB" };
  }
  return res;
}
