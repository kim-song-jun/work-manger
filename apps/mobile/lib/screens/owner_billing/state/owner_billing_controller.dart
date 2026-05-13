import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../observability/sentry.dart';

class BillingPlan {
  BillingPlan({
    required this.name,
    required this.monthlyCost,
    required this.status,
    required this.nextBillingDate,
  });

  final String name;
  final int monthlyCost; // KRW
  final String status; // ACTIVE | TRIALING | CANCELED | etc.
  final String nextBillingDate; // ISO date string or ''

  static BillingPlan fromJson(Map<String, dynamic> m) => BillingPlan(
        name: (m['plan_name'] as String?) ?? (m['name'] as String?) ?? '',
        monthlyCost: (m['monthly_cost'] as num?)?.toInt() ?? 0,
        status: (m['status'] as String?) ?? '',
        nextBillingDate:
            (m['next_billing_date'] as String?) ??
            (m['current_period_end'] as String?) ??
            '',
      );
}

class BillingInvoice {
  BillingInvoice({
    required this.id,
    required this.amount,
    required this.date,
    required this.status,
    this.pdfUrl,
  });

  final String id;
  final int amount; // KRW
  final String date; // ISO date
  final String status; // paid | open | void
  final String? pdfUrl;

  static BillingInvoice fromJson(Map<String, dynamic> m) => BillingInvoice(
        id: (m['id'] as String?) ?? '',
        amount: (m['amount'] as num?)?.toInt() ?? 0,
        date: (m['date'] as String?) ??
            (m['created_at'] as String?) ??
            '',
        status: (m['status'] as String?) ?? '',
        pdfUrl: m['pdf_url'] as String?,
      );
}

class OwnerBillingController extends ChangeNotifier {
  OwnerBillingController({required this.dio});

  final Dio dio;

  BillingPlan? plan;
  List<BillingInvoice> invoices = [];
  String? error;
  bool loading = false;

  /// Calls both subscription + invoices endpoints concurrently.
  /// Gracefully handles 404 (billing module not deployed yet).
  Future<void> load() =>
      wrapTransaction('owner_billing.load', 'http.client', () async {
        loading = true;
        error = null;
        notifyListeners();
        try {
          final results = await Future.wait([
            dio
                .get<Map<String, dynamic>>('/v1/billing/subscription')
                .catchError(
                  (dynamic e) => Response<Map<String, dynamic>>(
                    data: null,
                    requestOptions: RequestOptions(path: ''),
                    statusCode: 404,
                  ),
                ),
            dio
                .get<Map<String, dynamic>>('/v1/billing/invoices')
                .catchError(
                  (dynamic e) => Response<Map<String, dynamic>>(
                    data: null,
                    requestOptions: RequestOptions(path: ''),
                    statusCode: 404,
                  ),
                ),
          ]);

          final subData = results[0].data;
          if (subData != null) {
            final data =
                subData['data'] as Map<String, dynamic>? ?? subData;
            plan = BillingPlan.fromJson(data);
          }

          final invData = results[1].data;
          if (invData != null) {
            final list = (invData['data'] as List?) ??
                (invData['results'] as List?) ??
                const [];
            invoices = list
                .take(5)
                .map(
                  (dynamic e) =>
                      BillingInvoice.fromJson(e as Map<String, dynamic>),
                )
                .toList();
          }
        } on DioException catch (e) {
          error = e.message ?? 'billing load failed';
        } finally {
          loading = false;
          notifyListeners();
        }
      });
}
