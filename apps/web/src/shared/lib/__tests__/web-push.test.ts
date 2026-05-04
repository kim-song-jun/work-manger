/**
 * Test: shared/lib · Web Push (VAPID) registration
 * Type: Unit (vitest, jsdom)
 * Why:  ADR-006 — Web Push 가 Firebase 를 대체하는 핵심 채널이라 옵트인
 *       흐름이 깨지면 사용자가 푸시 자체를 못 받는다. 분기 (Service Worker
 *       미지원, 권한 거부, 정상 구독, 해제) 가 모두 정확한 결과 객체를
 *       반환하는지 회귀 보호한다.
 * Covers:
 *   - registerWebPush: Service Worker 부재 시 reason="UNSUPPORTED"
 *   - registerWebPush: VAPID 키 없을 때 reason="NO_VAPID_KEY"
 *   - registerWebPush: 권한 거부 시 reason="PERMISSION_DENIED"
 *   - registerWebPush: 정상 흐름 → ok=true + /v1/notifications/devices POST
 *   - unregisterWebPush: 활성 구독 해제 + 미지원 환경 false 반환
 * Out of scope:
 *   - 실제 푸시 게이트웨이 통신 (BE web_push provider 가 검증)
 *   - Service Worker 자체 (sw.js 는 브라우저 런타임)
 * Coverage target: 100% branches for web-push.ts
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as wp from "../web-push";

const FAKE_VAPID = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

let originalNavigator: PropertyDescriptor | undefined;
let originalNotification: PropertyDescriptor | undefined;
let originalPushManager: unknown;
let originalFetch: typeof globalThis.fetch | undefined;

function mockServiceWorker(opts: {
  subscribe?: ReturnType<typeof vi.fn>;
  getSubscription?: ReturnType<typeof vi.fn>;
  registration?: unknown;
}) {
  const reg = opts.registration ?? {
    pushManager: {
      subscribe:
        opts.subscribe ??
        vi.fn().mockResolvedValue({
          toJSON: () => ({ endpoint: "https://push.example/abc", keys: {} }),
        }),
      getSubscription:
        opts.getSubscription ?? vi.fn().mockResolvedValue(null),
    },
  };
  const sw = {
    register: vi.fn().mockResolvedValue(reg),
    getRegistration: vi.fn().mockResolvedValue(reg),
  };
  Object.defineProperty(globalThis, "navigator", {
    value: { ...navigator, serviceWorker: sw },
    configurable: true,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).PushManager = function PushManager() {};
  return { sw, reg };
}

function mockNotification(perm: NotificationPermission) {
  Object.defineProperty(globalThis, "Notification", {
    value: {
      permission: perm,
      requestPermission: vi.fn().mockResolvedValue(perm),
    },
    configurable: true,
  });
}

beforeEach(() => {
  originalNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  originalNotification = Object.getOwnPropertyDescriptor(
    globalThis,
    "Notification",
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalPushManager = (globalThis as any).PushManager;
  originalFetch = globalThis.fetch;
  globalThis.fetch = vi.fn(async (url: RequestInfo | URL) => {
    const u = typeof url === "string" ? url : url.toString();
    if (u.endsWith("/v1/notifications/vapid-public-key")) {
      return new Response(
        JSON.stringify({ data: { public_key: FAKE_VAPID } }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }
    if (u.endsWith("/v1/notifications/devices")) {
      return new Response("{}", { status: 201 });
    }
    return new Response("", { status: 404 });
  }) as unknown as typeof globalThis.fetch;
});

afterEach(() => {
  if (originalNavigator) {
    Object.defineProperty(globalThis, "navigator", originalNavigator);
  }
  if (originalNotification) {
    Object.defineProperty(globalThis, "Notification", originalNotification);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).PushManager = originalPushManager;
  if (originalFetch) globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("registerWebPush", () => {
  it("returns UNSUPPORTED when serviceWorker is missing", async () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { ...navigator, serviceWorker: undefined },
      configurable: true,
    });
    const out = await wp.registerWebPush();
    expect(out).toEqual({ ok: false, reason: "UNSUPPORTED" });
  });

  it("returns NO_VAPID_KEY when the BE has no public key configured", async () => {
    mockServiceWorker({});
    mockNotification("granted");
    globalThis.fetch = vi.fn(async () => {
      return new Response(JSON.stringify({ data: { public_key: "" } }), {
        status: 200,
      });
    }) as unknown as typeof globalThis.fetch;
    const out = await wp.registerWebPush();
    expect(out).toEqual({ ok: false, reason: "NO_VAPID_KEY" });
  });

  it("returns PERMISSION_DENIED when the user blocks notifications", async () => {
    mockServiceWorker({});
    mockNotification("denied");
    const out = await wp.registerWebPush();
    expect(out).toEqual({ ok: false, reason: "PERMISSION_DENIED" });
  });

  it("subscribes and POSTs the subscription to /v1/notifications/devices", async () => {
    const subscribe = vi.fn().mockResolvedValue({
      toJSON: () => ({
        endpoint: "https://push.example/xyz",
        keys: { p256dh: "p", auth: "a" },
      }),
    });
    mockServiceWorker({ subscribe });
    mockNotification("granted");

    const out = await wp.registerWebPush();
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.subscription.endpoint).toBe("https://push.example/xyz");
    }
    expect(subscribe).toHaveBeenCalledWith(
      expect.objectContaining({ userVisibleOnly: true }),
    );
    const fetchCalls = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>)
      .mock.calls;
    const devicePost = fetchCalls.find(([u]) =>
      String(u).endsWith("/v1/notifications/devices"),
    );
    expect(devicePost).toBeDefined();
    const body = JSON.parse((devicePost?.[1] as RequestInit | undefined)?.body as string);
    expect(body.platform).toBe("WEB");
    expect(JSON.parse(body.token).endpoint).toBe("https://push.example/xyz");
  });
});

describe("unregisterWebPush", () => {
  it("calls subscription.unsubscribe when an active subscription exists", async () => {
    const unsubscribe = vi.fn().mockResolvedValue(true);
    const sub = { unsubscribe };
    mockServiceWorker({
      getSubscription: vi.fn().mockResolvedValue(sub),
    });
    const ok = await wp.unregisterWebPush();
    expect(ok).toBe(true);
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("returns false when serviceWorker is unavailable", async () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { ...navigator, serviceWorker: undefined },
      configurable: true,
    });
    const ok = await wp.unregisterWebPush();
    expect(ok).toBe(false);
  });
});
