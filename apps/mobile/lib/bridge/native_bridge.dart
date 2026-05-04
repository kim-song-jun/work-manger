import 'dart:async';
import 'dart:convert';
import 'dart:io' show Platform;

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:geolocator/geolocator.dart';
import 'package:package_info_plus/package_info_plus.dart';

/// Bridges native capabilities into `window.NativeBridge` on the WebView's JS
/// side. The actual JS shim is in `bridge/inject.dart`; this class wires the
/// Dart side handlers that the shim's `callHandler(...)` calls reach.
class NativeBridge {
  NativeBridge(this._controller);

  final InAppWebViewController _controller;
  StreamSubscription<Position>? _positionSub;

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
      callback: (_) => _registerDeviceToken(),
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
  }

  void dispose() {
    _positionSub?.cancel();
    _positionSub = null;
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

  Future<Map<String, dynamic>> _registerDeviceToken() async {
    try {
      await FirebaseMessaging.instance.requestPermission();
      final token = await FirebaseMessaging.instance.getToken();
      if (token == null) return {'error': 'TOKEN_UNAVAILABLE'};
      return {
        'platform': Platform.isIOS ? 'IOS' : 'ANDROID',
        'token': token,
      };
    } catch (e) {
      if (kDebugMode) debugPrint('[bridge] registerDeviceToken error: $e');
      return {'error': 'TOKEN_UNAVAILABLE'};
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
