/**
 * electron-updater wiring. Feed URL is overridable via WM_UPDATE_FEED_URL
 * (S3 / generic provider). In dev (no packaged app), this is a no-op so
 * `npm run dev` doesn't try to hit a release feed.
 */
import { app } from "electron";
import { autoUpdater } from "electron-updater";

export interface UpdaterLogger {
  info: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
}

const consoleLogger: UpdaterLogger = {
  info: (m) => console.info(`[updater] ${m}`),
  warn: (m) => console.warn(`[updater] ${m}`),
  error: (m) => console.error(`[updater] ${m}`),
};

export function initAutoUpdater(logger: UpdaterLogger = consoleLogger): void {
  if (!app.isPackaged) {
    logger.info("dev build — auto-update disabled");
    return;
  }

  const feedUrl = process.env.WM_UPDATE_FEED_URL;
  if (feedUrl) {
    autoUpdater.setFeedURL({ provider: "generic", url: feedUrl });
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () =>
    logger.info("checking for update"),
  );
  autoUpdater.on("update-available", (info: { version?: string }) =>
    logger.info(`update available: ${info.version ?? "?"}`),
  );
  autoUpdater.on("update-not-available", () =>
    logger.info("up to date"),
  );
  autoUpdater.on("download-progress", (p: { percent: number }) =>
    logger.info(`downloading: ${Math.round(p.percent)}%`),
  );
  autoUpdater.on("update-downloaded", (info: { version?: string }) =>
    logger.info(`downloaded ${info.version ?? "?"} — will install on quit`),
  );
  autoUpdater.on("error", (err: Error) =>
    logger.error(`update error: ${err.message}`),
  );

  void autoUpdater.checkForUpdatesAndNotify().catch((err: Error) => {
    logger.warn(`initial check failed: ${err.message}`);
  });
}
