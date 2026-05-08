/// Test: mobile geofence · MethodChannel binding (iter13 T5)
/// Type: Unit (Dart, flutter_test)
/// Why:  After T5, `GeofenceServiceShim.registerAll` is no longer a no-op
///       — it forwards each region to the Android `GeofencingClient` via
///       the `com.molcube.workmanager/geofence` channel. Lock the wire
///       contract here so accidental key renames break tests, not the
///       APK.
/// Covers:
///   - registerAll() emits one `addGeofence` call per item with the
///     documented argument keys (`id`, `lat`, `lng`, `radius`, `label`).
///   - registerAll() emits a `removeGeofence` for any region dropped
///     since the previous call (diff-based upsert).
///   - initBackground() invokes `initBackground` exactly once per call.
///   - getActiveFences() returns the native list, or empty when the
///     channel is missing.
///   - All public methods swallow MissingPluginException so unit tests
///     and iOS (no native handler yet) can exercise the API safely.

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/geofence/geofence_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  final messenger = TestDefaultBinaryMessengerBinding
      .instance.defaultBinaryMessenger;
  const channel = GeofenceServiceShim.channel;

  setUp(() {
    messenger.setMockMethodCallHandler(channel, null);
    // Reset the in-memory registration state between tests by sending an
    // empty list through the public API while a no-op handler is wired
    // up. This keeps the diff logic deterministic.
    messenger.setMockMethodCallHandler(channel, (_) async => null);
  });

  tearDown(() async {
    // Drain any state with an empty registerAll under a noop handler.
    await GeofenceServiceShim.registerAll(const []);
    messenger.setMockMethodCallHandler(channel, null);
  });

  test('registerAll forwards each item with documented keys', () async {
    final calls = <MethodCall>[];
    messenger.setMockMethodCallHandler(channel, (call) async {
      calls.add(call);
      return null;
    });

    final items = normalizeGeofencePayload([
      {'id': 'hq', 'lat': 37.5, 'lon': 127.0, 'radius_m': 100, 'label': '본사'},
      {'id': 'wfh', 'lat': 37.4, 'lon': 127.1, 'radius_m': 200, 'label': '재택'},
    ]);
    await GeofenceServiceShim.registerAll(items);

    expect(calls.where((c) => c.method == 'addGeofence'), hasLength(2));
    final first = calls.firstWhere((c) => c.method == 'addGeofence');
    final args = Map<String, dynamic>.from(first.arguments as Map);
    expect(args.keys.toSet(), {'id', 'lat', 'lng', 'radius', 'label'});
    expect(args['id'], 'hq');
    expect(args['lat'], 37.5);
    expect(args['lng'], 127.0);
    expect(args['radius'], 100);
    expect(args['label'], '본사');
    expect(GeofenceServiceShim.registered, hasLength(2));
  });

  test('registerAll diffs against previous set and removes missing ids',
      () async {
    final calls = <MethodCall>[];
    messenger.setMockMethodCallHandler(channel, (call) async {
      calls.add(call);
      return null;
    });

    final initial = normalizeGeofencePayload([
      {'id': 'a', 'lat': 1.0, 'lon': 2.0, 'radius_m': 100},
      {'id': 'b', 'lat': 3.0, 'lon': 4.0, 'radius_m': 100},
    ]);
    await GeofenceServiceShim.registerAll(initial);

    calls.clear();
    final next = normalizeGeofencePayload([
      {'id': 'b', 'lat': 3.0, 'lon': 4.0, 'radius_m': 150},
      {'id': 'c', 'lat': 5.0, 'lon': 6.0, 'radius_m': 100},
    ]);
    await GeofenceServiceShim.registerAll(next);

    final removes = calls.where((c) => c.method == 'removeGeofence').toList();
    final adds = calls.where((c) => c.method == 'addGeofence').toList();
    expect(removes, hasLength(1));
    expect(
      Map<String, dynamic>.from(removes.single.arguments as Map)['id'],
      'a',
    );
    // Both 'b' (radius changed) and 'c' (new) are re-added.
    expect(adds, hasLength(2));
    expect(
      adds.map((c) => Map<String, dynamic>.from(c.arguments as Map)['id']),
      ['b', 'c'],
    );
  });

  test('initBackground invokes initBackground exactly once', () async {
    final calls = <MethodCall>[];
    messenger.setMockMethodCallHandler(channel, (call) async {
      calls.add(call);
      return null;
    });

    await GeofenceServiceShim.initBackground();
    expect(calls.map((c) => c.method), ['initBackground']);
  });

  test('getActiveFences returns native list when handler is registered',
      () async {
    messenger.setMockMethodCallHandler(channel, (call) async {
      if (call.method == 'getActiveFences') return ['hq', 'wfh'];
      return null;
    });
    final ids = await GeofenceServiceShim.getActiveFences();
    expect(ids, ['hq', 'wfh']);
  });

  test('getActiveFences returns empty when channel not wired', () async {
    messenger.setMockMethodCallHandler(channel, null);
    final ids = await GeofenceServiceShim.getActiveFences();
    expect(ids, isEmpty);
  });

  test('registerAll swallows MissingPluginException without throwing',
      () async {
    messenger.setMockMethodCallHandler(channel, null);
    final items = normalizeGeofencePayload([
      {'id': 'a', 'lat': 0.0, 'lon': 0.0, 'radius_m': 100},
    ]);
    await expectLater(GeofenceServiceShim.registerAll(items), completes);
    // Even when the channel is silent, the in-memory mirror is updated so
    // the FE can still reason about which regions it asked for.
    expect(GeofenceServiceShim.registered.map((g) => g.id), ['a']);
  });

  test('registerAll swallows PlatformException and continues', () async {
    final calls = <MethodCall>[];
    messenger.setMockMethodCallHandler(channel, (call) async {
      calls.add(call);
      throw PlatformException(code: 'ADD_FAILED', message: 'mock failure');
    });

    final items = normalizeGeofencePayload([
      {'id': 'a', 'lat': 0.0, 'lon': 0.0, 'radius_m': 100},
      {'id': 'b', 'lat': 1.0, 'lon': 1.0, 'radius_m': 100},
    ]);
    await expectLater(GeofenceServiceShim.registerAll(items), completes);
    // Both adds are attempted despite per-call failures.
    expect(calls.where((c) => c.method == 'addGeofence'), hasLength(2));
  });
}
