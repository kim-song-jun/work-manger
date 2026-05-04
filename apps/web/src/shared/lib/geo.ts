export type GeoFix = {
  latitude: number;
  longitude: number;
  accuracy_m: number;
};

// `window.NativeBridge` is declared once in `./native.ts` and re-used here
// to avoid a TS2717 "Subsequent property declarations" conflict.
import "./native";

type LocationOk = {
  latitude: number;
  longitude: number;
  accuracy_m: number;
  ts?: string;
};
type LocationErr = { error: string };
type LocationResult = LocationOk | LocationErr;

function isNativeBridgeAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.NativeBridge?.requestLocation === "function"
  );
}

function isErr(v: LocationResult): v is LocationErr {
  return typeof (v as LocationErr).error === "string";
}

export async function getCurrentLocation(): Promise<GeoFix> {
  // Flutter WebView shell wins when present so we get native-grade accuracy
  // and don't double-prompt the user (browser geolocation inside a WebView
  // would prompt again on top of the OS-level grant).
  if (isNativeBridgeAvailable()) {
    const res = (await window.NativeBridge!.requestLocation!()) as LocationResult;
    if (isErr(res)) {
      // Surface as a thrown Error so callers' existing try/catch keeps working.
      throw new Error(res.error);
    }
    return {
      latitude: res.latitude,
      longitude: res.longitude,
      accuracy_m: res.accuracy_m ?? 0,
    };
  }

  if (typeof navigator === "undefined" || !navigator.geolocation) {
    // fallback stub for non-https or unsupported envs
    return { latitude: 37.4979, longitude: 127.0276, accuracy_m: 50 };
  }
  return new Promise<GeoFix>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy_m: pos.coords.accuracy ?? 0,
        }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 },
    );
  });
}
