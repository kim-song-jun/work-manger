import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class LeaveApplyController extends ChangeNotifier {
  LeaveApplyController({required this.dio});

  final Dio dio;

  String leaveType = 'ANNUAL'; // ANNUAL | COMP | SICK | UNPAID
  DateTime? from;
  DateTime? to;
  String reason = '';
  bool submitting = false;
  String? error;
  bool success = false;

  void setLeaveType(String t) {
    leaveType = t;
    notifyListeners();
  }

  void setFrom(DateTime d) {
    from = d;
    if (to != null && to!.isBefore(d)) to = d;
    notifyListeners();
  }

  void setTo(DateTime d) {
    to = d;
    notifyListeners();
  }

  void setReason(String r) {
    reason = r;
    notifyListeners();
  }

  bool get canSubmit => from != null && to != null && !submitting;

  Future<void> submit() async {
    if (!canSubmit) return;
    submitting = true;
    error = null;
    notifyListeners();
    try {
      await dio.post<void>(
        '/v1/leave/requests',
        data: {
          'leave_type': leaveType,
          'from': from!.toIso8601String().substring(0, 10),
          'to': to!.toIso8601String().substring(0, 10),
          'reason': reason,
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
