import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../realtime/ws_client.dart';

class HomeState {
  HomeState({
    required this.status,
    required this.todayMinutes,
    required this.weekMinutes,
    required this.overtimeMinutes,
    required this.teamCount,
    required this.avatars,
  });

  /// 'OFF' | 'WORKING' | 'BREAK' | 'WFH' | 'LEAVE'
  final String status;
  final int todayMinutes;
  final int weekMinutes;
  final int overtimeMinutes;

  /// {office: N, wfh: N, leave: N, break: N}
  final Map<String, int> teamCount;

  /// Avatar URLs of currently-online teammates.
  final List<String> avatars;

  HomeState copyWith({
    String? status,
    int? todayMinutes,
    int? weekMinutes,
    int? overtimeMinutes,
    Map<String, int>? teamCount,
    List<String>? avatars,
  }) {
    return HomeState(
      status: status ?? this.status,
      todayMinutes: todayMinutes ?? this.todayMinutes,
      weekMinutes: weekMinutes ?? this.weekMinutes,
      overtimeMinutes: overtimeMinutes ?? this.overtimeMinutes,
      teamCount: teamCount ?? this.teamCount,
      avatars: avatars ?? this.avatars,
    );
  }

  static HomeState empty() => HomeState(
        status: 'OFF',
        todayMinutes: 0,
        weekMinutes: 0,
        overtimeMinutes: 0,
        teamCount: const {'office': 0, 'wfh': 0, 'leave': 0, 'break': 0},
        avatars: const [],
      );
}

class HomeController extends ChangeNotifier {
  HomeController({required this.dio, required this.wsClient}) {
    _wsSub = wsClient.events.listen(_onWsEvent);
  }

  final Dio dio;
  final WsClient wsClient;
  StreamSubscription<Map<String, dynamic>>? _wsSub;

  HomeState state = HomeState.empty();
  String? error;
  bool loading = false;

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final r = await dio.get<Map<String, dynamic>>('/v1/me/dashboard');
      final data = r.data?['data'] as Map<String, dynamic>? ?? {};
      state = HomeState(
        status: (data['status'] as String?) ?? 'OFF',
        todayMinutes: (data['today_minutes'] as int?) ?? 0,
        weekMinutes: (data['week_minutes'] as int?) ?? 0,
        overtimeMinutes: (data['overtime_minutes'] as int?) ?? 0,
        teamCount: Map<String, int>.from((data['team_count'] as Map?) ?? {}),
        avatars: List<String>.from((data['avatars'] as List?) ?? []),
      );
    } on DioException catch (e) {
      error = e.message ?? 'load failed';
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  void _onWsEvent(Map<String, dynamic> e) {
    if (e['event'] != 'clock-in.updated') return;
    final newStatus = e['status'] as String?;
    final newToday = e['today_minutes'] as int?;
    if (newStatus == null && newToday == null) return;
    state = state.copyWith(status: newStatus, todayMinutes: newToday);
    notifyListeners();
  }

  @override
  void dispose() {
    _wsSub?.cancel();
    super.dispose();
  }
}
