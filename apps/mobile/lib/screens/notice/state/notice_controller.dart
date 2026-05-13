import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../observability/sentry.dart';

class NoticeItem {
  NoticeItem({
    required this.id,
    required this.title,
    required this.bodyExcerpt,
    required this.publishedAt,
  });

  final String id;
  final String title;
  final String bodyExcerpt;
  final DateTime publishedAt;

  static NoticeItem fromJson(Map<String, dynamic> m) {
    final body = (m['body'] as String?) ?? '';
    return NoticeItem(
      id: (m['id'] as String?) ?? '',
      title: (m['title'] as String?) ?? '',
      bodyExcerpt: body.length > 80 ? '${body.substring(0, 80)}…' : body,
      publishedAt:
          DateTime.tryParse((m['published_at'] as String?) ?? '') ??
              DateTime.now(),
    );
  }
}

class NoticeController extends ChangeNotifier {
  NoticeController({required this.dio});

  final Dio dio;
  List<NoticeItem> items = [];
  String? error;
  bool loading = false;

  Future<void> load() =>
      wrapTransaction('notice.load', 'http.client', () async {
        loading = true;
        error = null;
        notifyListeners();
        try {
          final r = await dio.get<Map<String, dynamic>>('/v1/notices');
          final raw = (r.data?['data'] as List?) ?? const [];
          items = raw
              .map((e) => NoticeItem.fromJson(e as Map<String, dynamic>))
              .toList();
        } on DioException catch (e) {
          error = e.message ?? 'notice load failed';
        } finally {
          loading = false;
          notifyListeners();
        }
      });
}
