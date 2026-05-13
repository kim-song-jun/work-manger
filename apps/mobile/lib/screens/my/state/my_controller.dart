import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class MyProfile {
  MyProfile({
    required this.name,
    required this.email,
    required this.role,
  });
  final String name;
  final String email;
  final String role;
}

class MyController extends ChangeNotifier {
  MyController({required this.dio});
  final Dio dio;
  MyProfile? profile;
  String? error;
  bool loading = false;

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final r = await dio.get<Map<String, dynamic>>('/v1/me');
      final d = (r.data?['data'] as Map<String, dynamic>?) ?? {};
      profile = MyProfile(
        name: d['name']?.toString() ?? d['full_name']?.toString() ?? '사용자',
        email: d['email']?.toString() ?? '',
        role: d['role']?.toString() ?? '',
      );
    } on DioException catch (e) {
      error = e.message ?? 'load failed';
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<void> logout(Dio dio) async {
    try {
      await dio.post<void>('/v1/auth/logout');
    } on DioException {
      // best-effort
    }
  }
}
