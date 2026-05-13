import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/home_controller.dart';
import 'widgets/home_avatar_stack.dart';
import 'widgets/home_hero.dart';
import 'widgets/home_kpi_tile.dart';
import 'widgets/home_team_count.dart';

class WMHomeScreen extends StatefulWidget {
  const WMHomeScreen({
    super.key,
    required this.controller,
    required this.onClockIn,
    required this.onOpenWebView,
  });

  final HomeController controller;
  final VoidCallback onClockIn;
  final void Function(String path) onOpenWebView;

  @override
  State<WMHomeScreen> createState() => _WMHomeScreenState();
}

class _WMHomeScreenState extends State<WMHomeScreen> {
  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_onChange);
    widget.controller.load();
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onChange);
    super.dispose();
  }

  void _onChange() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.controller.state;
    final loading = widget.controller.loading;
    final err = widget.controller.error;

    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        backgroundColor: WMTokens.white,
        elevation: 0,
        title: const Text(
          '근무 관리',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => widget.onOpenWebView('/m/inbox'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: widget.controller.load,
        child: ListView(
          children: [
            if (err != null)
              Container(
                margin: const EdgeInsets.all(12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  // Token substitution: red50 → dangerSoft, red700 → danger (no red* in palette)
                  color: WMTokens.dangerSoft,
                  borderRadius: BorderRadius.circular(WMTokens.rMd),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.error_outline,
                      color: WMTokens.danger,
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        '최신 데이터를 불러올 수 없습니다.',
                        style: TextStyle(color: WMTokens.danger, fontSize: 13),
                      ),
                    ),
                    TextButton(
                      onPressed: widget.controller.load,
                      child: const Text('재시도'),
                    ),
                  ],
                ),
              ),
            if (loading && s.todayMinutes == 0 && err == null)
              const LinearProgressIndicator(minHeight: 2),
            HomeHero(
              status: s.status,
              todayMinutes: s.todayMinutes,
              onClockIn: widget.onClockIn,
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Expanded(
                    child: HomeKpiTile(label: '오늘', value: _h(s.todayMinutes)),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: HomeKpiTile(
                      label: '이번주',
                      value: _h(s.weekMinutes),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: HomeKpiTile(
                      label: '연장',
                      value: _h(s.overtimeMinutes),
                      accent: s.overtimeMinutes >= 30
                          ? KpiAccent.caution
                          : KpiAccent.none,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            HomeTeamCount(count: s.teamCount),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: HomeAvatarStack(urls: s.avatars),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  static String _h(int minutes) {
    final h = minutes ~/ 60;
    final m = minutes % 60;
    return '${h}h ${m.toString().padLeft(2, '0')}m';
  }
}
