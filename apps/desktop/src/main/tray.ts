/**
 * Tray (Windows) / menubar (macOS) icon + context menu.
 * Icon is swapped based on the most recent `wm:status-changed` payload.
 *
 * For MVP we fall back to a single PNG; the asset can be swapped per-state
 * later (assets/tray-working.png, tray-break.png, ...). A missing asset is
 * non-fatal — Electron renders a default placeholder.
 */
import { Menu, Tray, app, nativeImage } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { WorkStatus } from "../shared/ipc-contracts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const STATUS_LABEL: Record<WorkStatus, string> = {
  WORKING: "근무 중",
  BREAK: "휴게 중",
  OFF: "퇴근",
  REMOTE: "재택 근무 중",
};

export interface TrayActions {
  onClockIn: () => void;
  onClockOut: () => void;
  onOpenSettings: () => void;
  onShowWindow: () => void;
  onQuit: () => void;
}

export class WorkManagerTray {
  private tray: Tray | null = null;
  private status: WorkStatus = "OFF";

  constructor(private readonly actions: TrayActions) {}

  init(): void {
    const iconPath = path.join(__dirname, "..", "..", "assets", "tray.png");
    const image = nativeImage.createFromPath(iconPath);
    this.tray = new Tray(image.isEmpty() ? nativeImage.createEmpty() : image);
    this.tray.setToolTip("Work Manager");
    this.tray.on("click", () => this.actions.onShowWindow());
    this.refreshMenu();
  }

  setStatus(status: WorkStatus): void {
    this.status = status;
    this.refreshMenu();
  }

  destroy(): void {
    this.tray?.destroy();
    this.tray = null;
  }

  private refreshMenu(): void {
    if (!this.tray) return;
    const menu = Menu.buildFromTemplate([
      {
        label: `근무 상태: ${STATUS_LABEL[this.status]}`,
        enabled: false,
      },
      { type: "separator" },
      { label: "출근", click: () => this.actions.onClockIn() },
      { label: "퇴근", click: () => this.actions.onClockOut() },
      { type: "separator" },
      { label: "환경설정", click: () => this.actions.onOpenSettings() },
      { label: "창 보이기", click: () => this.actions.onShowWindow() },
      { type: "separator" },
      {
        label: "종료",
        click: () => {
          this.actions.onQuit();
          app.quit();
        },
      },
    ]);
    this.tray.setContextMenu(menu);
  }
}
