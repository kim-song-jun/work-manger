import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/leave_success/leave_success_screen.dart';

void main() {
  testWidgets('LeaveSuccessScreen renders confirmation and tapping 확인 triggers onClose',
      (tester) async {
    var closed = false;

    await tester.pumpWidget(
      MaterialApp(
        home: LeaveSuccessScreen(onClose: () => closed = true),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byIcon(Icons.check_circle), findsOneWidget);
    expect(find.text('휴가 신청이 완료되었습니다'), findsOneWidget);
    expect(find.text('승인 대기 중'), findsOneWidget);
    expect(find.text('확인'), findsOneWidget);

    await tester.tap(find.text('확인'));
    expect(closed, isTrue);
  });
}
