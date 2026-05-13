import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class AdminAuditController extends ChangeNotifier {
  AdminAuditController({required this.dio});
  final Dio dio;
  List<Map<String, dynamic>> items = [];
  String? error;
  bool loading = false;
  String filter = 'ALL'; // ALL | LOGIN | APPROVAL | SETTINGS

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final r = await dio.get<Map<String, dynamic>>(
        '/v1/admin/audit',
        queryParameters: {
          if (filter != 'ALL') 'action': filter,
        },
      );
      items = List<Map<String, dynamic>>.from(
        (r.data?['data'] as List?) ?? const [],
      );
    } on DioException catch (e) {
      error = e.message ?? 'load failed';
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  void setFilter(String f) {
    filter = f;
    load();
  }
}
