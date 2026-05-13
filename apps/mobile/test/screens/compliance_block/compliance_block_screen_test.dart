import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/compliance_block/compliance_block_screen.dart';

void main() {
  testWidgets(
      'ComplianceBlockScreen renders 52h warning and tapping 관리자에게 문의 triggers callback',
      (tester) async {
    var contacted = false;

    await tester.pumpWidget(
      MaterialApp(
        home: ComplianceBlockScreen(onContactAdmin: () => contacted = true),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byIcon(Icons.shield), findsOneWidget);
    expect(find.text('이번 주 52시간을 초과했습니다'), findsOneWidget);
    expect(find.text('관리자 승인 후 출근 가능'), findsOneWidget);
    expect(find.text('관리자에게 문의'), findsOneWidget);

    await tester.tap(find.text('관리자에게 문의'));
    expect(contacted, isTrue);
  });
}
