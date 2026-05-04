# work-manager — mobile (Flutter WebView shell)

Thin Flutter shell that hosts the React SPA (`apps/web`) inside an
`InAppWebView` and bridges native capabilities (GPS, FCM push, haptics,
device-token registration) into `window.NativeBridge` for the SPA.

> Architecture context: see [`docs/architecture/architecture.md` §5](../../docs/architecture/architecture.md#5-모바일-flutter-webview).

## Layout

```
apps/mobile/
├── pubspec.yaml
├── lib/
│   ├── main.dart                  # Firebase + local-notif init, runApp
│   ├── app.dart                   # MaterialApp root, single screen
│   ├── web_shell.dart             # InAppWebView host + splash + pull-to-refresh
│   ├── bridge/
│   │   ├── native_bridge.dart     # Dart-side handlers (location/FCM/haptic/...)
│   │   └── inject.dart            # JS shim defining window.NativeBridge
│   ├── notif/
│   │   └── local_notifs.dart      # Foreground FCM → local banner
│   └── widget_channels.dart       # MethodChannel placeholder for widgets
├── test/
│   └── bridge_payload_test.dart   # Unit: payload encoding contract
├── integration_test/
│   └── webview_loads_test.dart    # Smoke: shell boots + loads :4444
├── android/app/src/main/AndroidManifest.xml
└── ios/Runner/Info.plist
```

## Local development

Prereqs: Flutter SDK 3.24+, Android Studio (emulator) and/or Xcode.

```bash
cd apps/mobile
flutter pub get

# Boot the SPA dev server first (other terminal, repo root):
docker compose up web        # serves http://localhost:4444

# Android emulator — uses 10.0.2.2 to reach the host loopback:
flutter run -d android \
  --dart-define=WEBVIEW_URL=http://10.0.2.2:4444

# iOS simulator — localhost works directly:
flutter run -d ios \
  --dart-define=WEBVIEW_URL=http://localhost:4444

# Pointing at a deployed environment:
flutter run --dart-define=WEBVIEW_URL=https://app.work-manager.molcube.com
```

## Tests

```bash
flutter analyze                  # static analysis
flutter test                     # unit (test/)
flutter test integration_test    # integration (needs a device + running SPA)
```

## Build

```bash
# Android App Bundle for Play Console upload
flutter build appbundle --release \
  --dart-define=WEBVIEW_URL=https://app.work-manager.molcube.com

# iOS — open in Xcode after building
flutter build ipa --release \
  --dart-define=WEBVIEW_URL=https://app.work-manager.molcube.com
```

## Firebase setup (NOT committed)

Drop these into your local checkout (they are gitignored):

- `android/app/google-services.json` — from the Firebase console
  (`Project settings → Your apps → Android`)
- `ios/Runner/GoogleService-Info.plist` — same flow for iOS
- `lib/firebase_options.dart` — generate via `flutterfire configure`

Without these, the app still boots; `Firebase.initializeApp()` failure is
caught and logged in `lib/main.dart`, and `NativeBridge.registerDeviceToken()`
returns `{ error: 'TOKEN_UNAVAILABLE' }`.

## NativeBridge contract (JS side)

All methods return Promises. Errors resolve to `{ error: '<CODE>' }` rather
than rejecting, so the FE can branch without try/catch noise.

| method                 | resolves to |
|------------------------|-------------|
| `requestLocation()`    | `{ latitude, longitude, accuracy_m, ts }` or `{ error: 'PERMISSION_DENIED' \| 'POSITION_UNAVAILABLE' \| 'TIMEOUT' }` |
| `watchLocation()`      | `{ ok: true }`. Subsequent fixes arrive as `window.addEventListener('wm:location', e => e.detail)` |
| `stopWatching()`       | `{ ok: true }` |
| `registerDeviceToken()`| `{ platform: 'ANDROID'\|'IOS', token }` or `{ error }` |
| `haptic('light' \| 'medium' \| 'heavy')` | `{ ok: true }` |
| `share(payload)`       | `{ error: 'NOT_IMPLEMENTED' }` (deferred) |
| `appInfo()`            | `{ version, build, platform }` |

The TS wrapper lives at `apps/web/src/shared/lib/native.ts`.
