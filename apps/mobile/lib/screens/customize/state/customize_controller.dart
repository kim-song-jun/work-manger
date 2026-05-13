import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class CustomizeController extends ChangeNotifier {
  CustomizeController({required this.dio});

  final Dio dio;

  Map<String, dynamic>? data;
  bool loading = false;
  bool submitting = false;
  String? error;
  bool success = false;

  bool darkMode = false;
  bool largeText = false;
  bool vibration = true;
  String theme = 'blue';

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final res = await dio.get<Map<String, dynamic>>('/v1/me/preferences');
      final d = res.data ?? {};
      data = d;
      darkMode = (d['dark_mode'] as bool?) ?? false;
      largeText = (d['large_text'] as bool?) ?? false;
      vibration = (d['vibration'] as bool?) ?? true;
      theme = (d['theme'] as String?) ?? 'blue';
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        // fallback to defaults — already set above
      } else {
        error = e.response?.data?.toString() ?? e.message ?? 'load failed';
      }
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  void setDarkMode(bool v) {
    darkMode = v;
    notifyListeners();
  }

  void setLargeText(bool v) {
    largeText = v;
    notifyListeners();
  }

  void setVibration(bool v) {
    vibration = v;
    notifyListeners();
  }

  void setTheme(String v) {
    theme = v;
    notifyListeners();
  }

  Future<void> submit(Map<String, dynamic> patch) async {
    submitting = true;
    error = null;
    notifyListeners();
    try {
      await dio.patch<void>('/v1/me/preferences', data: patch);
      success = true;
    } on DioException catch (e) {
      error = e.response?.data?.toString() ?? e.message ?? 'submit failed';
    } finally {
      submitting = false;
      notifyListeners();
    }
  }
}
