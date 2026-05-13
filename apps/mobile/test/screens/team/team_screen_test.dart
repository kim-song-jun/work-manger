import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/team/team_screen.dart';
import 'package:work_manager_mobile/screens/team/state/team_controller.dart';

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
  testWidgets('TeamScreen renders members list', (tester) async {
    final c = TeamController(
      dio: _stub(
        items: [
          {
            'id': 'u1',
            'name': '김민수',
            'role': '개발자',
            'status': 'WORKING',
          },
          {
            'id': 'u2',
            'name': '이지은',
            'role': '디자이너',
            'status': 'OFF',
          },
        ],
      ),
    );
    await tester.pumpWidget(MaterialApp(home: TeamScreen(controller: c)));
    await tester.pumpAndSettle();
    expect(find.text('김민수'), findsOneWidget);
    expect(find.text('이지은'), findsOneWidget);
    expect(find.text('근무중'), findsOneWidget);
  });
}
