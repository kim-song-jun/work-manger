import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/realtime/ws_client.dart';
import 'package:work_manager_mobile/screens/home/state/home_controller.dart';
import 'package:work_manager_mobile/screens/home/wm_home_screen.dart';

/// Stub Dio: interceptor short-circuits every GET with a canned payload.
Dio _stubDio(Map<String, dynamic> payload) {
  final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) {
        handler.resolve(
          Response<Map<String, dynamic>>(
            data: payload,
            requestOptions: options,
            statusCode: 200,
          ),
        );
      },
    ),
  );
  return dio;
}

void main() {
  testWidgets('WMHomeScreen renders hero in OFF state with no data',
      (tester) async {
    final dio = _stubDio({
      'data': {
        'status': 'OFF',
        'today_minutes': 0,
        'week_minutes': 0,
        'overtime_minutes': 0,
        'team_count': {'office': 0, 'wfh': 0, 'leave': 0, 'break': 0},
        'avatars': <String>[],
      },
    });

    // WsClient constructed with stub URL — connect() is never called, so the
    // reconnect loop never fires. events stream stays empty (broadcast, OK).
    final ws = WsClient(
      baseWsUrl: 'ws://stub',
      accessTokenProvider: () async => null,
    );

    final controller = HomeController(dio: dio, wsClient: ws);

    await tester.pumpWidget(
      MaterialApp(
        home: WMHomeScreen(
          controller: controller,
          onClockIn: () {},
          onOpenWebView: (_) {},
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('출근 전'), findsOneWidget);
    expect(find.text('출근'), findsOneWidget);

    controller.dispose();
    ws.dispose();
  });

  testWidgets('WMHomeScreen renders hero in WORKING state', (tester) async {
    final dio = _stubDio({
      'data': {
        'status': 'WORKING',
        'today_minutes': 240,
        'week_minutes': 1200,
        'overtime_minutes': 0,
        'team_count': {'office': 3, 'wfh': 2, 'leave': 0, 'break': 1},
        'avatars': <String>[],
      },
    });

    final ws = WsClient(
      baseWsUrl: 'ws://stub',
      accessTokenProvider: () async => null,
    );

    final controller = HomeController(dio: dio, wsClient: ws);

    await tester.pumpWidget(
      MaterialApp(
        home: WMHomeScreen(
          controller: controller,
          onClockIn: () {},
          onOpenWebView: (_) {},
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('근무 중'), findsOneWidget);
    // "4h 00m" appears in both the hero (large) and the KPI tile for 오늘
    expect(find.text('4h 00m'), findsWidgets);
    // HomeTeamCount shows "3명 출근" for office count 3
    expect(find.textContaining('출근'), findsWidgets);

    controller.dispose();
    ws.dispose();
  });
}
