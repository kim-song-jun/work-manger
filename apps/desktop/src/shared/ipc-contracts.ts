/**
 * Shared IPC contracts between main / preload / renderer.
 *
 * Channel naming: `wm:<action>` — keeps Work Manager events distinct from
 * other Electron-internal channels and keeps grep-ability in the renderer.
 */

export type WorkStatus = "WORKING" | "BREAK" | "OFF" | "REMOTE";

export interface NotifyPayload {
  /** Stable kind used for debounce buckets (e.g. `clock-in-soon`). */
  kind: string;
  title: string;
  body: string;
  /** Optional URL the renderer should focus on click. */
  deepLink?: string;
}

export interface AutoClockInConfig {
  /** ISO 8601 timestamp of scheduled start (in user TZ). */
  scheduledStartIso: string;
  /** Trigger offset after `scheduledStartIso`, in seconds. Default 30. */
  offsetSeconds?: number;
}

export interface NotificationClickedPayload {
  kind: string;
  deepLink?: string;
}

export interface AutoClockInFiredPayload {
  /** ISO 8601 timestamp the trigger fired at (main-process clock). */
  firedAtIso: string;
  /** Configured scheduled start that this trigger maps to. */
  scheduledStartIso: string;
}

export interface StatusChangedPayload {
  status: WorkStatus;
}

export interface UpdaterAvailablePayload {
  version?: string;
}

export interface UpdaterDownloadedPayload {
  version?: string;
}

export interface UpdaterErrorPayload {
  message: string;
}

/** Channels the renderer can `invoke()` (request/response). */
export const IPC_INVOKE = {
  GetAppVersion: "wm:get-app-version",
  SetStatus: "wm:set-status",
  Notify: "wm:notify",
  ScheduleAutoClockIn: "wm:schedule-auto-clock-in",
  CancelAutoClockIn: "wm:cancel-auto-clock-in",
  OpenExternal: "wm:open-external",
} as const;

/** Channels the main process emits to the renderer (`webContents.send`). */
export const IPC_EVENT = {
  StatusChanged: "wm:status-changed",
  NotificationClicked: "wm:notification-clicked",
  AutoClockInFired: "wm:auto-clock-in",
  UpdaterUpdateAvailable: "wm:updater:update-available",
  UpdaterUpdateDownloaded: "wm:updater:update-downloaded",
  UpdaterError: "wm:updater:error",
} as const;

export type IpcInvokeChannel = (typeof IPC_INVOKE)[keyof typeof IPC_INVOKE];
export type IpcEventChannel = (typeof IPC_EVENT)[keyof typeof IPC_EVENT];
