import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/overtime/overtime_screen.dart';
import 'package:work_manager_mobile/screens/overtime/state/overtime_controller.dart';

void main() {
  testWidgets('OvertimeScreen renders date row, duration chips, reason field',
      (tester) async {
    final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
    final c = OvertimeController(dio: dio);
    await tester.pumpWidget(
      MaterialApp(home: OvertimeScreen(controller: c, onSaved: () {})),
    );
    await tester.pumpAndSettle();
    expect(find.text('날짜'), findsWidgets);
    expect(find.text('30분'), findsOneWidget);
    expect(find.text('1시간'), findsOneWidget);
    expect(find.text('2시간'), findsOneWidget);
    expect(find.text('제출'), findsOneWidget);
  });
}
