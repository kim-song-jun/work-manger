# Work Manager — Desktop Shell (Electron)

Hosts the `apps/web` SPA inside a BrowserWindow and adds OS-grade affordances:
tray / menubar, native notifications, and an auto clock-in trigger that fires
at the user's scheduled start time.

## Requirements

- Node **20+**
- npm 10+
- The web SPA running at `http://localhost:4444` for dev (`apps/web` → `npm run dev`).

## Install

```bash
cd apps/desktop
npm install --no-audit --no-fund
# If hoisting / peer-dep collisions occur on Windows:
# npm install --no-audit --no-fund --legacy-peer-deps
```

## Scripts

| Script | What |
|---|---|
| `npm run dev` | Compile TS, launch Electron pointing at `WM_WEB_URL` (default `http://localhost:4444`). |
| `npm run build:win` | Produce an unsigned NSIS installer under `release/`. |
| `npm run build:mac` | Produce a DMG (`arm64`+`x64`). Notarization disabled by default — see below. |
| `npm run build:linux` | Produce an AppImage. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run test` | Vitest unit suite (notifications + auto-clock-in). |
| `npm run lint` | ESLint with `--max-warnings=0`. |

## Environment variables

| Var | Default | Use |
|---|---|---|
| `WM_WEB_URL` | `http://localhost:4444` | URL the BrowserWindow loads. Point at the prod host (`https://app.work-manager.molcube.com`) for packaged builds. |
| `WM_UPDATE_FEED_URL` | (unset) | Generic-provider update feed for `electron-updater`. When unset, falls back to whatever `electron-builder.yml` declares (`github` draft today, S3-ready). |

## IPC contract

All channel constants live in `src/shared/ipc-contracts.ts`. The renderer
talks to the main process exclusively through `window.ElectronBridge` (see
`apps/web/src/shared/lib/desktop.ts`).

### Renderer → Main (`invoke`)

| Channel | Payload | Returns |
|---|---|---|
| `wm:get-app-version` | — | `string` |
| `wm:set-status` | `{ status: 'WORKING' \| 'BREAK' \| 'OFF' \| 'REMOTE' }` | `void` |
| `wm:notify` | `{ kind, title, body, deepLink? }` | `boolean` (false ⇒ debounced or unsupported) |
| `wm:schedule-auto-clock-in` | `{ scheduledStartIso, offsetSeconds? }` | `{ scheduledInMs } \| null` |
| `wm:cancel-auto-clock-in` | — | `void` |
| `wm:open-external` | `string` (http/https only) | `void` |

### Main → Renderer (`webContents.send`)

| Channel | Payload | Fired when |
|---|---|---|
| `wm:status-changed` | `{ status }` | After `wm:set-status` round-trips, so other windows / future split-windows can sync. |
| `wm:notification-clicked` | `{ kind, deepLink? }` | User clicks an OS notification — main also focuses the window. |
| `wm:auto-clock-in` | `{ firedAtIso, scheduledStartIso }` | Auto clock-in timer elapses. Renderer decides whether to call `POST /attendance/clock-in`. |

## Code-signing & notarization

Default `build:mac` / `build:win` produce **unsigned** artifacts intended for
local smoke-testing. Production releases require:

- **macOS**: an Apple Developer ID Application certificate in the keychain,
  and `APPLE_ID` / `APPLE_APP_SPECIFIC_PASSWORD` / `APPLE_TEAM_ID` env vars.
  Flip `mac.notarize: true` in `electron-builder.yml`.
- **Windows**: a code-signing certificate (`CSC_LINK` + `CSC_KEY_PASSWORD`
  env vars; HSM/EV cert recommended for SmartScreen reputation).
- **Linux**: AppImage signing is optional but recommended for repo
  distribution.

CI hands these in via secret env vars; the YAML stays the same.

## Architecture notes

- `contextIsolation: true`, `nodeIntegration: false`. Renderer never touches
  Electron primitives directly — only the typed `window.ElectronBridge`
  surface exposed via `contextBridge.exposeInMainWorld`.
- Single-instance lock — second launch focuses the existing window.
- Window bounds + auto-clock-in offset persisted via `electron-store`
  (`wm-desktop-settings.json` in the OS user-data dir).
- Notification debounce: 1 fire per `kind` per 60s. Backend flapping cannot
  spam the user.
- Auto clock-in: one-shot timer. Renderer is the source of truth for whether
  to actually call the API on fire (geo capture + idempotency-key live
  there). Cancelled on settings update or successful clock-in.
