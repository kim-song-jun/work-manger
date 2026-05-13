import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/record_detail/record_detail_screen.dart';
import 'package:work_manager_mobile/screens/record_detail/state/record_detail_controller.dart';

Dio _stub(Map<String, dynamic> data) {
  final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (o, h) {
        h.resolve(
          Response(
            data: {'data': data},
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
  testWidgets('RecordDetailScreen renders key-value rows', (tester) async {
    final c = RecordDetailController(
      dio: _stub({
        'date': '2026-05-14',
        'clock_in': '09:00',
        'clock_out': '18:00',
        'break_minutes': 60,
        'total_minutes': 480,
        'location': '본사',
      }),
      id: 'rec-1',
    );
    await tester.pumpWidget(
      MaterialApp(home: RecordDetailScreen(controller: c)),
    );
    await tester.pumpAndSettle();
    expect(find.text('날짜'), findsOneWidget);
    expect(find.text('2026-05-14'), findsOneWidget);
    expect(find.text('출근'), findsOneWidget);
    expect(find.text('09:00'), findsOneWidget);
    expect(find.text('퇴근'), findsOneWidget);
    expect(find.text('18:00'), findsOneWidget);
    expect(find.text('휴식'), findsOneWidget);
    expect(find.text('60분'), findsOneWidget);
    expect(find.text('총 시간'), findsOneWidget);
    expect(find.text('480분'), findsOneWidget);
    expect(find.text('위치'), findsOneWidget);
    expect(find.text('본사'), findsOneWidget);
  });
}
