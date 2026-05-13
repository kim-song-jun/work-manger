import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/settings/settings_screen.dart';
import 'package:work_manager_mobile/screens/settings/state/settings_controller.dart';

void main() {
  testWidgets('Settings renders sections + native home switch', (tester) async {
    final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (o, h) {
          h.resolve(
            Response(
              data: {
                'data': {'use_native_home': true},
              },
              requestOptions: o,
              statusCode: 200,
            ),
          );
        },
      ),
    );
    final c = SettingsController(dio: dio);
    await tester.pumpWidget(
      MaterialApp(home: SettingsScreen(controller: c, onOpenWebView: (_) {})),
    );
    await tester.pumpAndSettle();
    expect(find.text('네이티브 홈 사용'), findsOneWidget);
    expect(find.text('프로필'), findsOneWidget);
    expect(find.text('2단계 인증'), findsOneWidget);
    expect(find.byType(Switch), findsOneWidget);
  });
}
