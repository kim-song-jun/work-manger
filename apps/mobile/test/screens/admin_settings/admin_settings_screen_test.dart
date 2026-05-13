import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/admin_settings/admin_settings_screen.dart';
import 'package:work_manager_mobile/screens/admin_settings/state/admin_settings_controller.dart';

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
  testWidgets('AdminSettingsScreen renders read-only summary cards',
      (tester) async {
    final c = AdminSettingsController(
      dio: _stub({
        'company': {'name': '몰큐브'},
        'fiscal_year_start': '01-01',
        'brand_color': '#3182F6',
        'logo_url': null,
      }),
    );
    await tester.pumpWidget(
      MaterialApp(
        home: AdminSettingsScreen(
          controller: c,
          onOpenWebView: (_) {},
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('회사명'), findsOneWidget);
    expect(find.text('몰큐브'), findsOneWidget);
    expect(find.text('회계연도 시작'), findsOneWidget);
    expect(find.text('브랜드 컬러'), findsOneWidget);
    expect(find.text('WebView 에서 수정'), findsOneWidget);
  });
}
