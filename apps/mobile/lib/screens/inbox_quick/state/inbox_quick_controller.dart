import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class InboxQuickController extends ChangeNotifier {
  InboxQuickController({required this.dio});
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
        r = await dio.get<Map<String, dynamic>>(
          '/v1/inbox',
          queryParameters: {'quick': 'true'},
        );
      } on DioException catch (e) {
        if (e.response?.statusCode == 404 ||
            e.response?.statusCode == 400) {
          r = await dio.get<Map<String, dynamic>>('/v1/inbox');
        } else {
          rethrow;
        }
      }
      final raw =
          List<Map<String, dynamic>>.from(
            (r.data?['data'] as List?) ?? const [],
          );
      // client-side: take recent 5 if server didn't filter
      items = raw.take(5).toList();
    } on DioException catch (e) {
      error = e.message ?? 'load failed';
    } finally {
      loading = false;
      notifyListeners();
    }
  }
}
