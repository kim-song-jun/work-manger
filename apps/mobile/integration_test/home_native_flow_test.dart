/// Spec: home native flow — boot renders home state, clock-in updates optimistically
/// Type: Integration (flutter_test integration harness, host runner)
/// Why:  Validates the full HomeController → WMHomeScreen data path and the
///       optimistic clock-in update without requiring a real device/emulator.
/// Coverage:
///   - Boot with WORKING state → correct status label rendered
///   - Boot with OFF state → tap 출근 → optimistic status flip to 근무 중

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import 'package:work_manager_mobile/realtime/ws_client.dart';
import 'package:work_manager_mobile/screens/home/state/home_controller.dart';
import 'package:work_manager_mobile/screens/home/wm_home_screen.dart';
import 'package:work_manager_mobile/theme/wm_theme.dart';

Dio _stubDio({required Map<String, dynamic> dashboard}) {
  final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
  dio.interceptors.add(InterceptorsWrapper(onRequest: (options, handler) {
    if (options.path.contains('/me/dashboard')) {
      handler.resolve(
        Response(data: dashboard, requestOptions: options, statusCode: 200),
      );
    } else if (options.path.contains('/attendance/clock-in')) {
      handler.resolve(
        Response(
          data: {'data': <String, dynamic>{'ok': true}},
          requestOptions: options,
          statusCode: 200,
        ),
      );
    } else {
      handler.next(options);
    }
  }));
  return dio;
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('boot → home render with WORKING state', (tester) async {
    final dio = _stubDio(dashboard: {
      'data': <String, dynamic>{
        'status': 'WORKING',
        'today_minutes': 240,
        'week_minutes': 1200,
        'overtime_minutes': 0,
        'team_count': <String, dynamic>{'office': 3, 'wfh': 1, 'leave': 0, 'break': 0},
        'avatars': <String>[],
      }
    });
    final controller = HomeController(
      dio: dio,
      wsClient: WsClient(
        baseWsUrl: 'ws://stub',
        accessTokenProvider: () async => null,
      ),
    );

    await tester.pumpWidget(MaterialApp(
      theme: WMTheme.light(),
      home: WMHomeScreen(
        controller: controller,
        onClockIn: () {},
        onOpenWebView: (_) {},
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text('근무 중'), findsOneWidget);
    expect(find.text('4h 00m'), findsWidgets);
  });

  testWidgets('clock-in flow optimistically updates status', (tester) async {
    final dio = _stubDio(dashboard: {
      'data': <String, dynamic>{
        'status': 'OFF',
        'today_minutes': 0,
        'week_minutes': 0,
        'overtime_minutes': 0,
        'team_count': <String, dynamic>{},
        'avatars': <String>[],
      }
    });
    final controller = HomeController(
      dio: dio,
      wsClient: WsClient(
        baseWsUrl: 'ws://stub',
        accessTokenProvider: () async => null,
      ),
    );

    await tester.pumpWidget(MaterialApp(
      theme: WMTheme.light(),
      home: WMHomeScreen(
        controller: controller,
        onClockIn: controller.clockIn,
        onOpenWebView: (_) {},
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text('출근 전'), findsOneWidget);

    await tester.tap(find.text('출근'));
    await tester.pump(); // optimistic update tick

    expect(find.text('근무 중'), findsOneWidget);
  });
}
