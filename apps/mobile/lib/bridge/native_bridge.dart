import 'dart:async';
import 'dart:convert';
import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:geolocator/geolocator.dart';
import 'package:package_info_plus/package_info_plus.dart';

import '../geofence/geofence_service.dart';
import '../notif/ntfy_client.dart';
import '../widget_channels.dart';

/// Bridges native capabilities into `window.NativeBridge` on the WebView's JS
/// side. The actual JS shim is in `bridge/inject.dart`; this class wires the
/// Dart side handlers that the shim's `callHandler(...)` calls reach.
class NativeBridge {
  NativeBridge(this._controller);

  final InAppWebViewController _controller;
  StreamSubscription<Position>? _positionSub;
  NtfyClient? _ntfyClient;

  /// Channel name forwarded to the native APNs delegate via the iOS method
  /// channel (`AppDelegate.swift`). Cached so re-registers don't re-prompt.
  String? _lastApnsToken;

  void register() {
    _controller.addJavaScriptHandler(
      handlerName: 'requestLocation',
      callback: (_) => _requestLocation(),
    );
    _controller.addJavaScriptHandler(
      handlerName: 'watchLocation',
      callback: (args) => _watchLocation(args),
    );
    _controller.addJavaScriptHandler(
      handlerName: 'stopWatching',
      callback: (_) => _stopWatching(),
    );
    _controller.addJavaScriptHandler(
      handlerName: 'registerDeviceToken',
      callback: (args) => _registerDeviceToken(args),
    );
    _controller.addJavaScriptHandler(
      handlerName: 'haptic',
      callback: (args) => _haptic(args),
    );
    _controller.addJavaScriptHandler(
      handlerName: 'share',
      // Deferred until a real flow needs it; FE may degrade gracefully.
      callback: (_) => {'error': 'NOT_IMPLEMENTED'},
    );
    _controller.addJavaScriptHandler(
      handlerName: 'appInfo',
      callback: (_) => _appInfo(),
    );
    _controller.addJavaScriptHandler(
      handlerName: 'pushTodayStatus',
      callback: (args) => _pushTodayStatus(args),
    );
    _controller.addJavaScriptHandler(
      handlerName: 'reloadWidgets',
      callback: (_) => _reloadWidgets(),
    );
    _controller.addJavaScriptHandler(
      handlerName: 'registerGeofences',
      callback: (args) => _registerGeofences(args),
    );
  }

  // --- Widget bridges ------------------------------------------------------
  Future<Map<String, dynamic>> _pushTodayStatus(List<dynamic> args) async {
    final payload = (args.isNotEmpty && args.first is Map)
        ? Map<String, dynamic>.from(args.first as Map)
        : <String, dynamic>{};
    final res = await WidgetChannels.pushTodayStatus(
      status: (payload['status'] as String?) ?? 'UNKNOWN',
      clockInAt: payload['clockInAt'] as String?,
      workedMinutes: (payload['workedMinutes'] as num?)?.toInt() ?? 0,
      annualLeaveRemaining:
          (payload['annualLeaveRemaining'] as num?)?.toDouble() ?? 0,
      weekHours: (payload['weekHours'] as num?)?.toDouble() ?? 0,
      metric: payload['metric'] as String?,
    );
    return res ?? {'ok': false, 'error': 'CHANNEL_UNAVAILABLE'};
  }

  Future<Map<String, dynamic>> _reloadWidgets() async {
    final res = await WidgetChannels.requestWidgetReload();
    return res ?? {'ok': false, 'error': 'CHANNEL_UNAVAILABLE'};
  }

  Future<Map<String, dynamic>> _registerGeofences(List<dynamic> args) async {
    final raw = (args.isNotEmpty && args.first is List) ? args.first as List : const [];
    final items = normalizeGeofencePayload(raw);
    await GeofenceServiceShim.registerAll(items);
    return {'ok': true, 'count': items.length};
  }

  void dispose() {
    _positionSub?.cancel();
    _positionSub = null;
    _ntfyClient?.dispose();
    _ntfyClient = null;
  }

  // --- Handlers ------------------------------------------------------------

