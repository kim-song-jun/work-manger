import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../observability/sentry.dart';

class EmployeeItem {
  EmployeeItem({
    required this.id,
    required this.name,
    required this.role,
    required this.status,
  });

  final String id;
  final String name;
  final String role;
  final String status; // ACTIVE | ON_LEAVE

  static EmployeeItem fromJson(Map<String, dynamic> m) => EmployeeItem(
        id: (m['id'] as String?) ?? '',
        name: (m['name'] as String?) ?? '',
        role: (m['role'] as String?) ?? '',
        status: (m['status'] as String?) ?? 'ACTIVE',
      );
}

class AdminEmployeesController extends ChangeNotifier {
  AdminEmployeesController({required this.dio});

  final Dio dio;
  List<EmployeeItem> _allItems = [];
  List<EmployeeItem> items = [];
  String? error;
  bool loading = false;
  String query = '';

  Future<void> load() =>
      wrapTransaction('admin_employees.load', 'http.client', () async {
        loading = true;
        error = null;
        notifyListeners();
        try {
          final r =
              await dio.get<Map<String, dynamic>>('/v1/admin/employees');
          final raw = (r.data?['data'] as List?) ?? const [];
          _allItems = raw
              .map((e) => EmployeeItem.fromJson(e as Map<String, dynamic>))
              .toList();
          _applyFilter();
        } on DioException catch (e) {
          error = e.message ?? 'employees load failed';
        } finally {
          loading = false;
          notifyListeners();
        }
      });

  void search(String q) {
    query = q;
    _applyFilter();
    notifyListeners();
  }

  void _applyFilter() {
    if (query.isEmpty) {
      items = List.of(_allItems);
    } else {
      final q = query.toLowerCase();
      items = _allItems
          .where((e) => e.name.toLowerCase().contains(q))
          .toList();
    }
  }
}
