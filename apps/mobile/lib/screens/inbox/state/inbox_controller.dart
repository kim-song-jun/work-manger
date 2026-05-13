import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../observability/sentry.dart';

class InboxItem {
  InboxItem({
    required this.id,
    required this.kind,
    required this.title,
    required this.subtitle,
    required this.status,
    required this.requestedAt,
  });

  final String id;
  final String kind; // LEAVE | OVERTIME | TRIP | NOTICE
  final String title;
  final String subtitle;
  final String status; // PENDING | APPROVED | REJECTED
  final DateTime requestedAt;

  static InboxItem fromJson(Map<String, dynamic> m) => InboxItem(
        id: m['id'] as String,
        kind: (m['kind'] as String?) ?? 'NOTICE',
        title: (m['title'] as String?) ?? '',
        subtitle: (m['subtitle'] as String?) ?? '',
        status: (m['status'] as String?) ?? 'PENDING',
        requestedAt:
            DateTime.tryParse((m['requested_at'] as String?) ?? '') ??
                DateTime.now(),
      );
}

class InboxController extends ChangeNotifier {
  InboxController({required this.dio, required this.role});

  final Dio dio;
  final String role; // 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | 'OWNER'
  List<InboxItem> items = [];
  String? error;
  bool loading = false;
  String tabKind = 'ALL'; // ALL | LEAVE | OVERTIME | TRIP

  Future<void> load() =>
      wrapTransaction('inbox.load', 'http.client', () async {
        loading = true;
        error = null;
        notifyListeners();
        try {
          final r = await dio.get<Map<String, dynamic>>(
            '/v1/inbox',
            queryParameters: {
              if (tabKind != 'ALL') 'kind': tabKind,
            },
          );
          final raw = (r.data?['data'] as List?) ?? const [];
          items = raw
              .map((e) => InboxItem.fromJson(e as Map<String, dynamic>))
              .toList();
        } on DioException catch (e) {
          error = e.message ?? 'inbox load failed';
        } finally {
          loading = false;
          notifyListeners();
        }
      });

  void setTab(String kind) {
    tabKind = kind;
    load();
  }
}
