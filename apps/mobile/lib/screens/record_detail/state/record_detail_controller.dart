import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../observability/sentry.dart';

class RecordDetailController extends ChangeNotifier {
  RecordDetailController({required this.dio, required this.id});

  final Dio dio;
  final String id;
  Map<String, dynamic>? data;
  String? error;
  bool loading = false;

  Future<void> load() =>
      wrapTransaction('record_detail.load', 'http.client', () async {
        loading = true;
        error = null;
        notifyListeners();
        try {
          final r =
              await dio.get<Map<String, dynamic>>('/v1/attendance/records/$id');
          data = (r.data?['data'] as Map?)?.cast<String, dynamic>();
        } on DioException catch (e) {
          error = e.message ?? 'record load failed';
        } finally {
          loading = false;
          notifyListeners();
        }
      });
}
