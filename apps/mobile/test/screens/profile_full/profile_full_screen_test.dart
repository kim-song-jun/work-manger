import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/profile_full/profile_full_screen.dart';
import 'package:work_manager_mobile/screens/profile_full/state/profile_full_controller.dart';

void main() {
  testWidgets('ProfileFullScreen renders editable and readonly fields',
      (tester) async {
    final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
    final c = ProfileFullController(dio: dio);
    await tester.pumpWidget(
      MaterialApp(home: ProfileFullScreen(controller: c, onSaved: () {})),
    );
    await tester.pumpAndSettle();
    expect(find.text('이름'), findsOneWidget);
    expect(find.text('전화번호'), findsOneWidget);
    expect(find.text('부서'), findsOneWidget);
    expect(find.text('직급'), findsOneWidget);
    expect(find.text('입사일'), findsOneWidget);
    expect(find.text('비상 연락처'), findsOneWidget);
  });
}
