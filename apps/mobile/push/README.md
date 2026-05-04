# Self-hosted push setup — work-manager mobile

This directory documents the **non-Firebase** push transports used by the
mobile shell. See [ADR-006](../../../docs/adr/ADR-006-self-hosted-push-no-firebase.md)
for the rationale (zero Google dependency).

| Platform | Transport | Server | Token shape forwarded to BE |
|---|---|---|---|
| Android (native shell) | **ntfy** WebSocket | self-hosted (`docker compose ntfy`) | topic name `wm-prod-membership-{id}` |
| iOS (native shell) | **APNs HTTP/2 direct** | Apple gateway | 64-char hex device token |
| Browser / Electron / WebView (foreground) | **Web Push (VAPID)** | browser push service (Mozilla autopush, Apple Push, Chrome FCM gateway — only HTTP, no SDK) | JSON `PushSubscription` |

The Flutter shell never imports `firebase_*` packages. Removed in 2026-05.

## 1. ntfy (Android)

The ntfy server is part of the standard Docker compose stack
(`docker-compose.yml` → `services.ntfy`). nginx proxies `/v1/ntfy/*` to it.

After `docker compose up -d ntfy`, provision the BE publisher:

```bash
docker compose exec api python manage.py init_ntfy_user wm-publisher
# → emits the `docker compose exec ntfy ntfy ...` snippets to run on the host
```

Then export `NTFY_AUTH_TOKEN=<token>` and restart the api / worker. The
Android shell auto-subscribes on first `NativeBridge.registerDeviceToken`
call — see `apps/mobile/lib/notif/ntfy_client.dart`.

To keep the WebSocket alive across Doze, the shell starts a minimal
`NtfyForegroundService` (Kotlin, `apps/mobile/android/app/src/main/kotlin/
com/molcube/workmanager/push/NtfyForegroundService.kt`).

## 2. APNs HTTP/2 direct (iOS)

Required env-vars (see `docs/operations/operations-guide.md §5.4`):

```
APNS_KEY_ID=<10-char key id>
APNS_TEAM_ID=<10-char team id>
APNS_BUNDLE_ID=com.molcube.workmanager
APNS_KEY_PEM=<contents of AuthKey_<id>.p8>
APNS_USE_SANDBOX=True   # False for prod
```

Generate the `.p8` in Apple Developer → Certificates, Identifiers & Profiles
→ Keys → "+", enable **Apple Push Notifications service (APNs)**. Download
once — Apple will not show it again. Store the PEM body in your secret
manager and inject as `APNS_KEY_PEM` (newlines preserved).

The iOS shell registers via the standard `UIApplication` delegate in
`apps/mobile/ios/Runner/AppDelegate.swift`; the device token is forwarded to
Dart through the `wm.push.apns` MethodChannel. **No FCM SDK or
`GoogleService-Info.plist` involved.**

## 3. Web Push (VAPID) — browser / Electron / WebView foreground

```bash
docker compose exec api python manage.py generate_vapid_keys
# → Paste WEB_PUSH_VAPID_PUBLIC_KEY, WEB_PUSH_VAPID_PRIVATE_KEY into env.
# Public key MUST also land in apps/web/.env as VITE_VAPID_PUBLIC_KEY.
```

The FE registers `/sw.js` and POSTs the `PushSubscription` to
`/v1/notifications/devices`. See `apps/web/src/shared/lib/web-push.ts`.

## 4. Verify

```bash
# 1. ntfy reachable (publishes a test message — no subscriber needed)
curl -fsS http://localhost:4444/v1/ntfy/wm-prod-test -d "hello"
# → 200 OK with JSON payload echoed

# 2. APNs token round-trips through the bridge
flutter run -d ios
# In Safari Web Inspector → JS console:
window.NativeBridge.registerDeviceToken({}).then(console.log)
# → { platform: 'IOS', token: '<hex>' }

# 3. Web Push subscription
# Open the SPA → Tweaks panel → "푸시 알림 켜기"
# → toast "푸시 알림이 활성화됐어요"
```

## 5. Migration from FCM

If you find a stray `google-services.json` / `GoogleService-Info.plist` /
`firebase_options.dart` from before the 2026-05 cut-over, delete them — they
are no longer referenced. The previous `apps/mobile/firebase/` directory has
been removed.
