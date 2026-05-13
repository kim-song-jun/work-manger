import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/empty_noti/empty_noti_screen.dart';

void main() {
  testWidgets('EmptyNotiScreen renders empty-state icon and message',
      (tester) async {
    await tester.pumpWidget(const MaterialApp(home: EmptyNotiScreen()));
    await tester.pumpAndSettle();

    expect(find.byIcon(Icons.notifications_off_outlined), findsOneWidget);
    expect(find.text('알림이 없습니다'), findsOneWidget);
  });
}
