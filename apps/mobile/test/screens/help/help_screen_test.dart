import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/help/help_screen.dart';

void main() {
  testWidgets('HelpScreen renders FAQ items and contact button', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: HelpScreen()));
    await tester.pumpAndSettle();
    expect(find.text('출근/퇴근하기'), findsOneWidget);
    expect(find.text('휴가 신청'), findsOneWidget);
    expect(find.text('팀 보기'), findsOneWidget);
    expect(find.text('프로필 변경'), findsOneWidget);
    expect(find.text('비밀번호 분실'), findsOneWidget);
    expect(find.text('고객센터 문의'), findsOneWidget);
  });
}
