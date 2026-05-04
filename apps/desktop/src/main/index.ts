/**
 * Main entry. Owns app lifecycle, single-instance lock, BrowserWindow,
 * window-state restore, dock icon (mac), and wires sub-modules together.
 */
import {
  BrowserWindow,
  Notification,
  app,
  nativeImage,
  shell,
} from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { AutoClockInScheduler } from "./auto-clock-in.js";
import { registerIpcHandlers, unregisterIpcHandlers } from "./ipc.js";
import { NotificationsService } from "./notifications.js";
import { getStore } from "./store.js";
import { WorkManagerTray } from "./tray.js";
import { initAutoUpdater } from "./updater.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_URL = process.env.WM_WEB_URL ?? "http://localhost:4444";

let mainWindow: BrowserWindow | null = null;
let tray: WorkManagerTray | null = null;

function getMainWindow(): BrowserWindow | null {
  return mainWindow && !mainWindow.isDestroyed() ? mainWindow : null;
}

function createWindow(): void {
  const store = getStore();
  const bounds = store.get("windowBounds") ?? { width: 1180, height: 780 };

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: 480,
    minHeight: 600,
    show: false,
    title: "Work Manager",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, "..", "preload", "bridge.js"),
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow?.show());
  mainWindow.on("close", () => {
    if (!mainWindow) return;
    const b = mainWindow.getBounds();
    store.set("windowBounds", b);
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) void shell.openExternal(url);
    return { action: "deny" };
  });

  void mainWindow.loadURL(WEB_URL);
}

function bootstrap(): void {
  if (process.platform === "darwin") {
    const dock = path.join(__dirname, "..", "..", "assets", "icon.png");
    const img = nativeImage.createFromPath(dock);
    if (!img.isEmpty()) app.dock?.setIcon(img);
  }

  const notifications = new NotificationsService({
    Notification,
    getMainWindow,
  });
  const autoClockIn = new AutoClockInScheduler({ getMainWindow });

  registerIpcHandlers({
    getMainWindow,
    notifications,
    autoClockIn,
    onStatusChange: (status) => tray?.setStatus(status),
  });

  createWindow();

  tray = new WorkManagerTray({
    onClockIn: () =>
      getMainWindow()?.webContents.send("wm:tray-action", { action: "clock-in" }),
    onClockOut: () =>
      getMainWindow()?.webContents.send("wm:tray-action", { action: "clock-out" }),
    onOpenSettings: () =>
      getMainWindow()?.webContents.send("wm:tray-action", { action: "settings" }),
    onShowWindow: () => {
      const w = getMainWindow();
      if (w) {
        if (w.isMinimized()) w.restore();
        w.show();
        w.focus();
      }
    },
    onQuit: () => {
      autoClockIn.cancel();
      unregisterIpcHandlers();
    },
  });
  tray.init();

  initAutoUpdater();
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const w = getMainWindow();
    if (w) {
      if (w.isMinimized()) w.restore();
      w.focus();
    }
  });

  app.whenReady().then(bootstrap).catch((err: Error) => {
    console.error("[main] bootstrap failed:", err);
    app.quit();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on("before-quit", () => {
    tray?.destroy();
    unregisterIpcHandlers();
  });
}
