import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/error_gps/error_gps_screen.dart';

void main() {
  testWidgets('ErrorGpsScreen renders GPS warning and settings button',
      (tester) async {
    await tester.pumpWidget(const MaterialApp(home: ErrorGpsScreen()));
    await tester.pumpAndSettle();

    expect(find.byIcon(Icons.location_off), findsOneWidget);
    expect(find.text('GPS 권한이 필요합니다'), findsOneWidget);
    expect(find.text('설정 열기'), findsOneWidget);
  });
}
