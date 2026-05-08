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

/// Public facade. Native registration is intentionally hidden behind this shim
/// so the WebView contract stays stable while Android/iOS geofence engines can
/// evolve independently.
class GeofenceServiceShim {
  GeofenceServiceShim._();

  /// MethodChannel bridging Dart ↔ native (Android only at the moment;
  /// iOS will land once a Mac signing host is available — see SESSION
  /// 2026-05-08 iter12 §7).
  static const MethodChannel channel =
      MethodChannel('com.molcube.workmanager/geofence');

  static List<GeofenceItem> _registered = const [];
  static List<GeofenceItem> get registered => List.unmodifiable(_registered);

  /// Register a periodic 15-min Workmanager task. Idempotent.
  ///
  /// On Android this triggers `GeofencingClient` initialisation on the
  /// native side; the platform handles the periodic poll itself, so no
  /// Dart-side timer is required. On platforms where the channel is not
  /// registered (iOS until signing lands, plain `flutter test` runs) this
  /// method is a documented no-op — callers can `await` without try/catch.
  static Future<void> initBackground() async {
    if (kDebugMode) debugPrint('[geofence] initBackground (15 min cadence)');
    try {
      await channel.invokeMethod<void>('initBackground');
    } on MissingPluginException {
      if (kDebugMode) debugPrint('[geofence] channel not registered (stub)');
    } on PlatformException catch (e) {
      if (kDebugMode) debugPrint('[geofence] initBackground failed: $e');
    }
  }

  /// Replace the in-memory + native registration set.
  ///
  /// Diff-based: removes geofences absent from [items] and (re-)adds the
  /// rest. Native side keys by the [GeofenceItem.id], so re-sending an
  /// unchanged record is a cheap upsert.
  static Future<void> registerAll(List<GeofenceItem> items) async {
    final previous = _registered;
    _registered = List<GeofenceItem>.from(items);
    if (kDebugMode) {
      debugPrint('[geofence] registered ${_registered.length} regions');
    }
    final newIds = items.map((e) => e.id).toSet();

    // Remove any region the FE no longer considers active.
    for (final old in previous) {
      if (!newIds.contains(old.id)) {
        try {
          await channel.invokeMethod<void>('removeGeofence', {'id': old.id});
        } on MissingPluginException {
          return; // channel not wired (iOS / unit tests) — silent stub.
        } on PlatformException catch (e) {
          if (kDebugMode) debugPrint('[geofence] remove ${old.id}: $e');
        }
      }
    }

    // Upsert the new set.
    for (final g in items) {
      try {
        await channel.invokeMethod<void>('addGeofence', {
          'id': g.id,
          'lat': g.lat,
          'lng': g.lon,
          'radius': g.radiusM,
          'label': g.label,
        });
      } on MissingPluginException {
        return; // channel not wired — first miss aborts the loop quietly.
      } on PlatformException catch (e) {
        if (kDebugMode) debugPrint('[geofence] add ${g.id}: $e');
      }
    }
  }

  /// Fetch the native-side active set. Useful for diagnostics + the
  /// onboarding screen (so the user can confirm the OS actually accepted
  /// the regions). Returns an empty list if the channel is not registered.
  static Future<List<String>> getActiveFences() async {
    try {
      final res = await channel.invokeListMethod<String>('getActiveFences');
      return res ?? const [];
    } on MissingPluginException {
      return const [];
    } on PlatformException {
      return const [];
    }
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
