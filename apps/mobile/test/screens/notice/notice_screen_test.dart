import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/notice/notice_screen.dart';
import 'package:work_manager_mobile/screens/notice/state/notice_controller.dart';

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
  testWidgets('NoticeScreen renders notices list', (tester) async {
    final c = NoticeController(
      dio: _stub(
        items: [
          {
            'id': 'n1',
            'title': '하계 휴가 안내',
            'body': '7월 25일부터 8월 2일까지 여름 휴가입니다.',
            'published_at': '2026-05-01T09:00:00Z',
          },
          {
            'id': 'n2',
            'title': '사무실 이전 공지',
            'body': '6월 1일부로 강남구로 이전합니다.',
            'published_at': '2026-04-20T09:00:00Z',
          },
        ],
      ),
    );
    await tester.pumpWidget(
      MaterialApp(
        home: NoticeScreen(controller: c, onOpenWebView: (_) {}),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('하계 휴가 안내'), findsOneWidget);
    expect(find.text('사무실 이전 공지'), findsOneWidget);
  });
}
