import 'dart:async';

import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

import 'app.dart';
import 'notif/local_notifs.dart';

/// Mobile shell entry point.
///
/// Push transports (no Firebase — see ADR-006):
/// - Android: ntfy WebSocket (`apps/mobile/lib/notif/ntfy_client.dart`),
///   subscribed lazily by the JS bridge once we know the membership id.
/// - iOS: APNs registered via the standard `UIApplication` delegate
///   (`apps/mobile/ios/Runner/AppDelegate.swift`), token forwarded to the
///   SPA through `NativeBridge.registerDeviceToken`.
/// - Foreground display on both platforms uses `flutter_local_notifications`.
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await LocalNotifs.instance.initialize();
  unawaited(_requestNotifPermission());
  runApp(const WorkManagerApp());
}

Future<void> _requestNotifPermission() async {
  try {
    await Permission.notification.request();
  } catch (_) {
    /* ignore — older Android versions don't expose POST_NOTIFICATIONS */
  }
}
