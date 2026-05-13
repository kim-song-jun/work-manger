import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/admin_codes/admin_codes_screen.dart';
import 'package:work_manager_mobile/screens/admin_codes/state/admin_codes_controller.dart';

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
  testWidgets('AdminCodesScreen renders 2 items', (tester) async {
    final c = AdminCodesController(
      dio: _stub([
        {
          'code': 'MOLCUBE-2026-A',
          'status': 'ACTIVE',
          'expires_at': '2026-12-31',
        },
        {
          'code': 'MOLCUBE-2025-X',
          'status': 'REVOKED',
          'expires_at': '2025-12-31',
        },
      ]),
    );
    await tester.pumpWidget(
      MaterialApp(home: AdminCodesScreen(controller: c)),
    );
    await tester.pumpAndSettle();
    expect(find.text('MOLCUBE-2026-A'), findsOneWidget);
    expect(find.text('MOLCUBE-2025-X'), findsOneWidget);
  });
}
