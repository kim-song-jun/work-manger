import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/admin_reports/admin_reports_screen.dart';
import 'package:work_manager_mobile/screens/admin_reports/state/admin_reports_controller.dart';

Dio _stub(List<Map<String, dynamic>> items) {
  final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (o, h) {
        h.resolve(
          Response(
            data: {'data': items},
            requestOptions: o,
            statusCode: 200,
          ),
        );
      },
    ),
  );
  return dio;
}

void main() {
  testWidgets('AdminReportsScreen renders 2 items', (tester) async {
    final c = AdminReportsController(
      dio: _stub([
        {'name': '월별 근무 리포트', 'period': '2026-04'},
        {'name': '주별 초과 근무', 'period': '2026-W18'},
      ]),
    );
    await tester.pumpWidget(
      MaterialApp(home: AdminReportsScreen(controller: c)),
    );
    await tester.pumpAndSettle();
    expect(find.text('월별 근무 리포트'), findsOneWidget);
    expect(find.text('주별 초과 근무'), findsOneWidget);
  });
}
