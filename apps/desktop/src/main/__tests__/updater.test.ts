/**
 * Test: desktop/main · initAutoUpdater
 * Type: Unit (vitest, node)
 * Why:  Auto-update is invisible until it goes wrong — a misrouted feed URL
 *       silently sends the entire user base to a stale build, and a missed
 *       no-op in dev makes `npm run dev` try to hit a real release feed.
 *       The test fixes the wiring contract: env-driven provider selection +
 *       no-op in dev + main→renderer event broadcast on update events.
 * Covers:
 *   - dev (app.isPackaged === false)            → no-op, no setFeedURL
 *   - packaged + WM_UPDATE_BUCKET unset         → no-op + log line
 *   - packaged + WM_UPDATE_BUCKET set           → s3 provider + check kicked
 *   - packaged + WM_UPDATE_FEED_URL set (no bucket) → generic provider
 *   - update-available / update-downloaded / error are broadcast to renderer
 * Out of scope:
 *   - the @electron/notarize hook (separate manual smoke).
 *   - real S3 fetches (network, OS-level, covered by smoke release in stg).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  UPDATER_EVENT,
  initAutoUpdater,
  type UpdaterLogger,
} from "../updater.js";

interface FakeUpdater {
  setFeedURL: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  checkForUpdatesAndNotify: ReturnType<typeof vi.fn>;
  autoDownload: boolean;
  autoInstallOnAppQuit: boolean;
  /** Fire a registered listener by event name. */
  emit: (ev: string, payload: unknown) => void;
  listeners: Record<string, Array<(p: unknown) => void>>;
}

function makeUpdater(): FakeUpdater {
  const listeners: Record<string, Array<(p: unknown) => void>> = {};
  const u: FakeUpdater = {
    setFeedURL: vi.fn(),
    on: vi.fn((ev: string, cb: (p: unknown) => void) => {
      listeners[ev] = listeners[ev] ?? [];
      listeners[ev].push(cb);
      return u as unknown;
    }) as unknown as ReturnType<typeof vi.fn>,
    checkForUpdatesAndNotify: vi.fn().mockResolvedValue(undefined),
    autoDownload: false,
    autoInstallOnAppQuit: false,
    emit: (ev, p) => {
      (listeners[ev] ?? []).forEach((fn) => fn(p));
    },
    listeners,
  };
  return u;
}

interface FakeWindow {
  isDestroyed: () => boolean;
  webContents: { send: ReturnType<typeof vi.fn> };
}

function makeBrowserWindow(): {
  bw: { getAllWindows: () => FakeWindow[] };
  send: ReturnType<typeof vi.fn>;
} {
  const send = vi.fn();
  const win: FakeWindow = {
    isDestroyed: () => false,
    webContents: { send },
  };
  return {
    bw: { getAllWindows: () => [win] },
    send,
  };
}

function makeLogger(): UpdaterLogger & {
  info: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
} {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

describe("initAutoUpdater", () => {
  let updater: FakeUpdater;
  let logger: ReturnType<typeof makeLogger>;
  let bwShim: ReturnType<typeof makeBrowserWindow>;

  beforeEach(() => {
    updater = makeUpdater();
    logger = makeLogger();
    bwShim = makeBrowserWindow();
  });

  it("no-ops in dev (app.isPackaged === false)", () => {
    initAutoUpdater({
      logger,
      env: { WM_UPDATE_BUCKET: "any" },
      updater: updater as never,
      browserWindow: bwShim.bw as never,
      appRef: { isPackaged: false },
    });
    expect(updater.setFeedURL).not.toHaveBeenCalled();
    expect(updater.checkForUpdatesAndNotify).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      "dev build — auto-update disabled",
    );
  });

  it("logs and bails when WM_UPDATE_BUCKET is unset", () => {
    initAutoUpdater({
      logger,
      env: {},
      updater: updater as never,
      browserWindow: bwShim.bw as never,
      appRef: { isPackaged: true },
    });
    expect(updater.setFeedURL).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      "auto-update disabled (no bucket configured)",
    );
  });

  it("wires the s3 provider when WM_UPDATE_BUCKET is set", () => {
    initAutoUpdater({
      logger,
      env: {
        WM_UPDATE_BUCKET: "workmanager-updates-prod-abc123",
        WM_UPDATE_CHANNEL: "prod",
        AWS_REGION: "ap-northeast-2",
      },
      updater: updater as never,
      browserWindow: bwShim.bw as never,
      appRef: { isPackaged: true },
    });
    expect(updater.setFeedURL).toHaveBeenCalledWith({
      provider: "s3",
      bucket: "workmanager-updates-prod-abc123",
      path: "/desktop/prod",
      region: "ap-northeast-2",
    });
    expect(updater.autoDownload).toBe(true);
    expect(updater.autoInstallOnAppQuit).toBe(true);
    expect(updater.checkForUpdatesAndNotify).toHaveBeenCalled();
  });

  it("falls back to generic provider when only WM_UPDATE_FEED_URL is set", () => {
    initAutoUpdater({
      logger,
      env: { WM_UPDATE_FEED_URL: "https://updates.example.com/desktop" },
      updater: updater as never,
      browserWindow: bwShim.bw as never,
      appRef: { isPackaged: true },
    });
    expect(updater.setFeedURL).toHaveBeenCalledWith({
      provider: "generic",
      url: "https://updates.example.com/desktop",
    });
  });

  it("broadcasts update-available / update-downloaded / error to renderer", () => {
    initAutoUpdater({
      logger,
      env: { WM_UPDATE_BUCKET: "b" },
      updater: updater as never,
      browserWindow: bwShim.bw as never,
      appRef: { isPackaged: true },
    });
    updater.emit("update-available", { version: "1.2.3" });
    updater.emit("update-downloaded", { version: "1.2.3" });
    updater.emit("error", new Error("boom"));

    expect(bwShim.send).toHaveBeenCalledWith(
      UPDATER_EVENT.UpdateAvailable,
      { version: "1.2.3" },
    );
    expect(bwShim.send).toHaveBeenCalledWith(
      UPDATER_EVENT.UpdateDownloaded,
      { version: "1.2.3" },
    );
    expect(bwShim.send).toHaveBeenCalledWith(
      UPDATER_EVENT.Error,
      { message: "boom" },
    );
  });
});
