import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/admin_employee_detail/admin_employee_detail_screen.dart';
import 'package:work_manager_mobile/screens/admin_employee_detail/state/admin_employee_detail_controller.dart';

Dio _stub(Map<String, dynamic> data) {
  final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (o, h) {
        h.resolve(
          Response(
            data: {'data': data},
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
  testWidgets('AdminEmployeeDetailScreen renders rows and WebView edit button',
      (tester) async {
    String? openedPath;
    final c = AdminEmployeeDetailController(
      dio: _stub({
        'name': '김민수',
        'email': 'minsoo@example.com',
        'department': '개발팀',
        'position': '시니어 개발자',
        'hire_date': '2022-03-01',
        'status': 'ACTIVE',
      }),
      id: 'emp-1',
    );
    await tester.pumpWidget(
      MaterialApp(
        home: AdminEmployeeDetailScreen(
          controller: c,
          onOpenWebView: (path) => openedPath = path,
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('이름'), findsOneWidget);
    expect(find.text('김민수'), findsOneWidget);
    expect(find.text('이메일'), findsOneWidget);
    expect(find.text('minsoo@example.com'), findsOneWidget);
    expect(find.text('부서'), findsOneWidget);
    expect(find.text('개발팀'), findsOneWidget);
    expect(find.text('직급'), findsOneWidget);
    expect(find.text('시니어 개발자'), findsOneWidget);
    expect(find.text('입사일'), findsOneWidget);
    expect(find.text('2022-03-01'), findsOneWidget);
    expect(find.text('상태'), findsOneWidget);
    expect(find.text('재직'), findsOneWidget);
    expect(find.text('WebView 에서 편집'), findsOneWidget);
    await tester.tap(find.text('WebView 에서 편집'));
    expect(openedPath, '/admin/employees/emp-1');
  });
}
