/**
 * Test: shared/lib · getCurrentLocation (NativeBridge ↔ navigator.geolocation)
 * Type: Unit (vitest, jsdom)
 * Why:  The clock-in flow reads location via this single helper. It must
 *       prefer the Flutter shell's NativeBridge (native-grade accuracy,
 *       no double prompt) when present, and degrade to navigator.geolocation
 *       in plain browsers. Drift here breaks attendance silently.
 * Covers:
 *   - getCurrentLocation prefers window.NativeBridge.requestLocation when it exists
 *   - Maps NativeBridge `{ error: 'PERMISSION_DENIED' }` to a thrown Error
 *   - Falls back to navigator.geolocation when bridge absent
 *   - Returns the static stub when neither bridge nor geolocation are present
 * Out of scope:
 *   - watchLocation streaming (covered by mobile integration tests)
 *   - Permission UX (lives in `features/clock-in`)
 * Coverage target: 100% branches for `shared/lib/geo.ts`
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentLocation } from "../geo";

type GeoSuccess = (pos: GeolocationPosition) => void;
type GeoError = (err: GeolocationPositionError) => void;

function fakePosition(overrides: Partial<GeolocationCoordinates> = {}) {
  const coords: GeolocationCoordinates = {
    latitude: 37.4979,
    longitude: 127.0276,
    accuracy: 12,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    toJSON() {
      return this;
    },
    ...overrides,
  } as GeolocationCoordinates;
  return {
    coords,
    timestamp: 0,
    toJSON() {
      return this;
    },
  } as GeolocationPosition;
}

afterEach(() => {
  vi.unstubAllGlobals();
   
  delete (window as any).NativeBridge;
});

describe("getCurrentLocation — NativeBridge path", () => {
  beforeEach(() => {
     
    (window as any).NativeBridge = {
      requestLocation: vi.fn().mockResolvedValue({
        latitude: 35.1796,
        longitude: 129.0756,
        accuracy_m: 4.2,
        ts: "2026-05-04T01:00:00.000Z",
      }),
    };
  });

  it("prefers NativeBridge.requestLocation over navigator.geolocation", async () => {
    // Why: in the Flutter shell the OS already granted permission; using the
    // browser API would re-prompt and degrade accuracy.
    const navSpy = vi.fn();
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition: navSpy } });

    const fix = await getCurrentLocation();

    expect(fix).toEqual({
      latitude: 35.1796,
      longitude: 129.0756,
      accuracy_m: 4.2,
    });
     
    expect((window as any).NativeBridge.requestLocation).toHaveBeenCalledOnce();
    expect(navSpy).not.toHaveBeenCalled();
  });

  it("throws an Error carrying the bridge error code", async () => {
    // Why: callers funnel both browser and native failures through one
    // try/catch. Throwing keeps that path unified.
     
    (window as any).NativeBridge.requestLocation = vi
      .fn()
      .mockResolvedValue({ error: "PERMISSION_DENIED" });

    await expect(getCurrentLocation()).rejects.toThrow("PERMISSION_DENIED");
  });
});

describe("getCurrentLocation — browser fallback", () => {
  it("uses navigator.geolocation when NativeBridge is absent", async () => {
    // Why: plain web (desktop dashboard, dev server) must still work.
    const getCurrentPosition = vi.fn(
      (success: GeoSuccess, _err?: GeoError) => success(fakePosition()),
    );
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });

    const fix = await getCurrentLocation();

    expect(fix).toEqual({
      latitude: 37.4979,
      longitude: 127.0276,
      accuracy_m: 12,
    });
    expect(getCurrentPosition).toHaveBeenCalledOnce();
  });

  it("rejects when navigator.geolocation reports an error", async () => {
    const err = { code: 1, message: "denied" } as GeolocationPositionError;
    const getCurrentPosition = vi.fn(
      (_ok: GeoSuccess, fail?: GeoError) => fail?.(err),
    );
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });

    await expect(getCurrentLocation()).rejects.toEqual(err);
  });

  it("returns the seoul stub when neither bridge nor geolocation exist", async () => {
    // Why: SSR / non-https / Storybook still need to render clock-in pages
    // without throwing. A predictable stub is safer than crashing.
    vi.stubGlobal("navigator", {});

    const fix = await getCurrentLocation();

    expect(fix).toEqual({
      latitude: 37.4979,
      longitude: 127.0276,
      accuracy_m: 50,
    });
  });
});
