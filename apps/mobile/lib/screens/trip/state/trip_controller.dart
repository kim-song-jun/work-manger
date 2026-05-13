import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class TripController extends ChangeNotifier {
  TripController({required this.dio});
  final Dio dio;
  List<Map<String, dynamic>> items = [];
  String? error;
  bool loading = false;

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final r = await dio.get<Map<String, dynamic>>('/v1/trip/requests');
      items = List<Map<String, dynamic>>.from((r.data?['data'] as List?) ?? const []);
    } on DioException catch (e) {
      error = e.message ?? 'load failed';
    } finally {
      loading = false;
      notifyListeners();
    }
  }
}
