import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../observability/sentry.dart';

class ApprovalDetailController extends ChangeNotifier {
  ApprovalDetailController({required this.dio, required this.id});

  final Dio dio;
  final String id;
  Map<String, dynamic>? data;
  String? error;
  bool loading = false;
  bool deciding = false;

  Future<void> load() =>
      wrapTransaction('approval_detail.load', 'http.client', () async {
        loading = true;
        error = null;
        notifyListeners();
        try {
          final r =
              await dio.get<Map<String, dynamic>>('/v1/approvals/$id');
          data = (r.data?['data'] as Map?)?.cast<String, dynamic>();
        } on DioException catch (e) {
          error = e.message ?? 'approval load failed';
        } finally {
          loading = false;
          notifyListeners();
        }
      });

  Future<bool> decide(String action) =>
      wrapTransaction('approval_detail.decide', 'http.client', () async {
        deciding = true;
        error = null;
        notifyListeners();
        try {
          await dio.post<void>(
            '/v1/approvals/$id/decide',
            data: {'action': action},
          );
          return true;
        } on DioException catch (e) {
          error = e.message ?? 'decide failed';
          return false;
        } finally {
          deciding = false;
          notifyListeners();
        }
      });
}
