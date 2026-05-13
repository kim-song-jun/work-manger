import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/leave_balance/leave_balance_screen.dart';
import 'package:work_manager_mobile/screens/leave_balance/state/leave_balance_controller.dart';

Dio _stub(Map<String, dynamic> payload) {
  final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (o, h) {
        h.resolve(Response(data: {'data': payload}, requestOptions: o, statusCode: 200));
      },
    ),
  );
  return dio;
}

void main() {
  testWidgets('LeaveBalance renders annual + comp buckets', (tester) async {
    final c = LeaveBalanceController(
      dio: _stub({
        'annual': {'total': 15, 'used': 5, 'remaining': 10},
        'comp': {'total': 3, 'used': 1, 'remaining': 2},
        'recent': [
          {'type': 'ANNUAL', 'from': '2025-12-24', 'to': '2025-12-26', 'status': 'APPROVED'},
        ],
      }),
    );
    await tester.pumpWidget(
      MaterialApp(home: LeaveBalanceScreen(controller: c, onApply: () {})),
    );
    await tester.pumpAndSettle();
    expect(find.text('연차'), findsOneWidget);
    expect(find.text('보상'), findsOneWidget);
    expect(find.text('10 / 15일'), findsOneWidget);
    expect(find.text('2 / 3일'), findsOneWidget);
  });
}
