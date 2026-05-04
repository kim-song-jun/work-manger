/**
 * Centralised IPC handler registration. Keeps `main/index.ts` short and
 * makes the contract surface auditable from one file.
 */
import {
  app,
  ipcMain,
  shell,
  type BrowserWindow,
  type IpcMainInvokeEvent,
} from "electron";
import {
  IPC_EVENT,
  IPC_INVOKE,
  type AutoClockInConfig,
  type NotifyPayload,
  type StatusChangedPayload,
  type WorkStatus,
} from "../shared/ipc-contracts.js";
import type { NotificationsService } from "./notifications.js";
import type { AutoClockInScheduler } from "./auto-clock-in.js";

export interface IpcDeps {
  getMainWindow: () => BrowserWindow | null;
  notifications: NotificationsService;
  autoClockIn: AutoClockInScheduler;
  onStatusChange: (status: WorkStatus) => void;
}

export function registerIpcHandlers(deps: IpcDeps): void {
  ipcMain.handle(IPC_INVOKE.GetAppVersion, (): string => app.getVersion());

  ipcMain.handle(
    IPC_INVOKE.SetStatus,
    (_e: IpcMainInvokeEvent, payload: StatusChangedPayload): void => {
      deps.onStatusChange(payload.status);
      const win = deps.getMainWindow();
      win?.webContents.send(IPC_EVENT.StatusChanged, payload);
    },
  );

  ipcMain.handle(
    IPC_INVOKE.Notify,
    (_e: IpcMainInvokeEvent, payload: NotifyPayload): boolean =>
      deps.notifications.notify(payload),
  );

  ipcMain.handle(
    IPC_INVOKE.ScheduleAutoClockIn,
    (
      _e: IpcMainInvokeEvent,
      config: AutoClockInConfig,
    ): { scheduledInMs: number } | null => deps.autoClockIn.schedule(config),
  );

  ipcMain.handle(IPC_INVOKE.CancelAutoClockIn, (): void => {
    deps.autoClockIn.cancel();
  });

  ipcMain.handle(
    IPC_INVOKE.OpenExternal,
    async (_e: IpcMainInvokeEvent, url: string): Promise<void> => {
      // Allow only http/https — never file:// or javascript:.
      const ok = /^https?:\/\//i.test(url);
      if (ok) await shell.openExternal(url);
    },
  );
}

export function unregisterIpcHandlers(): void {
  for (const channel of Object.values(IPC_INVOKE)) {
    ipcMain.removeHandler(channel);
  }
}
