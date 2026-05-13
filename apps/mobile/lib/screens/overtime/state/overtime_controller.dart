import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class OvertimeController extends ChangeNotifier {
  OvertimeController({required this.dio});

  final Dio dio;

  Map<String, dynamic>? data;
  bool loading = false;
  bool submitting = false;
  String? error;
  bool success = false;

  DateTime? date;
  int? minutes;
  String reason = '';

  void setDate(DateTime d) {
    date = d;
    notifyListeners();
  }

  void setMinutes(int m) {
    minutes = m;
    notifyListeners();
  }

  void setReason(String r) {
    reason = r;
    notifyListeners();
  }

  bool get canSubmit => date != null && minutes != null && !submitting;

  Future<void> submit(Map<String, dynamic> patch) async {
    if (!canSubmit) return;
    submitting = true;
    error = null;
    notifyListeners();
    try {
      await dio.post<void>(
        '/v1/overtime/requests',
        data: {
          'date': date!.toIso8601String().substring(0, 10),
          'minutes': minutes,
          'reason': reason,
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
