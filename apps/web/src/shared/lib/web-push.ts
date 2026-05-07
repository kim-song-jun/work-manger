/**
 * Web Push (VAPID) — browser subscription registration.
 *
 * Open W3C standard, no Google dependency. The BE issues VAPID keys via
 * `manage.py generate_vapid_keys` and stores the private half; this module
 * pulls the public half (env at build time, falling back to the BE
 * `/v1/notifications/vapid-public-key` endpoint), registers `/sw.js`, calls
 * `pushManager.subscribe`, and POSTs the resulting `PushSubscription` to
 * `/v1/notifications/devices` with `platform: "WEB"`.
 *
 * Used by the desktop (Electron renderer = browser) AND the Flutter WebView
 * for foreground delivery alongside the Android-native ntfy path. See
 * ADR-006: self-hosted push, no Firebase.
 */

const VAPID_ENV_KEY = "VITE_VAPID_PUBLIC_KEY";
const SW_URL = "/sw.js";
const DEVICES_ENDPOINT = "/v1/notifications/devices";
const VAPID_FETCH_ENDPOINT = "/v1/notifications/vapid-public-key";

export type WebPushRegisterResult =
  | { ok: true; subscription: PushSubscriptionJSON }
  | { ok: false; reason: WebPushFailure };

export type WebPushFailure =
  | "UNSUPPORTED"
  | "PERMISSION_DENIED"
  | "NO_VAPID_KEY"
  | "SUBSCRIBE_FAILED"
  | "REGISTER_FAILED";

function isSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    !!navigator.serviceWorker &&
    "PushManager" in window
  );
}

/** Decode a base64url VAPID public key into a Uint8Array (browser API contract). */
export function urlBase64ToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

export async function getVapidPublicKey(): Promise<string | null> {
  // Prefer build-time env so the SW can subscribe with no extra round trip.
  const fromEnv =
    (typeof import.meta !== "undefined" &&
      (import.meta as ImportMeta & { env?: Record<string, string> }).env?.[
        VAPID_ENV_KEY
      ]) ||
    "";
  if (fromEnv) return fromEnv;
  try {
    const res = await fetch(VAPID_FETCH_ENDPOINT, { credentials: "omit" });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: { public_key?: string } };
    return body?.data?.public_key || null;
  } catch {
    return null;
  }
}

async function postSubscription(sub: PushSubscriptionJSON): Promise<boolean> {
  try {
    const res = await fetch(DEVICES_ENDPOINT, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ platform: "WEB", token: JSON.stringify(sub) }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * End-to-end Web Push opt-in:
 *   permission → SW register → pushManager.subscribe → POST to BE.
 * Idempotent: re-subscribes with the same endpoint return the existing
 * PushSubscription, which the BE upserts via update_or_create.
 */
export async function registerWebPush(): Promise<WebPushRegisterResult> {
  if (!isSupported()) return { ok: false, reason: "UNSUPPORTED" };

  const publicKey = await getVapidPublicKey();
  if (!publicKey) return { ok: false, reason: "NO_VAPID_KEY" };

  let registration: ServiceWorkerRegistration;
  try {
    registration = await navigator.serviceWorker.register(SW_URL);
  } catch {
    return { ok: false, reason: "REGISTER_FAILED" };
  }

  let permission: NotificationPermission = Notification.permission;
  if (permission === "default") permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "PERMISSION_DENIED" };

  let subscription: PushSubscription;
  try {
    const applicationServerKey = urlBase64ToUint8Array(publicKey) as BufferSource;
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  } catch {
    return { ok: false, reason: "SUBSCRIBE_FAILED" };
  }

  const json = subscription.toJSON();
  await postSubscription(json);
  return { ok: true, subscription: json };
}

/**
 * Tear down the active subscription locally. The BE row is GC'd on the next
 * 410 Gone response from the push gateway; we don't bother calling DELETE
 * here because the endpoint requires the device row UUID we don't carry on
 * the FE side (would add a round-trip just to fetch + delete).
 */
export async function unregisterWebPush(): Promise<boolean> {
  if (!isSupported()) return false;
  const reg = await navigator.serviceWorker.getRegistration(SW_URL);
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return true;
  return sub.unsubscribe();
}
