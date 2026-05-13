import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class NotificationsController extends ChangeNotifier {
  NotificationsController({required this.dio});
  final Dio dio;
  List<Map<String, dynamic>> items = [];
  String? error;
  bool loading = false;

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final r = await dio.get<Map<String, dynamic>>('/v1/notifications');
      items = List<Map<String, dynamic>>.from((r.data?['data'] as List?) ?? const []);
    } on DioException catch (e) {
      error = e.message ?? 'load failed';
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<void> markRead(String id) async {
    try {
      await dio.patch<void>('/v1/notifications/$id/read');
      final idx = items.indexWhere((n) => n['id']?.toString() == id);
      if (idx != -1) {
        items = List<Map<String, dynamic>>.from(items)
          ..[idx] = {...items[idx], 'is_read': true};
        notifyListeners();
      }
    } on DioException {
      // PoC: silently ignore mark-read failures
    }
  }
}
