# WorkManagerWidget — manual Xcode setup

These Swift files compile only after the WidgetKit extension target is
created in Xcode. The Flutter CLI cannot scaffold this for you.

## 1. Create the widget extension target

1. Open `apps/mobile/ios/Runner.xcworkspace` in Xcode.
2. `File` → `New` → `Target...` → `Widget Extension`.
3. Product Name: `WorkManagerWidget`. Bundle ID:
   `com.molcube.workmanager.WorkManagerWidget`. **Uncheck** "Include
   Configuration App Intent" (we ship our own `Intents.swift`). Keep
   "Include Live Activity" off for v1.
4. When prompted, activate the new scheme.
5. Delete Xcode's auto-generated `WorkManagerWidget.swift` /
   `WorkManagerWidgetBundle.swift` placeholders — the files in this
   directory replace them.
6. Drag every `.swift` file in this directory into the new target's
   group, ticking only the `WorkManagerWidget` target box.
7. Add the `Info.plist` in this directory as the target's `Info.plist`
   (target → Build Settings → `INFOPLIST_FILE`).

## 2. Enable the App Group

The widget reads its data from `UserDefaults(suiteName:)`. Both the
Runner app **and** the extension must be in the same App Group:

1. Apple Developer portal → `Identifiers` → register
   `group.com.molcube.workmanager` if it does not exist.
2. In Xcode for **both** targets (`Runner` and `WorkManagerWidget`):
   `Signing & Capabilities` → `+ Capability` → `App Groups` → tick
   `group.com.molcube.workmanager`.

Verify via:

```bash
plutil -p apps/mobile/ios/Runner/Runner.entitlements | grep -A1 application-groups
plutil -p apps/mobile/ios/WorkManagerWidget/WorkManagerWidget.entitlements | grep -A1 application-groups
```

Both should list `group.com.molcube.workmanager`.

## 3. Build / run

```bash
cd apps/mobile
flutter build ios --release \
  --dart-define=WEBVIEW_URL=https://app.work-manager.molcube.com
open ios/Runner.xcworkspace
# In Xcode: choose the WorkManagerWidget scheme → Run on Simulator
# (long-press Home Screen → Edit → + → 근무 관리 위젯)
```

## 4. Wiring to Flutter

The Dart side calls `WidgetChannels.pushTodayStatus(...)` (see
`lib/widget_channels.dart`). The native handler lives in
`Runner/WidgetMethodChannel.swift` and writes the payload into
`UserDefaults(suiteName: "group.com.molcube.workmanager")` then calls
`WidgetCenter.shared.reloadAllTimelines()`.

## 5. Note on tooling

`flutter pub run flutterfire_cli configure` is **unrelated** to widget
setup — it generates Firebase config only. Widget setup is purely
native and must be done in Xcode by hand.
