import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/admin_employees/admin_employees_screen.dart';
import 'package:work_manager_mobile/screens/admin_employees/state/admin_employees_controller.dart';

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
  testWidgets('AdminEmployeesScreen renders employee list with search bar',
      (tester) async {
    final c = AdminEmployeesController(
      dio: _stub(
        items: [
          {'id': 'e1', 'name': '김민수', 'role': '개발자', 'status': 'ACTIVE'},
          {'id': 'e2', 'name': '이지은', 'role': '디자이너', 'status': 'ON_LEAVE'},
        ],
      ),
    );
    await tester.pumpWidget(
      MaterialApp(
        home: AdminEmployeesScreen(
          controller: c,
          onOpenWebView: (_) {},
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('김민수'), findsOneWidget);
    expect(find.text('이지은'), findsOneWidget);
    expect(find.text('재직'), findsOneWidget);
    expect(find.text('휴직'), findsOneWidget);
    expect(find.byType(TextField), findsOneWidget);
  });
}
