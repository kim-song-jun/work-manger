/**
 * electron-updater wiring.
 *
 * Update feed selection (priority order):
 *   1. WM_UPDATE_BUCKET  → S3 provider (bucket + path /desktop/<channel>)
 *   2. WM_UPDATE_FEED_URL → generic provider (any signed manifest host)
 *   3. neither           → no-op (dev / unconfigured); auto-update disabled
 *
 * Renderer wiring: forwards `update-available`, `update-downloaded`, and
 * `error` to every BrowserWindow via `wm:updater:*` channels so the renderer
 * can surface a "restart to update" toast (consumed via ElectronBridge.on).
 */
import { BrowserWindow, app } from "electron";
import electronUpdaterPkg from "electron-updater";

const { autoUpdater } = electronUpdaterPkg;

export interface UpdaterLogger {
  info: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
}

export interface InitAutoUpdaterOptions {
  logger?: UpdaterLogger;
  /** Override env lookup (used by tests). */
  env?: NodeJS.ProcessEnv;
  /** Override the autoUpdater singleton (used by tests). */
  updater?: typeof autoUpdater;
  /** Override the BrowserWindow class (used by tests). */
  browserWindow?: typeof BrowserWindow;
  /** Override the Electron app (used by tests; needs `isPackaged`). */
  appRef?: { isPackaged: boolean };
}

const consoleLogger: UpdaterLogger = {
  info: (m) => console.info(`[updater] ${m}`),
  warn: (m) => console.warn(`[updater] ${m}`),
  error: (m) => console.error(`[updater] ${m}`),
};

/** Channel names emitted from main → renderer. */
export const UPDATER_EVENT = {
  UpdateAvailable: "wm:updater:update-available",
  UpdateDownloaded: "wm:updater:update-downloaded",
  Error: "wm:updater:error",
} as const;

export type UpdaterEventChannel =
  (typeof UPDATER_EVENT)[keyof typeof UPDATER_EVENT];

interface FeedConfig {
  kind: "s3" | "generic" | "none";
  description: string;
}

function resolveFeed(env: NodeJS.ProcessEnv): FeedConfig {
  const bucket = env.WM_UPDATE_BUCKET;
  if (bucket) {
    const channel = env.WM_UPDATE_CHANNEL ?? "prod";
    const region = env.AWS_REGION ?? "ap-northeast-2";
    return {
      kind: "s3",
      description: `s3://${bucket}/desktop/${channel} (${region})`,
    };
  }
  const url = env.WM_UPDATE_FEED_URL;
  if (url) {
    return { kind: "generic", description: url };
  }
  return { kind: "none", description: "no feed configured" };
}

function broadcast(
  bw: typeof BrowserWindow,
  channel: UpdaterEventChannel,
  payload: unknown,
): void {
  for (const win of bw.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, payload);
    }
  }
}

export function initAutoUpdater(options: InitAutoUpdaterOptions = {}): void {
  const logger = options.logger ?? consoleLogger;
  const env = options.env ?? process.env;
  const updater = options.updater ?? autoUpdater;
  const bw = options.browserWindow ?? BrowserWindow;
  const appRef = options.appRef ?? app;

  if (!appRef.isPackaged) {
    logger.info("dev build — auto-update disabled");
    return;
  }

  const feed = resolveFeed(env);
  if (feed.kind === "none") {
    logger.info("auto-update disabled (no bucket configured)");
    return;
  }

  if (feed.kind === "s3") {
    updater.setFeedURL({
      provider: "s3",
      bucket: env.WM_UPDATE_BUCKET as string,
      path: `/desktop/${env.WM_UPDATE_CHANNEL ?? "prod"}`,
      region: env.AWS_REGION ?? "ap-northeast-2",
    } as Parameters<typeof updater.setFeedURL>[0]);
  } else {
    updater.setFeedURL({
      provider: "generic",
      url: env.WM_UPDATE_FEED_URL as string,
    });
  }
  logger.info(`feed → ${feed.description}`);

  updater.autoDownload = true;
  updater.autoInstallOnAppQuit = true;

  updater.on("checking-for-update", () => logger.info("checking for update"));
  updater.on("update-available", (info: { version?: string }) => {
    logger.info(`update available: ${info.version ?? "?"}`);
    broadcast(bw, UPDATER_EVENT.UpdateAvailable, { version: info.version });
  });
  updater.on("update-not-available", () => logger.info("up to date"));
  updater.on("download-progress", (p: { percent: number }) =>
    logger.info(`downloading: ${Math.round(p.percent)}%`),
  );
  updater.on("update-downloaded", (info: { version?: string }) => {
    logger.info(`downloaded ${info.version ?? "?"} — will install on quit`);
    broadcast(bw, UPDATER_EVENT.UpdateDownloaded, { version: info.version });
  });
  updater.on("error", (err: Error) => {
    logger.error(`update error: ${err.message}`);
    broadcast(bw, UPDATER_EVENT.Error, { message: err.message });
  });

  void updater.checkForUpdatesAndNotify().catch((err: Error) => {
    logger.warn(`initial check failed: ${err.message}`);
  });
}