  /// One-shot location request. Mirrors `apps/web/src/shared/lib/geo.ts`
  /// shape so the FE can swap implementations transparently.
  Future<Map<String, dynamic>> _requestLocation() async {
    try {
      final perm = await _ensureLocationPermission();
      if (perm != LocationPermission.always &&
          perm != LocationPermission.whileInUse) {
        return {'error': 'PERMISSION_DENIED'};
      }
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 8),
        ),
      );
      return _positionToJson(pos);
    } on TimeoutException {
      return {'error': 'TIMEOUT'};
    } on LocationServiceDisabledException {
      return {'error': 'POSITION_UNAVAILABLE'};
    } catch (e) {
      if (kDebugMode) debugPrint('[bridge] requestLocation error: $e');
      return {'error': 'POSITION_UNAVAILABLE'};
    }
  }

  Future<Map<String, dynamic>> _watchLocation(List<dynamic> args) async {
    final perm = await _ensureLocationPermission();
    if (perm != LocationPermission.always &&
        perm != LocationPermission.whileInUse) {
      return {'error': 'PERMISSION_DENIED'};
    }
    await _positionSub?.cancel();
    _positionSub = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
      ),
    ).listen((pos) => _emitLocationEvent(_positionToJson(pos)));
    return {'ok': true};
  }

  Future<Map<String, dynamic>> _stopWatching() async {
    await _positionSub?.cancel();
    _positionSub = null;
    return {'ok': true};
  }

  /// Returns `{platform, token}` or an `{error}` payload — same shape the FE
  /// already consumes via `apps/web/src/shared/lib/native.ts`.
  ///
  /// Android: ntfy is a pub/sub channel, not a per-device token system, so we
  /// synthesize a stable topic of the form
  /// ``{prefix}-membership-{membership_id}`` and open the WebSocket via
  /// :class:`NtfyClient`. The "token" forwarded to the BE is the topic name
  /// itself — the BE :mod:`apps.notification.providers.ntfy` recomputes it
  /// from ``membership.id`` so we agree on the channel without coupling.
  ///
  /// iOS: APNs is registered by the native AppDelegate
  /// (``ios/Runner/AppDelegate.swift``); we look up the cached device-token
  /// hex string via the ``wm.push.apns`` method channel.
  Future<Map<String, dynamic>> _registerDeviceToken([List<dynamic>? args]) async {
    try {
      final cfg = (args != null && args.isNotEmpty && args.first is Map)
          ? Map<String, dynamic>.from(args.first as Map)
          : <String, dynamic>{};
      if (Platform.isIOS) {
        final token = await _getApnsToken();
        if (token == null) return {'error': 'TOKEN_UNAVAILABLE'};
        return {'platform': 'IOS', 'token': token};
      }
      // Android: caller passes membershipId + ntfyBaseUrl + topicPrefix.
      final membershipId = cfg['membership_id']?.toString() ?? '';
      final base = cfg['ntfy_base_url']?.toString() ?? '';
      final prefix = cfg['ntfy_topic_prefix']?.toString() ?? 'wm-prod';
      if (membershipId.isEmpty || base.isEmpty) {
        return {'error': 'TOKEN_UNAVAILABLE'};
      }
      final topic = '$prefix-membership-$membershipId';
      _ntfyClient ??= NtfyClient(baseUrl: base);
      await _ntfyClient!.subscribe(topic);
      return {'platform': 'ANDROID', 'token': topic};
    } catch (e) {
      if (kDebugMode) debugPrint('[bridge] registerDeviceToken error: $e');
      return {'error': 'TOKEN_UNAVAILABLE'};
    }
  }

  Future<String?> _getApnsToken() async {
    if (_lastApnsToken != null) return _lastApnsToken;
    try {
      const ch = MethodChannel('wm.push.apns');
      final tok = await ch.invokeMethod<String>('getToken');
      if (tok != null && tok.isNotEmpty) _lastApnsToken = tok;
      return _lastApnsToken;
    } on MissingPluginException {
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<Map<String, dynamic>> _haptic(List<dynamic> args) async {
    final intensity =
        (args.isNotEmpty && args.first is String) ? args.first as String : 'light';
    switch (intensity) {
      case 'heavy':
        await HapticFeedback.heavyImpact();
        break;
      case 'medium':
        await HapticFeedback.mediumImpact();
        break;
      case 'light':
      default:
        await HapticFeedback.lightImpact();
    }
    return {'ok': true};
  }

  Future<Map<String, dynamic>> _appInfo() async {
    final info = await PackageInfo.fromPlatform();
    return {
      'version': info.version,
      'build': info.buildNumber,
      'platform': Platform.isIOS ? 'IOS' : 'ANDROID',
    };
  }

  // --- Helpers -------------------------------------------------------------

  Future<LocationPermission> _ensureLocationPermission() async {
    var perm = await Geolocator.checkPermission();
    if (perm == LocationPermission.denied) {
      perm = await Geolocator.requestPermission();
    }
    return perm;
  }

  Map<String, dynamic> _positionToJson(Position p) => {
        'latitude': p.latitude,
        'longitude': p.longitude,
        'accuracy_m': p.accuracy,
        'ts': p.timestamp.toUtc().toIso8601String(),
      };

  void _emitLocationEvent(Map<String, dynamic> detail) {
    final payload = jsonEncode(detail);
    _controller.evaluateJavascript(
      source: "window.dispatchEvent(new CustomEvent('wm:location', "
          '{detail: $payload}));',
    );
  }
}

/// Pure helpers exposed for unit tests so we don't need a live WebView.
@visibleForTesting
Map<String, dynamic> positionToBridgeJson(Position p) => {
      'latitude': p.latitude,
      'longitude': p.longitude,
      'accuracy_m': p.accuracy,
      'ts': p.timestamp.toUtc().toIso8601String(),
    };
