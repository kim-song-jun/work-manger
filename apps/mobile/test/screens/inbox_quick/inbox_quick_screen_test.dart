import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/inbox_quick/inbox_quick_screen.dart';
import 'package:work_manager_mobile/screens/inbox_quick/state/inbox_quick_controller.dart';

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
  testWidgets('InboxQuickScreen renders 2 items', (tester) async {
    final c = InboxQuickController(
      dio: _stub([
        {
          'title': '연차 신청',
          'requested_at': '2026-05-10',
          'kind': 'LEAVE',
        },
        {
          'title': '연장 신청',
          'requested_at': '2026-05-11',
          'kind': 'OVERTIME',
        },
      ]),
    );
    await tester.pumpWidget(
      MaterialApp(home: InboxQuickScreen(controller: c)),
    );
    await tester.pumpAndSettle();
    expect(find.text('연차 신청'), findsOneWidget);
    expect(find.text('연장 신청'), findsOneWidget);
  });
}
