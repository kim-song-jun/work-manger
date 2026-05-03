import { getCurrentLocation, type GeoFix } from "@shared/lib";

/**
 * Thin wrapper that calls geolocation. Kept as a hook-shaped module
 * so future caching / permission-prompt UX can live here.
 */
export async function readGeoFix(): Promise<GeoFix> {
  return getCurrentLocation();
}

export type { GeoFix };
