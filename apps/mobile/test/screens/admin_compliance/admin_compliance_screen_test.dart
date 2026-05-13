import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/admin_compliance/admin_compliance_screen.dart';
import 'package:work_manager_mobile/screens/admin_compliance/state/admin_compliance_controller.dart';

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
  testWidgets('AdminComplianceScreen renders 2 items', (tester) async {
    final c = AdminComplianceController(
      dio: _stub([
        {'employee_name': '김민수', 'used_minutes': 2460},
        {'employee_name': '이지은', 'used_minutes': 1800},
      ]),
    );
    await tester.pumpWidget(
      MaterialApp(home: AdminComplianceScreen(controller: c)),
    );
    await tester.pumpAndSettle();
    expect(find.text('김민수'), findsOneWidget);
    expect(find.text('이지은'), findsOneWidget);
  });
}
