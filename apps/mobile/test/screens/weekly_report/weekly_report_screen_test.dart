import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/weekly_report/state/weekly_report_controller.dart';
import 'package:work_manager_mobile/screens/weekly_report/weekly_report_screen.dart';

/// Stub Dio: resolves every GET with a canned payload.
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
  testWidgets('WeeklyReportScreen renders 7 bars and total minutes',
      (tester) async {
    final dio = _stubDio({
      'data': {
        'week_start': '2026-05-11',
        'week_end': '2026-05-17',
        'regular_minutes': 2400,
        'overtime_minutes': 60,
        'break_minutes': 300,
        'days_worked': 5,
        'daily_minutes': [480, 480, 480, 480, 480, 0, 0],
        'total_minutes': 2460,
      },
    });

    final controller = WeeklyReportController(dio: dio);

    await tester.pumpWidget(
      MaterialApp(
        home: WeeklyReportScreen(controller: controller),
      ),
    );
    // Allow async load to complete
    await tester.pumpAndSettle();

    // 7 bars rendered via ValueKey('bar_0') .. ('bar_6')
    for (var i = 0; i < 7; i++) {
      expect(find.byKey(ValueKey('bar_$i')), findsOneWidget);
    }

    // Total shown
    expect(find.text('이번 주 총 근무시간'), findsOneWidget);
    // 2460 min = 41h 00m
    expect(find.text('41h 00m'), findsOneWidget);

    controller.dispose();
  });
}
