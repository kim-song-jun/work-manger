import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/my/my_screen.dart';
import 'package:work_manager_mobile/screens/my/state/my_controller.dart';

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
  testWidgets('MyScreen renders profile header and sub-menu rows', (tester) async {
    final c = MyController(
      dio: _stub({'name': '김테스트', 'email': 'test@example.com', 'role': 'EMPLOYEE'}),
    );
    await tester.pumpWidget(
      MaterialApp(home: MyScreen(controller: c)),
    );
    await tester.pumpAndSettle();
    // Profile header
    expect(find.text('김테스트'), findsOneWidget);
    expect(find.text('test@example.com'), findsOneWidget);
    expect(find.text('EMPLOYEE'), findsOneWidget);
    // Sub-menu rows
    expect(find.text('프로필'), findsOneWidget);
    expect(find.text('비밀번호 변경'), findsOneWidget);
    expect(find.text('2단계 인증'), findsOneWidget);
    expect(find.text('알림 설정'), findsOneWidget);
    expect(find.text('화면 꾸미기'), findsOneWidget);
    expect(find.text('도움말'), findsOneWidget);
    expect(find.text('로그아웃'), findsOneWidget);
  });
}
