import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../observability/sentry.dart';

class TeamMember {
  TeamMember({
    required this.id,
    required this.name,
    required this.role,
    required this.status,
  });

  final String id;
  final String name;
  final String role;
  final String status; // WORKING | OFF | ON_LEAVE | OVERTIME

  static TeamMember fromJson(Map<String, dynamic> m) => TeamMember(
        id: (m['id'] as String?) ?? '',
        name: (m['name'] as String?) ?? '',
        role: (m['role'] as String?) ?? '',
        status: (m['status'] as String?) ?? 'OFF',
      );
}

class TeamController extends ChangeNotifier {
  TeamController({required this.dio});

  final Dio dio;
  List<TeamMember> members = [];
  String? error;
  bool loading = false;

  Future<void> load() =>
      wrapTransaction('team.load', 'http.client', () async {
        loading = true;
        error = null;
        notifyListeners();
        try {
          final r = await dio.get<Map<String, dynamic>>('/v1/team/status');
          final raw = (r.data?['data'] as List?) ?? const [];
          members = raw
              .map((e) => TeamMember.fromJson(e as Map<String, dynamic>))
              .toList();
        } on DioException catch (e) {
          error = e.message ?? 'team load failed';
        } finally {
          loading = false;
          notifyListeners();
        }
      });
}
