import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/trip/trip_screen.dart';
import 'package:work_manager_mobile/screens/trip/state/trip_controller.dart';

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
  testWidgets('TripScreen renders trip tiles', (tester) async {
    final c = TripController(
      dio: _stub([
        {
          'destination': '도쿄',
          'start_date': '2025-11-01',
          'end_date': '2025-11-03',
          'status': 'APPROVED',
        },
        {
          'destination': '오사카',
          'start_date': '2025-12-10',
          'end_date': '2025-12-12',
          'status': 'PENDING',
        },
      ]),
    );
    await tester.pumpWidget(MaterialApp(home: TripScreen(controller: c)));
    await tester.pumpAndSettle();
    expect(find.text('도쿄'), findsOneWidget);
    expect(find.text('2025-11-01 ~ 2025-11-03'), findsOneWidget);
    expect(find.text('APPROVED'), findsOneWidget);
    expect(find.text('오사카'), findsOneWidget);
  });
}
