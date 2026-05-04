// AppDelegate.swift
//
// Standard Flutter iOS bootstrap + registration of the WidgetMethodChannel
// AND the APNs HTTP/2 direct path (no FCM intermediary — see ADR-006).
//
// Push transport (iOS):
// 1. UNUserNotificationCenter requests authorization (alert + badge + sound).
// 2. UIApplication.shared.registerForRemoteNotifications() asks Apple for a
//    device token.
// 3. `application:didRegisterForRemoteNotificationsWithDeviceToken:` fires
//    once Apple replies; we cache the hex string and expose it via the
//    `wm.push.apns` MethodChannel so the Dart bridge can forward it to the
//    React SPA via `NativeBridge.registerDeviceToken({platform: 'IOS', token})`.
//    The BE then sends pushes by POSTing to api.push.apple.com directly
//    (apps/notification/providers/real_push.py) — no Firebase in the loop.
//
// `flutter create .` will overwrite this if regenerated; preserve the
// `WidgetChannel.register(on:)` call AND the APNs handlers below.

import UIKit
import Flutter
import UserNotifications

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {

    private var apnsToken: String?
    private var apnsChannel: FlutterMethodChannel?

    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions:
            [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        GeneratedPluginRegistrant.register(with: self)

        if let controller = window?.rootViewController as? FlutterViewController {
            WidgetChannel.register(on: controller)

            // APNs MethodChannel — Dart side calls `getToken` to read the
            // cached hex token. Returns nil before Apple has delivered it.
            let channel = FlutterMethodChannel(
                name: "wm.push.apns",
                binaryMessenger: controller.binaryMessenger
            )
            channel.setMethodCallHandler { [weak self] call, result in
                if call.method == "getToken" {
                    result(self?.apnsToken)
                } else {
                    result(FlutterMethodNotImplemented)
                }
            }
            apnsChannel = channel
        }

        UNUserNotificationCenter.current().delegate = self
        UNUserNotificationCenter.current().requestAuthorization(
            options: [.alert, .badge, .sound]
        ) { granted, _ in
            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
        }

        return super.application(application,
                                 didFinishLaunchingWithOptions: launchOptions)
    }

    override func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        let hex = deviceToken.map { String(format: "%02x", $0) }.joined()
        apnsToken = hex
        // Push to Dart immediately so the bridge can resolve any pending
        // `registerDeviceToken` call without waiting for the next invocation.
        apnsChannel?.invokeMethod("onToken", arguments: hex)
    }

    override func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        NSLog("[apns] register failed: \(error.localizedDescription)")
    }
}
