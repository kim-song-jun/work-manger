import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class SettingsController extends ChangeNotifier {
  SettingsController({required this.dio});
  final Dio dio;
  bool useNativeHome = false;
  String? error;
  bool loading = false;

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final r = await dio.get<Map<String, dynamic>>('/v1/me/settings');
      useNativeHome = ((r.data?['data'] as Map?)?['use_native_home'] as bool?) ?? false;
    } on DioException catch (e) {
      error = e.message;
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<void> toggleUseNativeHome(bool v) async {
    final prev = useNativeHome;
    useNativeHome = v;
    notifyListeners();
    try {
      await dio.patch('/v1/me/settings', data: {'use_native_home': v});
    } on DioException catch (e) {
      useNativeHome = prev;
      error = e.message;
      notifyListeners();
    }
  }
}
