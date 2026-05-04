/**
 * Persistent settings via electron-store. Wrapped in a tiny typed surface so
 * the rest of the main process never imports the dependency directly — keeps
 * unit tests free of native deps.
 */
import Store from "electron-store";

export interface PersistedSettings {
  windowBounds?: {
    x?: number;
    y?: number;
    width: number;
    height: number;
  };
  /** Last seen scheduled start time (ISO) — used to restore auto-clock-in
   * across restarts. */
  scheduledStartIso?: string;
  /** Trigger offset (seconds after scheduled start). */
  autoClockInOffsetSeconds?: number;
}

const defaults: PersistedSettings = {
  windowBounds: { width: 1180, height: 780 },
  autoClockInOffsetSeconds: 30,
};

let cached: Store<PersistedSettings> | null = null;

export function getStore(): Store<PersistedSettings> {
  if (!cached) {
    cached = new Store<PersistedSettings>({
      name: "wm-desktop-settings",
      defaults,
    });
  }
  return cached;
}
