import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/inbox/inbox_screen.dart';
import 'package:work_manager_mobile/screens/inbox/state/inbox_controller.dart';

Dio _stub({required List<Map<String, dynamic>> items}) {
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
  testWidgets('Inbox renders empty state', (tester) async {
    final c = InboxController(dio: _stub(items: []), role: 'EMPLOYEE');
    await tester.pumpWidget(
      MaterialApp(home: InboxScreen(controller: c, onOpenItem: (_) {})),
    );
    await tester.pumpAndSettle();
    expect(find.text('받은 함이 비어있습니다.'), findsOneWidget);
  });

  testWidgets('Inbox renders 2 items for MANAGER with tabs', (tester) async {
    final c = InboxController(
      dio: _stub(
        items: [
          {
            'id': '1',
            'kind': 'LEAVE',
            'title': '연차 신청',
            'subtitle': '김민수 · 2025-12-24',
            'status': 'PENDING',
          },
          {
            'id': '2',
            'kind': 'OVERTIME',
            'title': '연장 신청',
            'subtitle': '이지은 · 2025-12-23',
            'status': 'PENDING',
          },
        ],
      ),
      role: 'MANAGER',
    );
    await tester.pumpWidget(
      MaterialApp(home: InboxScreen(controller: c, onOpenItem: (_) {})),
    );
    await tester.pumpAndSettle();
    expect(find.text('연차 신청'), findsOneWidget);
    expect(find.text('연장 신청'), findsOneWidget);
    expect(find.text('전체'), findsOneWidget); // tab visible
  });
}
