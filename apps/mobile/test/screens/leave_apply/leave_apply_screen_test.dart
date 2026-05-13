import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/leave_apply/leave_apply_screen.dart';
import 'package:work_manager_mobile/screens/leave_apply/state/leave_apply_controller.dart';

void main() {
  testWidgets('LeaveApply renders form with type chips + date fields + submit',
      (tester) async {
    final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
    final c = LeaveApplyController(dio: dio);
    await tester.pumpWidget(
      MaterialApp(home: LeaveApplyScreen(controller: c, onDone: () {})),
    );
    await tester.pumpAndSettle();
    expect(find.text('연차'), findsOneWidget);
    expect(find.text('보상'), findsOneWidget);
    expect(find.text('시작'), findsOneWidget);
    expect(find.text('종료'), findsOneWidget);
    expect(find.text('제출'), findsOneWidget);
  });
}
