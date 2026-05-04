/// Test: mobile widget channel · MethodChannel payload contract
/// Type: Unit (Dart, flutter_test)
/// Why:  The native side (iOS WidgetKit + Android Glance) reads exact
///       keys (`status`, `clockInAt`, `workedMinutes`, `weekHours`,
///       `annualLeaveRemaining`, `metric`). Drift here silently breaks
///       widget rendering. Lock the shape with a MethodChannel mock.
/// Covers:
///   - WidgetChannels.pushTodayStatus encodes the documented keys.
///   - Optional fields (`metric`) are omitted, not sent as null.
///   - WidgetChannels.requestWidgetReload calls the right method.
///   - Both helpers swallow MissingPluginException → null.

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/widget_channels.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  final messenger = TestDefaultBinaryMessengerBinding
      .instance.defaultBinaryMessenger;

  setUp(() {
    messenger.setMockMethodCallHandler(WidgetChannels.channel, null);
  });

  test('pushTodayStatus sends documented keys', () async {
    MethodCall? captured;
    messenger.setMockMethodCallHandler(WidgetChannels.channel, (call) async {
      captured = call;
      return <String, dynamic>{'ok': true};
    });

    final result = await WidgetChannels.pushTodayStatus(
      status: 'WORKING',
      clockInAt: '2026-05-04T09:00:00Z',
      workedMinutes: 240,
      weekHours: 18.5,
      annualLeaveRemaining: 12,
      metric: 'hours',
    );

    expect(result, {'ok': true});
    expect(captured?.method, 'widget.pushTodayStatus');
    final args = Map<String, dynamic>.from(captured!.arguments as Map);
    expect(args.keys.toSet(), {
      'status',
      'clockInAt',
      'workedMinutes',
      'weekHours',
      'annualLeaveRemaining',
      'metric',
    });
    expect(args['status'], 'WORKING');
    expect(args['workedMinutes'], 240);
    expect(args['weekHours'], 18.5);
  });

  test('omits metric when not provided', () async {
    MethodCall? captured;
    messenger.setMockMethodCallHandler(WidgetChannels.channel, (call) async {
      captured = call;
      return null;
    });

    await WidgetChannels.pushTodayStatus(status: 'OFF');
    final args = Map<String, dynamic>.from(captured!.arguments as Map);
    expect(args.containsKey('metric'), isFalse);
    expect(args['status'], 'OFF');
    expect(args['clockInAt'], isNull);
    expect(args['workedMinutes'], 0);
  });

  test('requestWidgetReload uses widget.reload method', () async {
    MethodCall? captured;
    messenger.setMockMethodCallHandler(WidgetChannels.channel, (call) async {
      captured = call;
      return <String, dynamic>{'ok': true};
    });

    await WidgetChannels.requestWidgetReload();
    expect(captured?.method, 'widget.reload');
  });

  test('returns null when channel not registered', () async {
    final r = await WidgetChannels.pushTodayStatus(status: 'OFF');
    expect(r, isNull);
  });
}
