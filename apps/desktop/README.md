# Work Manager — Desktop Shell (Electron)

Hosts the `apps/web` SPA inside a BrowserWindow and adds OS-grade affordances:
tray / menubar, native notifications, and an auto clock-in trigger that fires
at the user's scheduled start time.

## Requirements

- Node **20+** (CI uses 24 — see `.github/workflows/release.yml`)
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
| `npm run release:win` / `release:mac` / `release:linux` | Build **and publish** to S3 (`--publish=always`). Used by CI. |
| `npm run check:mac-signing` | Preflight: warns when Apple cert / env vars are missing. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run test` | Vitest unit suite (notifications + auto-clock-in + updater). |
| `npm run lint` | ESLint with `--max-warnings=0`. |

## Environment variables

| Var | Default | Use |
|---|---|---|
| `WM_WEB_URL` | `http://localhost:4444` | URL the BrowserWindow loads. Point at the prod host (`https://app.work-manager.molcube.com`) for packaged builds. |
| `WM_UPDATE_BUCKET` | (unset) | S3 bucket holding update manifests + binaries. When set, the updater fetches `s3://<bucket>/desktop/<channel>/latest*.yml`. When unset, auto-update is disabled. |
| `WM_UPDATE_CHANNEL` | `prod` | Sub-path inside the bucket. `beta` / `stg` / `prod`. |
| `WM_UPDATE_FEED_URL` | (unset) | Generic-provider fallback (any HTTPS host serving `latest*.yml`). Ignored when `WM_UPDATE_BUCKET` is set. |
| `AWS_REGION` | `ap-northeast-2` | Region of the update bucket. |

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
| `wm:status-changed` | `{ status }` | After `wm:set-status` round-trips. |
| `wm:notification-clicked` | `{ kind, deepLink? }` | User clicks an OS notification. |
| `wm:auto-clock-in` | `{ firedAtIso, scheduledStartIso }` | Auto clock-in timer elapses. |
| `wm:updater:update-available` | `{ version? }` | electron-updater finds a newer build on the feed. |
| `wm:updater:update-downloaded` | `{ version? }` | Update fully downloaded — installs on next quit. |
| `wm:updater:error` | `{ message }` | Update check / download / install failed. |

---

# Release pipeline

End-to-end flow for cutting a signed, notarized release that auto-updates
existing installs via S3.

## Local — unsigned dev build

```bash
cd apps/desktop
npm install --legacy-peer-deps
npm run build:mac   # or build:win / build:linux
# Output: release/Work Manager-0.1.0-arm64.dmg, etc.
```

No env vars needed. Notarization, signing, and S3 publish all no-op.

## Local signed macOS build

Requires:
- A `Developer ID Application` certificate imported into your login keychain.
- An app-specific password generated at appleid.apple.com.

```bash
cd apps/desktop
export APPLE_ID="you@example.com"
export APPLE_APP_SPECIFIC_PASSWORD="abcd-efgh-ijkl-mnop"
export APPLE_TEAM_ID="ABCDE12345"
npm run check:mac-signing  # preflight — warns if anything's missing
npm run build:mac
# Hardened-runtime signing happens during the build; notarization runs in the
# `afterSign` hook (scripts/notarize.cjs) and staples the ticket onto the .app.
```

Skip notarization for a faster smoke test:

```bash
APPLE_NOTARIZE_DRY_RUN=1 npm run build:mac
```

## Local signed Windows build (local cert)

```bash
cd apps/desktop
$env:CSC_LINK = "C:\path\to\codesign.pfx"
$env:CSC_KEY_PASSWORD = "<pfx-password>"
npm run build:win
```

## Cloud-signed Windows build (DigiCert KeyLocker / SSL.com / Azure Trusted Signing)

```bash
cd apps/desktop
$env:WM_WIN_SIGN_MODE = "cloud"
$env:CSC_LINK = "<thumbprint or KeyLocker config ref>"
$env:CSC_KEY_PASSWORD = "<API password / PIN>"
$env:WM_WIN_TIMESTAMP_URL = "http://timestamp.digicert.com"  # optional
npm run build:win
```

