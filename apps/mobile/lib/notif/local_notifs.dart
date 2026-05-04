import 'dart:io' show Platform;

import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Singleton wrapper for `flutter_local_notifications`. Surfaces foreground
/// push messages from the ntfy WebSocket (Android) and the APNs delegate
/// (iOS) as system banners. Android requires a registered channel; we keep
/// `wm-default` for backwards compatibility with the previous FCM channel id.
class LocalNotifs {
  LocalNotifs._();
  static final LocalNotifs instance = LocalNotifs._();

  final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  static const String channelId = 'wm-default';
  static const String channelName = '근무 관리 알림';
  static const String channelDescription = '근무 관리 앱의 일반 알림 채널';

  bool _initialized = false;

  Future<void> initialize() async {
    if (_initialized) return;
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosInit = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );
    await _plugin.initialize(
      const InitializationSettings(android: androidInit, iOS: iosInit),
      // Tap → fall back to the WebView (the SPA owns routing).
      onDidReceiveNotificationResponse: (_) {
        // No-op: the WebShell is already the home; tap brings the app
        // forward. Future: forward `payload` (route) into the SPA via a
        // NativeBridge event.
      },
    );

    if (Platform.isAndroid) {
      final android = _plugin.resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>();
      await android?.createNotificationChannel(const AndroidNotificationChannel(
        channelId,
        channelName,
        description: channelDescription,
        importance: Importance.high,
      ));
    }
    _initialized = true;
  }

  Future<void> show({
    required String title,
    required String body,
    String? payload,
  }) async {
    await _plugin.show(
      DateTime.now().millisecondsSinceEpoch.remainder(1 << 31),
      title,
      body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          channelId,
          channelName,
          channelDescription: channelDescription,
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(),
      ),
      payload: payload,
    );
  }
}
