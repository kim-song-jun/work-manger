import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/admin_expiring_leave/admin_expiring_leave_screen.dart';
import 'package:work_manager_mobile/screens/admin_expiring_leave/state/admin_expiring_leave_controller.dart';

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
  testWidgets('AdminExpiringLeaveScreen renders 2 items', (tester) async {
    final c = AdminExpiringLeaveController(
      dio: _stub([
        {
          'employee_name': '김민수',
          'leave_type': '연차',
          'days_left': 5,
        },
        {
          'employee_name': '이지은',
          'leave_type': '반차',
          'days_left': 12,
        },
      ]),
    );
    await tester.pumpWidget(
      MaterialApp(home: AdminExpiringLeaveScreen(controller: c)),
    );
    await tester.pumpAndSettle();
    expect(find.text('김민수'), findsOneWidget);
    expect(find.text('이지은'), findsOneWidget);
  });
}
