// WidgetMethodChannel.swift
// Bridges the Dart `com.molcube.workmanager/widget` MethodChannel into the
// App Group's UserDefaults so the WidgetKit extension can render the latest
// snapshot. After every write we ping `WidgetCenter.shared` to reload
// timelines (not strictly required — iOS would reload at the next 30-min
// timeline tick — but gives near-instant updates after clock-in).

import Flutter
import WidgetKit
import UIKit

enum WidgetChannel {
    static let name = "com.molcube.workmanager/widget"
    static let appGroup = "group.com.molcube.workmanager"
    static let snapshotKey = "wm.todaySnapshot"

    /// Call from `AppDelegate.application(_:didFinishLaunchingWithOptions:)`
    /// once `let controller = window?.rootViewController as! FlutterViewController`
    /// has been resolved.
    static func register(on controller: FlutterViewController) {
        let channel = FlutterMethodChannel(
            name: name, binaryMessenger: controller.binaryMessenger
        )
        channel.setMethodCallHandler { call, result in
            switch call.method {
            case "widget.pushTodayStatus":
                guard let args = call.arguments as? [String: Any] else {
                    result(FlutterError(code: "BAD_ARGS",
                                        message: "expected map", details: nil))
                    return
                }
                writeSnapshot(args)
                reloadAll()
                result(["ok": true])

            case "widget.reload":
                reloadAll()
                result(["ok": true])

            default:
                result(FlutterMethodNotImplemented)
            }
        }
    }

    private static func writeSnapshot(_ args: [String: Any]) {
        let defaults = UserDefaults(suiteName: appGroup)
        var dict: [String: Any] = defaults?.dictionary(forKey: snapshotKey) ?? [:]
        for (k, v) in args { dict[k] = v }
        defaults?.set(dict, forKey: snapshotKey)
    }

    private static func reloadAll() {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
    }
}
