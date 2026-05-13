import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/admin_dashboard/admin_dashboard_screen.dart';
import 'package:work_manager_mobile/screens/admin_dashboard/state/admin_dashboard_controller.dart';

Dio _stub(Map<String, dynamic> data) {
  final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (o, h) {
        h.resolve(
          Response(data: data, requestOptions: o, statusCode: 200),
        );
      },
    ),
  );
  return dio;
}

void main() {
  testWidgets('AdminDashboardScreen renders 4 KPI labels', (tester) async {
    final c = AdminDashboardController(
      dio: _stub({
        'employee_count': 42,
        'today_attendance': 38,
        'pending_approvals': 5,
        'compliance_warnings': 2,
      }),
    );
    await tester.pumpWidget(MaterialApp(home: AdminDashboardScreen(controller: c)));
    await tester.pumpAndSettle();
    expect(find.text('전체 직원'), findsOneWidget);
    expect(find.text('오늘 출근'), findsOneWidget);
    expect(find.text('대기 결재'), findsOneWidget);
    expect(find.text('52h 초과'), findsOneWidget);
  });
}