`scripts/win-sign.cjs` invokes `signtool.exe` directly with `/tr` (RFC 3161
timestamp). The Windows SDK's `signtool` must be on `PATH`. CI runners
(`windows-latest`) already have it.

## CI — GitHub Actions

`.github/workflows/release.yml` ships three jobs (`release-mac`,
`release-win`, `release-linux`).

Trigger:
- **GitHub Release published** → publishes to S3 + uploads artifacts to the release.
- **`workflow_dispatch`** → manually pick channel + whether to publish.

Required secrets are documented in `.github/RELEASE_SECRETS.md`. Quick set:

```bash
gh secret set APPLE_ID --body "you@example.com"
gh secret set APPLE_APP_SPECIFIC_PASSWORD --body "..."
gh secret set APPLE_TEAM_ID --body "ABCDE12345"
gh secret set MAC_CSC_LINK < <(base64 -i DeveloperID.p12)
gh secret set MAC_CSC_KEY_PASSWORD --body "..."
gh secret set WIN_CSC_LINK < <(base64 -i codesign.pfx)
gh secret set WIN_CSC_KEY_PASSWORD --body "..."
gh secret set WM_UPDATE_BUCKET --body "$(terraform -chdir=infra/terraform/envs/prod output -raw desktop_updates_bucket_name)"
gh secret set AWS_ACCESS_KEY_ID --body "..."
gh secret set AWS_SECRET_ACCESS_KEY --body "..."

# Optional cloud signing toggle
gh variable set WM_WIN_SIGN_MODE --body "cloud"
```

## Auto-update behavior

`src/main/updater.ts` resolves the feed in this order:

1. `WM_UPDATE_BUCKET` set → S3 provider, `s3://<bucket>/desktop/<channel>/`.
2. `WM_UPDATE_FEED_URL` set → generic provider.
3. neither → "auto-update disabled (no bucket configured)" log line; no further work.

Renderer wiring: any window can subscribe via
`window.ElectronBridge.on('wm:updater:update-available', cb)` (and
`-downloaded` / `-error`). The `updater.test.ts` suite covers the env-driven
provider selection + dev no-op.

## S3 bucket layout

```
s3://workmanager-desktop-updates-prod-<accountshort>/
  desktop/
    prod/
      latest.yml             # Windows
      latest-mac.yml         # macOS
      latest-linux.yml       # Linux
      Work Manager-0.1.0.dmg
      Work Manager-0.1.0-mac.zip
      Work Manager Setup 0.1.0.exe
      Work Manager-0.1.0.AppImage
      *.blockmap             # delta-update reuse
    beta/
      ...
    stg/
      ...
```

The bucket itself is **private**; CloudFront fronts it with OAC if
`enable_cloudfront = true` on the terraform module
(`infra/terraform/modules/desktop-updates`).

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `notarytool` returns `Invalid` | Wrong team / bundle ID, or not hardened-runtime. | Check `mac.hardenedRuntime: true` and that `entitlements.mac.plist` is referenced. Run `xcrun notarytool log <submission-id>` (the ID is logged by `scripts/notarize.cjs`). |
| `signtool.exe` "no certificates found" | `CSC_LINK` empty or path wrong. | Verify `CSC_LINK` resolves on the runner; for cloud signing make sure `WM_WIN_SIGN_MODE=cloud`. |
| EV cert SmartScreen still flags installer | Reputation builds up over signed downloads — first ~3 weeks of a new EV cert always flag. | No fix; wait. Don't rotate the cert prematurely. |
| `S3 403 PutObject` during `--publish=always` | IAM principal missing on `var.desktop_updates_publish_principal_arns`. | `terraform apply` after adding the CI runner ARN. |
| `S3 403 GetObject` from end-user updater | Bucket private but no CloudFront, and the updater is using the S3 SigV4 path that needs IAM creds end-user doesn't have. | Either flip `enable_cloudfront = true` and use `provider: cloudfront`, or switch the updater to `provider: generic` with presigned URLs. |
| Apple cert expired mid-release | 1-year cadence missed. | Renew at developer.apple.com → Certificates → Generate. Re-import `.p12`, update `MAC_CSC_LINK`. |

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
