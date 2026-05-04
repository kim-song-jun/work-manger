import 'dart:async';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

import 'app.dart';
import 'notif/local_notifs.dart';

/// Background isolate FCM handler — must be a top-level function.
@pragma('vm:entry-point')
Future<void> _firebaseBackgroundHandler(RemoteMessage message) async {
  // Best-effort init in the background isolate; surface as local notif.
  await Firebase.initializeApp();
  await LocalNotifs.instance.show(
    title: message.notification?.title ?? '알림',
    body: message.notification?.body ?? '',
    payload: message.data['route'] as String?,
  );
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Firebase init is best-effort: in dev the google-services placeholders may
  // be missing. We log and continue so the WebView still boots.
  try {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(_firebaseBackgroundHandler);
  } catch (e) {
    if (kDebugMode) {
      debugPrint('[main] Firebase init skipped: $e');
    }
  }

  await LocalNotifs.instance.initialize();

  // Foreground push → surface as local banner so users see it inside the app.
  FirebaseMessaging.onMessage.listen((msg) {
    final n = msg.notification;
    if (n == null) return;
    LocalNotifs.instance.show(
      title: n.title ?? '알림',
      body: n.body ?? '',
      payload: msg.data['route'] as String?,
    );
  });

  // Ask for notification permission early on iOS / Android 13+. Result is
  // surfaced via NativeBridge.registerDeviceToken when the FE asks.
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
