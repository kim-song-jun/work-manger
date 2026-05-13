/// Spec: home native flow — boot renders home state, clock-in updates optimistically
/// Type: Widget-level integration test (flutter_test — no device required)
/// Why:  Validates the full HomeController → WMHomeScreen data path and the
///       optimistic clock-in update.  Placed under test/ so flutter test runs
///       host-side without a connected device (Plan-D fallback per spec §4.3).
/// Coverage:
///   - Boot with WORKING state → correct status label rendered
///   - Boot with OFF state → tap 출근 → optimistic status flip to 근무 중

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

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
    // Track stubbed state so second GET /me/dashboard returns WORKING
    var clockedIn = false;
    final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
    dio.interceptors.add(InterceptorsWrapper(onRequest: (options, handler) {
      if (options.path.contains('/me/dashboard')) {
        handler.resolve(Response(
          data: {
            'data': <String, dynamic>{
              'status': clockedIn ? 'WORKING' : 'OFF',
              'today_minutes': 0,
              'week_minutes': 0,
              'overtime_minutes': 0,
              'team_count': <String, dynamic>{},
              'avatars': <String>[],
            }
          },
          requestOptions: options,
          statusCode: 200,
        ));
      } else if (options.path.contains('/attendance/clock-in')) {
        clockedIn = true;
        handler.resolve(Response(
          data: {'data': <String, dynamic>{'ok': true}},
          requestOptions: options,
          statusCode: 200,
        ));
      } else {
        handler.next(options);
      }
    }));

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
    // One pump after tap captures the optimistic update (synchronous state flip)
    await tester.pump();
    expect(find.text('근무 중'), findsOneWidget);

    // Drain pending async chain (POST clock-in → GET dashboard reconcile)
    await tester.pumpAndSettle();
    expect(find.text('근무 중'), findsOneWidget);

    controller.dispose();
  });
}
