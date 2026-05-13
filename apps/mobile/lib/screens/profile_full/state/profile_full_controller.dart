import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class ProfileFullController extends ChangeNotifier {
  ProfileFullController({required this.dio});

  final Dio dio;

  Map<String, dynamic>? data;
  bool loading = false;
  bool submitting = false;
  String? error;
  bool success = false;

  String name = '';
  String phone = '';
  String department = '';
  String position = '';
  String joinedAt = '';
  String emergencyContact = '';

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final res = await dio.get<Map<String, dynamic>>('/v1/me/profile');
      final d = res.data ?? {};
      data = d;
      name = (d['name'] as String?) ?? '';
      phone = (d['phone'] as String?) ?? '';
      department = (d['department'] as String?) ?? '';
      position = (d['position'] as String?) ?? '';
      joinedAt = (d['joined_at'] as String?) ?? '';
      emergencyContact = (d['emergency_contact'] as String?) ?? '';
    } on DioException catch (e) {
      error = e.response?.data?.toString() ?? e.message ?? 'load failed';
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  void setName(String v) {
    name = v;
    notifyListeners();
  }

  void setPhone(String v) {
    phone = v;
    notifyListeners();
  }

  void setEmergencyContact(String v) {
    emergencyContact = v;
    notifyListeners();
  }

  Future<void> submit(Map<String, dynamic> patch) async {
    submitting = true;
    error = null;
    notifyListeners();
    try {
      await dio.patch<void>(
        '/v1/me/profile',
        data: {
          'name': name,
          'phone': phone,
          'emergency_contact': emergencyContact,
          ...patch,
        },
      );
      success = true;
    } on DioException catch (e) {
      error = e.response?.data?.toString() ?? e.message ?? 'submit failed';
    } finally {
      submitting = false;
      notifyListeners();
    }
  }
}
