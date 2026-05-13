import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class LeaveBalance {
  LeaveBalance({required this.annual, required this.comp, required this.recent});
  final Map<String, num> annual; // {total, used, remaining}
  final Map<String, num> comp;
  final List<Map<String, dynamic>> recent;
}

class LeaveBalanceController extends ChangeNotifier {
  LeaveBalanceController({required this.dio});
  final Dio dio;
  LeaveBalance? data;
  String? error;
  bool loading = false;

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final r = await dio.get<Map<String, dynamic>>('/v1/leave/balance');
      final d = (r.data?['data'] as Map<String, dynamic>?) ?? {};
      data = LeaveBalance(
        annual: Map<String, num>.from(
          (d['annual'] as Map?) ?? {'total': 0, 'used': 0, 'remaining': 0},
        ),
        comp: Map<String, num>.from(
          (d['comp'] as Map?) ?? {'total': 0, 'used': 0, 'remaining': 0},
        ),
        recent: List<Map<String, dynamic>>.from((d['recent'] as List?) ?? const []),
      );
    } on DioException catch (e) {
      error = e.message ?? 'balance load failed';
    } finally {
      loading = false;
      notifyListeners();
    }
  }
}
