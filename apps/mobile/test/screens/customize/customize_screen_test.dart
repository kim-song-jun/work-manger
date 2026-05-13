import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/customize/customize_screen.dart';
import 'package:work_manager_mobile/screens/customize/state/customize_controller.dart';

void main() {
  testWidgets('CustomizeScreen renders switches and theme chips',
      (tester) async {
    final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
    final c = CustomizeController(dio: dio);
    await tester.pumpWidget(
      MaterialApp(home: CustomizeScreen(controller: c, onSaved: () {})),
    );
    await tester.pumpAndSettle();
    expect(find.text('다크 모드'), findsOneWidget);
    expect(find.text('큰 글씨'), findsOneWidget);
    expect(find.text('알림 진동'), findsOneWidget);
    expect(find.text('파랑'), findsOneWidget);
    expect(find.text('녹색'), findsOneWidget);
  });
}
