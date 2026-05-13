import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../observability/sentry.dart';

class DashboardStats {
  DashboardStats({
    required this.employeeCount,
    required this.todayAttendance,
    required this.pendingApprovals,
    required this.complianceWarnings,
  });

  final int employeeCount;
  final int todayAttendance;
  final int pendingApprovals;
  final int complianceWarnings;

  static DashboardStats fromJson(Map<String, dynamic> m) => DashboardStats(
        employeeCount: (m['employee_count'] as num?)?.toInt() ?? 0,
        todayAttendance: (m['today_attendance'] as num?)?.toInt() ?? 0,
        pendingApprovals: (m['pending_approvals'] as num?)?.toInt() ?? 0,
        complianceWarnings: (m['compliance_warnings'] as num?)?.toInt() ?? 0,
      );
}

class AdminDashboardController extends ChangeNotifier {
  AdminDashboardController({required this.dio});

  final Dio dio;
  DashboardStats? stats;
  String? error;
  bool loading = false;

  Future<void> load() =>
      wrapTransaction('admin_dashboard.load', 'http.client', () async {
        loading = true;
        error = null;
        notifyListeners();
        try {
          final r =
              await dio.get<Map<String, dynamic>>('/v1/admin/dashboard');
          final data = r.data?['data'] as Map<String, dynamic>? ?? r.data ?? {};
          stats = DashboardStats.fromJson(data as Map<String, dynamic>);
        } on DioException catch (e) {
          error = e.message ?? 'dashboard load failed';
        } finally {
          loading = false;
          notifyListeners();
        }
      });
}
