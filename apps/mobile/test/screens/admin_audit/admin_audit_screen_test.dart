import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/admin_audit/admin_audit_screen.dart';
import 'package:work_manager_mobile/screens/admin_audit/state/admin_audit_controller.dart';

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
  testWidgets('AdminAuditScreen renders 2 items', (tester) async {
    final c = AdminAuditController(
      dio: _stub([
        {'action': 'LOGIN', 'actor': '김민수', 'at': '2026-05-10T09:00:00'},
        {'action': 'APPROVAL', 'actor': '이지은', 'at': '2026-05-10T10:00:00'},
      ]),
    );
    await tester.pumpWidget(
      MaterialApp(home: AdminAuditScreen(controller: c)),
    );
    await tester.pumpAndSettle();
    expect(find.text('LOGIN'), findsOneWidget);
    expect(find.text('APPROVAL'), findsOneWidget);
  });
}
