import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class WeeklyReportController extends ChangeNotifier {
  WeeklyReportController({required this.dio});

  final Dio dio;

  Map<String, dynamic>? report;
  bool loading = false;
  String? error;

  Future<void> load({String? week}) async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final queryParams = week != null ? {'week': week} : <String, dynamic>{};
      final res = await dio.get<Map<String, dynamic>>(
        '/v1/attendance/stats/weekly',
        queryParameters: queryParams,
      );
      final data = res.data?['data'] as Map<String, dynamic>?;
      report = data;
    } on DioException catch (e) {
      error = e.response?.data?.toString() ?? e.message ?? 'load failed';
    } finally {
      loading = false;
      notifyListeners();
    }
  }
}
