/**
 * contextBridge exposing typed wrappers for the IPC handlers + a generic
 * `on(event, cb)` for renderer subscriptions to main-emitted events.
 *
 * Renderer side accesses this via `window.ElectronBridge`.
 *
 * NOTE: contextIsolation is ON; the renderer never sees ipcRenderer
 * directly. Only the channel names declared in IPC_INVOKE / IPC_EVENT are
 * reachable, which keeps the attack surface tight.
 */
import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";
import {
  IPC_EVENT,
  IPC_INVOKE,
  type AutoClockInConfig,
  type AutoClockInFiredPayload,
  type IpcEventChannel,
  type NotificationClickedPayload,
  type NotifyPayload,
  type StatusChangedPayload,
  type UpdaterAvailablePayload,
  type UpdaterDownloadedPayload,
  type UpdaterErrorPayload,
  type WorkStatus,
} from "../shared/ipc-contracts.js";

type EventPayloads = {
  [IPC_EVENT.StatusChanged]: StatusChangedPayload;
  [IPC_EVENT.NotificationClicked]: NotificationClickedPayload;
  [IPC_EVENT.AutoClockInFired]: AutoClockInFiredPayload;
  [IPC_EVENT.UpdaterUpdateAvailable]: UpdaterAvailablePayload;
  [IPC_EVENT.UpdaterUpdateDownloaded]: UpdaterDownloadedPayload;
  [IPC_EVENT.UpdaterError]: UpdaterErrorPayload;
};

export interface ElectronBridge {
  getAppVersion: () => Promise<string>;
  setStatus: (status: WorkStatus) => Promise<void>;
  notify: (payload: NotifyPayload) => Promise<boolean>;
  scheduleAutoClockIn: (
    config: AutoClockInConfig,
  ) => Promise<{ scheduledInMs: number } | null>;
  cancelAutoClockIn: () => Promise<void>;
  openExternal: (url: string) => Promise<void>;
  on: <C extends IpcEventChannel>(
    channel: C,
    cb: (payload: EventPayloads[C]) => void,
  ) => () => void;
}

const bridge: ElectronBridge = {
  getAppVersion: () => ipcRenderer.invoke(IPC_INVOKE.GetAppVersion),
  setStatus: (status) =>
    ipcRenderer.invoke(IPC_INVOKE.SetStatus, { status }),
  notify: (payload) => ipcRenderer.invoke(IPC_INVOKE.Notify, payload),
  scheduleAutoClockIn: (config) =>
    ipcRenderer.invoke(IPC_INVOKE.ScheduleAutoClockIn, config),
  cancelAutoClockIn: () => ipcRenderer.invoke(IPC_INVOKE.CancelAutoClockIn),
  openExternal: (url) => ipcRenderer.invoke(IPC_INVOKE.OpenExternal, url),
  on: (channel, cb) => {
    const listener = (_e: IpcRendererEvent, payload: unknown): void => {
      cb(payload as never);
    };
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
};

contextBridge.exposeInMainWorld("ElectronBridge", bridge);
