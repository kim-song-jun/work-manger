/// Test: mobile geofence · payload normalisation
/// Type: Unit (Dart, flutter_test)
/// Why:  The FE pushes raw JSON from `/v1/onboarding/locations` straight
///       through `window.NativeBridge.registerGeofences(...)`. The Dart
///       side must coerce types (id strings, lat/lon decimal precision,
///       integer radius, drop bad rows) so the native geofence engine
///       gets a stable shape.
/// Covers:
///   - id coerced to String even if backend sent number
///   - lat/lon clamped to 6dp
///   - radius_m clamped to [50, 5000] and rounded
///   - rows missing id are dropped silently

import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/geofence/geofence_service.dart';

void main() {
  test('normalizes id, decimal precision, and radius bounds', () {
    final out = normalizeGeofencePayload([
      {
        'id': 42,
        'lat': 37.49791234567,
        'lon': 127.0276,
        'radius_m': 17,           // below floor → 50
        'label': '본사',
      },
      {
        'id': 'wfh-1',
        'lat': 37.000000,
        'lon': 127.000000,
        'radius_m': 9999,         // above ceiling → 5000
        'label': '재택',
      },
    ]);

    expect(out, hasLength(2));
    expect(out[0].id, '42');
    expect(out[0].lat, 37.497912);
    expect(out[0].lon, 127.0276);
    expect(out[0].radiusM, 50);
    expect(out[0].label, '본사');

    expect(out[1].id, 'wfh-1');
    expect(out[1].radiusM, 5000);
  });

  test('drops rows with missing id', () {
    final out = normalizeGeofencePayload([
      {'lat': 0, 'lon': 0, 'radius_m': 100},      // no id
      {'id': 'ok', 'lat': 0, 'lon': 0, 'radius_m': 100},
    ]);
    expect(out.map((g) => g.id), ['ok']);
  });

  test('survives non-numeric lat/lon by treating as 0', () {
    final out = normalizeGeofencePayload([
      {'id': 'x', 'lat': null, 'lon': null, 'radius_m': 100},
    ]);
    expect(out.single.lat, 0);
    expect(out.single.lon, 0);
  });

  test('toJson keys match native expectation', () {
    final out = normalizeGeofencePayload([
      {'id': 'a', 'lat': 1.0, 'lon': 2.0, 'radius_m': 100, 'label': 'L'},
    ]);
    expect(out.single.toJson().keys.toSet(),
        {'id', 'lat', 'lon', 'radius_m', 'label'});
  });
}
