import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class LeaveExpiryController extends ChangeNotifier {
  LeaveExpiryController({required this.dio});
  final Dio dio;
  List<Map<String, dynamic>> items = [];
  String? error;
  bool loading = false;

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      Response<Map<String, dynamic>> r;
      try {
        r = await dio.get<Map<String, dynamic>>('/v1/leave/expiring');
      } on DioException catch (e) {
        if (e.response?.statusCode == 404) {
          r = await dio.get<Map<String, dynamic>>(
            '/v1/leave/balance',
            queryParameters: {'expiring': 'true'},
          );
        } else {
          rethrow;
        }
      }
      items = List<Map<String, dynamic>>.from(
        (r.data?['data'] as List?) ?? const [],
      );
    } on DioException catch (e) {
      error = e.message ?? 'load failed';
    } finally {
      loading = false;
      notifyListeners();
    }
  }
}
