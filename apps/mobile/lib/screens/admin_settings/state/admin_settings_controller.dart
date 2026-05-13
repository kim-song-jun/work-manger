import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../observability/sentry.dart';

class CompanySettings {
  CompanySettings({
    required this.companyName,
    required this.fiscalYearStart,
    required this.brandColor,
    this.logoUrl,
  });

  final String companyName;
  final String fiscalYearStart;
  final String brandColor; // hex string e.g. "#3182F6"
  final String? logoUrl;

  static CompanySettings fromJson(Map<String, dynamic> m) {
    final company = m['company'] as Map<String, dynamic>? ?? m;
    return CompanySettings(
      companyName: (company['name'] as String?) ?? '',
      fiscalYearStart: (m['fiscal_year_start'] as String?) ?? '',
      brandColor: (m['brand_color'] as String?) ?? '#3182F6',
      logoUrl: m['logo_url'] as String?,
    );
  }
}

class AdminSettingsController extends ChangeNotifier {
  AdminSettingsController({required this.dio});

  final Dio dio;
  CompanySettings? settings;
  String? error;
  bool loading = false;

  Future<void> load() =>
      wrapTransaction('admin_settings.load', 'http.client', () async {
        loading = true;
        error = null;
        notifyListeners();
        try {
          final r =
              await dio.get<Map<String, dynamic>>('/v1/admin/settings');
          final data =
              r.data?['data'] as Map<String, dynamic>? ?? r.data ?? {};
          settings = CompanySettings.fromJson(data as Map<String, dynamic>);
        } on DioException catch (e) {
          error = e.message ?? 'settings load failed';
        } finally {
          loading = false;
          notifyListeners();
        }
      });
}
