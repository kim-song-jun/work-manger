import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

import 'api/dio_client.dart';
import 'api/jwt_store.dart';
import 'app.dart';
import 'notif/local_notifs.dart';
import 'observability/sentry.dart';
import 'realtime/ws_client.dart';
import 'screens/home/state/home_controller.dart';
import 'screens/home/wm_home_screen.dart';
import 'theme/wm_theme.dart';

/// Mobile shell entry point.
///
/// Push transports (no Firebase — see ADR-006):
/// - Android: ntfy WebSocket (`apps/mobile/lib/notif/ntfy_client.dart`),
///   subscribed lazily by the JS bridge once we know the membership id.
/// - iOS: APNs registered via the standard `UIApplication` delegate
///   (`apps/mobile/ios/Runner/AppDelegate.swift`), token forwarded to the
///   SPA through `NativeBridge.registerDeviceToken`.
/// - Foreground display on both platforms uses `flutter_local_notifications`.
///
/// Settings branch (Plan-C):
/// On boot, GET /v1/me/settings → use_native_home decides whether to render
/// WMHomeScreen (Flutter native) or the existing WebView shell. If no JWT or
/// request fails, falls back to WebView (login flow stays in WebView).
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await LocalNotifs.instance.initialize();
  unawaited(_requestNotifPermission());
  await initSentry(() async {
    runApp(const _Boot());
  });
}

Future<void> _requestNotifPermission() async {
  try {
    await Permission.notification.request();
  } catch (_) {
    /* ignore — older Android versions don't expose POST_NOTIFICATIONS */
  }
}

/// Boot widget that resolves the settings branch before rendering.
///
/// Shows a loading spinner while GET /v1/me/settings is in-flight, then
/// routes to either WMHomeScreen (use_native_home == true) or the existing
/// WebView shell (use_native_home == false or error / unauthenticated).
class _Boot extends StatefulWidget {
  const _Boot();

  @override
  State<_Boot> createState() => _BootState();
}

class _BootState extends State<_Boot> {
  bool? _useNativeHome;
  Dio? _dio;
  WsClient? _ws;

  @override
  void initState() {
    super.initState();
    _resolve();
  }

  Future<void> _resolve() async {
    // API base URL re-uses WEBVIEW_URL convention (same origin for PoC).
    // Production may separate SPA origin from API origin; see dio_client.dart.
    const baseUrl = String.fromEnvironment(
      'WEBVIEW_URL',
      defaultValue: 'http://localhost:4455',
    );

    // If user is not logged in yet, skip the settings call and go straight to
    // WebView (login flow stays in WebView — see ADR-001).
    final access = await JwtStore().readAccess();
    if (access == null) {
      if (mounted) setState(() => _useNativeHome = false);
      return;
    }

    _dio = await createWMDio(baseUrl: baseUrl);
    try {
      final r = await _dio!.get<Map<String, dynamic>>('/v1/me/settings');
      _useNativeHome = (r.data?['data']?['use_native_home'] as bool?) ?? false;
    } catch (_) {
      // Network error, 401, 5xx → fall back to WebView
      _useNativeHome = false;
    }

    if (_useNativeHome == true) {
      _ws = WsClient(
        baseWsUrl: baseUrl.replaceFirst('http', 'ws'),
        accessTokenProvider: () => JwtStore().readAccess(),
      );
      unawaited(_ws!.connect());
    }

    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    // Still resolving: show a themed loading screen
    if (_useNativeHome == null) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: WMTheme.light(),
        home: const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        ),
      );
    }

    // Native home branch
    if (_useNativeHome!) {
      final controller = HomeController(dio: _dio!, wsClient: _ws!);
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: WMTheme.light(),
        home: WMHomeScreen(
          controller: controller,
          // PoC: clock-in wired in Plan-D
          onClockIn: () {
            // TODO Plan-D: POST /v1/attendance/clock-in
            debugPrint('[main] onClockIn — wired in Plan-D');
          },
          // PoC: WebView navigation wired in Plan-D
          onOpenWebView: (path) {
            // TODO Plan-D: push WebView route for $path
            debugPrint('[main] onOpenWebView($path) — wired in Plan-D');
          },
        ),
      );
    }

    // Fallback: existing WebView shell (preserves all login + WebView flows)
    return const WorkManagerApp();
  }
}
