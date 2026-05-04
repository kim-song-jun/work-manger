import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

import '../notif/local_notifs.dart';

/// Geofence definition pushed by the FE after `/v1/onboarding/locations`.
@immutable
class GeofenceItem {
  const GeofenceItem({
    required this.id,
    required this.lat,
    required this.lon,
    required this.radiusM,
    required this.label,
  });

  final String id;
  final double lat;     // 6dp precision
  final double lon;
  final int radiusM;    // meters, integer
  final String label;

  Map<String, dynamic> toJson() => {
        'id': id,
        'lat': lat,
        'lon': lon,
        'radius_m': radiusM,
        'label': label,
      };
}

/// Normalises raw JS payloads into a stable Dart shape:
///   - id coerced to String
///   - lat/lon clamped to 6 decimal places
///   - radius_m rounded to int (>= 50, <= 5000)
@visibleForTesting
List<GeofenceItem> normalizeGeofencePayload(List<dynamic> raw) {
  return raw.whereType<Map>().map((m) {
    final lat = (m['lat'] as num?)?.toDouble() ?? 0;
    final lon = (m['lon'] as num?)?.toDouble() ?? 0;
    final r = (m['radius_m'] as num?)?.toDouble() ?? 100;
    return GeofenceItem(
      id: m['id']?.toString() ?? '',
      lat: double.parse(lat.toStringAsFixed(6)),
      lon: double.parse(lon.toStringAsFixed(6)),
      radiusM: r.clamp(50, 5000).round(),
      label: (m['label'] as String?) ?? '',
    );
  }).where((g) => g.id.isNotEmpty).toList(growable: false);
}

/// Public façade. Real registration is delegated to `flutter_workmanager`
/// + `geofence_service` (or `native_geofence`) when `initBackground()` runs.
class GeofenceServiceShim {
  GeofenceServiceShim._();

  static List<GeofenceItem> _registered = const [];
  static List<GeofenceItem> get registered => List.unmodifiable(_registered);

  /// Register a periodic 15-min Workmanager task. Idempotent.
  /// Implementation note: the actual `Workmanager().registerPeriodicTask`
  /// call lives behind a thin wrapper so unit tests can swap it.
  static Future<void> initBackground() async {
    if (kDebugMode) debugPrint('[geofence] initBackground (15 min cadence)');
    // TODO(native): call into flutter_workmanager once it's added to
    // pubspec.yaml. Kept as a stub so unit tests can run without the
    // platform plugin.
  }

  /// Replace the in-memory + native registration set.
  static Future<void> registerAll(List<GeofenceItem> items) async {
    _registered = List<GeofenceItem>.from(items);
    if (kDebugMode) {
      debugPrint('[geofence] registered ${_registered.length} regions');
    }
    // TODO(native): forward to geofence_service / native_geofence here.
  }
}

/// Top-level Workmanager dispatcher. Must be a top-level function and
/// annotated `@pragma('vm:entry-point')` so the AOT compiler keeps it.
///
/// Triggered by the OS when the device enters/exits a registered region.
/// Emits a `wm:geofence:enter` event into the WebView (the WebShell
/// re-injects an event listener on every navigation) and surfaces a
/// local notification so the user sees something even if the SPA isn't
/// in the foreground.
@pragma('vm:entry-point')
Future<bool> geofenceCallbackDispatcher() async {
  try {
    await LocalNotifs.instance.initialize();
    // The plugin passes the matched region id; in the stub we just emit
    // a generic event so the FE can decide what to do.
    final payload = jsonEncode({
      'event': 'enter',
      'ts': DateTime.now().toUtc().toIso8601String(),
    });
    await LocalNotifs.instance.show(
      title: '근무 위치 진입',
      body: '자동 출근 확인이 필요한지 앱에서 확인해주세요.',
      payload: payload,
    );
    return true;
  } catch (e) {
    if (kDebugMode) debugPrint('[geofence] dispatcher error: $e');
    return false;
  }
}
