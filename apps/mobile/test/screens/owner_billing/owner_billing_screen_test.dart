import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/owner_billing/owner_billing_screen.dart';
import 'package:work_manager_mobile/screens/owner_billing/state/owner_billing_controller.dart';

// ---------------------------------------------------------------------------
// Stub helpers
// ---------------------------------------------------------------------------

Dio _stubBoth({
  Map<String, dynamic>? subscription,
  Map<String, dynamic>? invoices,
}) {
  final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) {
        if (options.path.contains('/billing/subscription')) {
          if (subscription == null) {
            handler.reject(
              DioException(
                requestOptions: options,
                response: Response(
                  requestOptions: options,
                  statusCode: 404,
                ),
                type: DioExceptionType.badResponse,
              ),
            );
          } else {
            handler.resolve(
              Response(
                data: subscription,
                requestOptions: options,
                statusCode: 200,
              ),
            );
          }
        } else if (options.path.contains('/billing/invoices')) {
          if (invoices == null) {
            handler.reject(
              DioException(
                requestOptions: options,
                response: Response(
                  requestOptions: options,
                  statusCode: 404,
                ),
                type: DioExceptionType.badResponse,
              ),
            );
          } else {
            handler.resolve(
              Response(
                data: invoices,
                requestOptions: options,
                statusCode: 200,
              ),
            );
          }
        } else {
          handler.next(options);
        }
      },
    ),
  );
  return dio;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

void main() {
  testWidgets('OwnerBillingScreen renders plan card + invoices with stub data',
      (tester) async {
    final c = OwnerBillingController(
      dio: _stubBoth(
        subscription: {
          'data': {
            'plan_name': '스타터',
            'monthly_cost': 50000,
            'status': 'active',
            'next_billing_date': '2026-06-14',
          },
        },
        invoices: {
          'data': [
            {
              'id': 'inv_001',
              'amount': 50000,
              'date': '2026-05-14',
              'status': 'paid',
            },
            {
              'id': 'inv_002',
              'amount': 50000,
              'date': '2026-04-14',
              'status': 'paid',
            },
          ],
        },
      ),
    );
    await tester.pumpWidget(
      MaterialApp(
        home: OwnerBillingScreen(
          controller: c,
          onOpenWebView: (_) {},
        ),
      ),
    );
    await tester.pumpAndSettle();

    // Plan card
    expect(find.text('현재 플랜'), findsOneWidget);
    expect(find.text('스타터'), findsOneWidget);
    expect(find.text('50,000원 / 월'), findsOneWidget);

    // Invoices section
    expect(find.text('최근 인보이스'), findsOneWidget);

    // Action buttons
    expect(find.text('Stripe Portal 열기'), findsOneWidget);
    expect(find.text('결제 수단 변경'), findsOneWidget);
  });

  testWidgets(
      'OwnerBillingScreen shows 결제 모듈 준비 중 placeholder when billing endpoints return 404',
      (tester) async {
    final c = OwnerBillingController(
      dio: _stubBoth(
        subscription: null, // 404
        invoices: null, // 404
      ),
    );
    await tester.pumpWidget(
      MaterialApp(
        home: OwnerBillingScreen(
          controller: c,
          onOpenWebView: (_) {},
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('결제 모듈 준비 중'), findsOneWidget);
    expect(find.text('인보이스가 없습니다.'), findsOneWidget);
    // Buttons still present
    expect(find.text('Stripe Portal 열기'), findsOneWidget);
  });
}
