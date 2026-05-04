# Firebase setup — work-manager mobile

This directory holds **only** the setup instructions. The generated files
(`google-services.json`, `GoogleService-Info.plist`, `firebase_options.dart`)
must never land in the repo — see `apps/mobile/.gitignore`.

## Prerequisites

- A Firebase project (one per environment is fine: `dev`, `stg`, `prod`).
- The Flutter SDK installed locally.
- An Apple Developer account and an APNs auth key (`.p8`) **only** for prod
  push delivery — keep the `.p8` outside the repo.

## 1. Install the FlutterFire CLI

```bash
flutter pub global activate flutterfire_cli
```

(Add `~/.pub-cache/bin` to your `$PATH` if `flutterfire` is not found.)

## 2. Configure the project

From `apps/mobile/`:

```bash
flutterfire configure --project=<your-firebase-project-id>
```

This will:

- Add the Android app (`com.molcube.workmanager`) and the iOS app
  (`com.molcube.workmanager`) to the Firebase project.
- Download `android/app/google-services.json`.
- Download `ios/Runner/GoogleService-Info.plist`.
- Generate `lib/firebase_options.dart`.

All three files are gitignored. **Do not commit them.**

## 3. iOS extras

- Open `ios/Runner.xcworkspace` and add the downloaded
  `GoogleService-Info.plist` to the `Runner` target (drag into Xcode,
  ensure "Copy if needed" is unchecked since it lives at the path above).
- Upload your APNs `.p8` key in Firebase Console → Project Settings →
  Cloud Messaging → Apple app configuration. Keep the `.p8` outside the
  repo (it is also in `.gitignore`).
- App Group capability: see `ios/WorkManagerWidget/README.md` for the
  separate App-Group setup the widget extension needs (unrelated to
  Firebase but commonly forgotten in the same setup pass).

## 4. Android extras

- Confirm `android/app/build.gradle.kts` does NOT need the
  `com.google.gms.google-services` plugin block to compile — `firebase_core`
  applies it transparently for Flutter projects. If you see a "File
  google-services.json is missing" warning, drop the file under
  `android/app/` and re-run `flutter pub get`.

## 5. Push notification channel

The Android default channel id (`wm-default`) is already created in code:
see `apps/mobile/lib/notif/local_notifs.dart` and the
`<meta-data android:name="com.google.firebase.messaging.default_notification_channel_id">`
entry in `AndroidManifest.xml`. Cross-link maintained — keep them in sync.

## 6. Verify

```bash
flutter run -d android
# Expect log: "[main] Firebase init skipped" should NOT appear.
# Then call NativeBridge.registerDeviceToken() from the SPA — should
# resolve to { platform: 'ANDROID', token: 'fcm-…' }.
```
