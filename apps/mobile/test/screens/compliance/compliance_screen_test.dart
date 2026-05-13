import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/compliance/compliance_screen.dart';
import 'package:work_manager_mobile/screens/compliance/state/compliance_controller.dart';

Dio _stub({required Map<String, dynamic> data}) {
  final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (o, h) {
        h.resolve(
          Response(
            data: data,
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
  testWidgets('ComplianceScreen renders progress', (tester) async {
    final c = ComplianceController(
      dio: _stub(
        data: {
          'used_minutes': 1800, // 30h
          'week_label': '2026년 20주차',
        },
      ),
    );
    await tester.pumpWidget(
      MaterialApp(home: ComplianceScreen(controller: c)),
    );
    await tester.pumpAndSettle();
    expect(find.text('이번 주 근무시간'), findsOneWidget);
    expect(find.text('2026년 20주차'), findsOneWidget);
    // 30h / 52h → 57.7%
    expect(find.textContaining('57.7%'), findsOneWidget);
  });

  testWidgets('ComplianceScreen shows warning banner when >= 40h', (tester) async {
    final c = ComplianceController(
      dio: _stub(
        data: {
          'used_minutes': 2520, // 42h
          'week_label': '2026년 21주차',
        },
      ),
    );
    await tester.pumpWidget(
      MaterialApp(home: ComplianceScreen(controller: c)),
    );
    await tester.pumpAndSettle();
    expect(find.text('이번 주 근무시간'), findsOneWidget);
    expect(find.textContaining('유의하세요'), findsOneWidget);
  });
}
