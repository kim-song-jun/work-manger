import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../observability/sentry.dart';

class ComplianceData {
  ComplianceData({
    required this.usedMinutes,
    required this.weekLabel,
  });

  final int usedMinutes; // total worked minutes this week
  final String weekLabel;

  static const int weekLimitMinutes = 52 * 60; // 52h
  static const int warningMinutes = 40 * 60; // 40h

  double get progress =>
      (usedMinutes / weekLimitMinutes).clamp(0.0, 1.0);

  bool get isWarning => usedMinutes >= warningMinutes;

  String get usedLabel {
    final h = usedMinutes ~/ 60;
    final m = usedMinutes % 60;
    return '$h시간 $m분';
  }

  String get limitLabel => '52시간 0분';

  static ComplianceData fromJson(Map<String, dynamic> m) => ComplianceData(
        usedMinutes: (m['used_minutes'] as int?) ?? 0,
        weekLabel: (m['week_label'] as String?) ?? '',
      );
}

class ComplianceController extends ChangeNotifier {
  ComplianceController({required this.dio});

  final Dio dio;
  ComplianceData? data;
  String? error;
  bool loading = false;

  Future<void> load() =>
      wrapTransaction('compliance.load', 'http.client', () async {
        loading = true;
        error = null;
        notifyListeners();
        try {
          final r =
              await dio.get<Map<String, dynamic>>('/v1/compliance/me');
          final raw = r.data ?? const <String, dynamic>{};
          data = ComplianceData.fromJson(raw);
        } on DioException catch (e) {
          error = e.message ?? 'compliance load failed';
        } finally {
          loading = false;
          notifyListeners();
        }
      });
}
