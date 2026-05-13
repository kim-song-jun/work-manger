import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/approval_detail/approval_detail_screen.dart';
import 'package:work_manager_mobile/screens/approval_detail/state/approval_detail_controller.dart';

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
  testWidgets('ApprovalDetailScreen renders rows and action buttons',
      (tester) async {
    final c = ApprovalDetailController(
      dio: _stub({
        'kind': '연차',
        'requester_name': '박지수',
        'requested_at': '2026-05-14',
        'detail': '개인 사유',
      }),
      id: 'apv-1',
    );
    await tester.pumpWidget(
      MaterialApp(home: ApprovalDetailScreen(controller: c)),
    );
    await tester.pumpAndSettle();
    expect(find.text('종류'), findsOneWidget);
    expect(find.text('연차'), findsOneWidget);
    expect(find.text('신청자'), findsOneWidget);
    expect(find.text('박지수'), findsOneWidget);
    expect(find.text('신청일'), findsOneWidget);
    expect(find.text('2026-05-14'), findsOneWidget);
    expect(find.text('상세'), findsOneWidget);
    expect(find.text('개인 사유'), findsOneWidget);
    expect(find.text('승인'), findsOneWidget);
    expect(find.text('반려'), findsOneWidget);
  });
}
