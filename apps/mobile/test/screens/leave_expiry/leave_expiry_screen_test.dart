import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/leave_expiry/leave_expiry_screen.dart';
import 'package:work_manager_mobile/screens/leave_expiry/state/leave_expiry_controller.dart';

Dio _stub(List<Map<String, dynamic>> items) {
  final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (o, h) {
        h.resolve(
          Response(
            data: {'data': items},
            requestOptions: o,
            statusCode: 200,
          ),
        );
      },
    ),
  );
  return dio;
}

void main() {
  testWidgets('LeaveExpiryScreen renders 2 items', (tester) async {
    final c = LeaveExpiryController(
      dio: _stub([
        {'type': '연차', 'expires_at': '2026-05-20', 'remaining_days': 5},
        {'type': '반차', 'expires_at': '2026-06-01', 'remaining_days': 10},
      ]),
    );
    await tester.pumpWidget(MaterialApp(home: LeaveExpiryScreen(controller: c)));
    await tester.pumpAndSettle();
    expect(find.text('연차'), findsOneWidget);
    expect(find.text('반차'), findsOneWidget);
  });
}
