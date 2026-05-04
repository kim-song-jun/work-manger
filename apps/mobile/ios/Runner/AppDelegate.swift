// AppDelegate.swift
// Standard Flutter iOS bootstrap + registration of the WidgetMethodChannel.
// `flutter create .` will overwrite this if regenerated; preserve the
// `WidgetChannel.register(on:)` line below.

import UIKit
import Flutter

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions:
            [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        GeneratedPluginRegistrant.register(with: self)

        if let controller = window?.rootViewController as? FlutterViewController {
            WidgetChannel.register(on: controller)
        }
        return super.application(application,
                                 didFinishLaunchingWithOptions: launchOptions)
    }
}
