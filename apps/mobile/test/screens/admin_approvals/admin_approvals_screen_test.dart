import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/admin_approvals/admin_approvals_screen.dart';
import 'package:work_manager_mobile/screens/inbox/state/inbox_controller.dart';

Dio _stub({required List<Map<String, dynamic>> items}) {
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
  testWidgets('AdminApprovalsScreen renders inbox empty state for ADMIN',
      (tester) async {
    final c = InboxController(dio: _stub(items: []), role: 'ADMIN');
    await tester.pumpWidget(
      MaterialApp(
        home: AdminApprovalsScreen(controller: c, onOpenItem: (_) {}),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('받은 함이 비어있습니다.'), findsOneWidget);
  });
}
