/// Test: mobile bridge · request/response payload encoding
/// Type: Unit (Dart, flutter_test)
/// Why:  The FE relies on a stable shape from `NativeBridge.requestLocation`
///       (mirrors `apps/web/src/shared/lib/geo.ts::GeoFix`). Drift here breaks
///       clock-in silently because the React side reads `accuracy_m` numerically.
/// Covers:
///   - positionToBridgeJson() — shape + key set + UTC timestamp formatting
///   - LocalNotifs constants — channel id stays in sync with AndroidManifest
/// Out of scope:
///   - Live Geolocator stream (integration test territory)
///   - APNs / ntfy token retrieval (covered by ntfy_client_test.dart and
///     by the iOS native AppDelegate handlers — out of Dart unit scope)
/// Coverage target: shape regression only — ensures future refactors keep the
/// public bridge contract.

import 'package:flutter_test/flutter_test.dart';
import 'package:geolocator_platform_interface/geolocator_platform_interface.dart';

import 'package:work_manager_mobile/bridge/native_bridge.dart';
import 'package:work_manager_mobile/notif/local_notifs.dart';

void main() {
  group('positionToBridgeJson', () {
    test('returns latitude/longitude/accuracy_m/ts with stable keys', () {
      // Why: FE consumes these exact keys; renames must be intentional.
      final ts = DateTime.utc(2026, 5, 4, 12, 34, 56);
      final pos = Position(
        latitude: 37.4979,
        longitude: 127.0276,
        timestamp: ts,
        accuracy: 12.5,
        altitude: 0,
        altitudeAccuracy: 0,
        heading: 0,
        headingAccuracy: 0,
        speed: 0,
        speedAccuracy: 0,
      );

      final json = positionToBridgeJson(pos);

      expect(json.keys.toSet(),
          {'latitude', 'longitude', 'accuracy_m', 'ts'});
      expect(json['latitude'], 37.4979);
      expect(json['longitude'], 127.0276);
      expect(json['accuracy_m'], 12.5);
      expect(json['ts'], '2026-05-04T12:34:56.000Z');
    });

    test('coerces non-UTC timestamps to UTC ISO-8601', () {
      // Why: Backend stores everything in UTC; we must not leak local offsets.
      final local = DateTime(2026, 5, 4, 21, 0, 0); // device-local
      final pos = Position(
        latitude: 0,
        longitude: 0,
        timestamp: local,
        accuracy: 1,
        altitude: 0,
        altitudeAccuracy: 0,
        heading: 0,
        headingAccuracy: 0,
        speed: 0,
        speedAccuracy: 0,
      );

      final json = positionToBridgeJson(pos);

      expect(json['ts'], endsWith('Z'));
    });
  });

  group('LocalNotifs', () {
    test('exposes the channel id referenced by AndroidManifest', () {
      // Why: AndroidManifest sets default_notification_channel_id="wm-default".
      // Drift between Dart + manifest silently breaks foreground push banners.
      expect(LocalNotifs.channelId, 'wm-default');
    });
  });
}
