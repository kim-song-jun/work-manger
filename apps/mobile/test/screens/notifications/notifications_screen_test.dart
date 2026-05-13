import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/notifications/notifications_screen.dart';
import 'package:work_manager_mobile/screens/notifications/state/notifications_controller.dart';

Dio _stub(List<dynamic> items) {
  final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (o, h) {
        h.resolve(Response(data: {'data': items}, requestOptions: o, statusCode: 200));
      },
    ),
  );
  return dio;
}

void main() {
  testWidgets('NotificationsScreen renders notification tiles', (tester) async {
    final c = NotificationsController(
      dio: _stub([
        {
          'id': 'aaa',
          'title': '휴가 승인',
          'body': '연차 2일이 승인되었습니다.',
          'is_read': false,
          'created_at': DateTime.now().subtract(const Duration(minutes: 5)).toIso8601String(),
        },
        {
          'id': 'bbb',
          'title': '출근 기록',
          'body': '09:02 출근이 기록되었습니다.',
          'is_read': true,
          'created_at': DateTime.now().subtract(const Duration(hours: 2)).toIso8601String(),
        },
      ]),
    );
    await tester.pumpWidget(MaterialApp(home: NotificationsScreen(controller: c)));
    await tester.pumpAndSettle();
    expect(find.text('휴가 승인'), findsOneWidget);
    expect(find.text('연차 2일이 승인되었습니다.'), findsOneWidget);
    expect(find.text('출근 기록'), findsOneWidget);
  });
}
