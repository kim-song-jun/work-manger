import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../observability/sentry.dart';

class AdminEmployeeDetailController extends ChangeNotifier {
  AdminEmployeeDetailController({required this.dio, required this.id});

  final Dio dio;
  final String id;
  Map<String, dynamic>? data;
  String? error;
  bool loading = false;

  Future<void> load() =>
      wrapTransaction('admin_employee_detail.load', 'http.client', () async {
        loading = true;
        error = null;
        notifyListeners();
        try {
          final r =
              await dio.get<Map<String, dynamic>>('/v1/admin/employees/$id');
          data = (r.data?['data'] as Map?)?.cast<String, dynamic>();
        } on DioException catch (e) {
          error = e.message ?? 'employee detail load failed';
        } finally {
          loading = false;
          notifyListeners();
        }
      });
}
