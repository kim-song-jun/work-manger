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
  // ---- Home-screen widgets --------------------------------------------
  pushTodayStatus?: (
    payload: TodayStatusPayload,
  ) => Promise<{ ok: boolean } | BridgeError>;
  reloadWidgets?: () => Promise<{ ok: boolean } | BridgeError>;
  // ---- Geofencing ------------------------------------------------------
  registerGeofences?: (
    items: GeofenceItem[],
  ) => Promise<{ ok: true; count: number } | BridgeError>;
};

export type TodayStatus = "WORKING" | "OFF" | "LEAVE" | "UNKNOWN";

export type TodayStatusPayload = {
  status: TodayStatus;
  clockInAt?: string | null;
  workedMinutes?: number;
  weekHours?: number;
  annualLeaveRemaining?: number;
  metric?: "hours" | "leave" | "overtime";
};

export type GeofenceItem = {
  id: string;
  lat: number;
  lon: number;
  radius_m: number;
  label: string;
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

/**
 * Push today's attendance snapshot into the home-screen widget store.
 * No-ops outside the Flutter shell. Resolves to `false` on bridge errors so
 * callers can tag analytics without throwing.
 */
export async function pushTodayStatus(
  payload: TodayStatusPayload,
): Promise<boolean> {
  const b = bridge();
  if (!b?.pushTodayStatus) return false;
  const res = await b.pushTodayStatus(payload);
  if (isErr(res)) return false;
  return !!res.ok;
}

/** Force a widget reload without changing the snapshot. */
export async function reloadWidgets(): Promise<boolean> {
  const b = bridge();
  if (!b?.reloadWidgets) return false;
  const res = await b.reloadWidgets();
  if (isErr(res)) return false;
  return !!res.ok;
}

/**
 * Register the company's geofence regions (called once after
 * `/v1/onboarding/locations` resolves). Returns the count actually
 * registered, or `0` when the bridge is absent.
 */
export async function registerGeofences(
  items: GeofenceItem[],
): Promise<number> {
  const b = bridge();
  if (!b?.registerGeofences) return 0;
  const res = await b.registerGeofences(items);
  if (isErr(res)) return 0;
  return res.count;
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
