import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/weekly_report_controller.dart';

/// 7-day bar chart using plain Container rows — no chart dependency.
class WeeklyReportScreen extends StatefulWidget {
  const WeeklyReportScreen({
    super.key,
    required this.controller,
  });

  final WeeklyReportController controller;

  @override
  State<WeeklyReportScreen> createState() => _WeeklyReportScreenState();
}

class _WeeklyReportScreenState extends State<WeeklyReportScreen> {
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

  static const List<String> _dayLabels = ['월', '화', '수', '목', '금', '토', '일'];

  static String _formatMinutes(int m) {
    final h = m ~/ 60;
    final min = m % 60;
    return '${h}h ${min.toString().padLeft(2, '0')}m';
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;

    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        backgroundColor: WMTokens.white,
        elevation: 0,
        title: const Text(
          '주간 리포트',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: c.load,
          ),
        ],
      ),
      body: c.loading && c.report == null
          ? const Center(child: CircularProgressIndicator())
          : c.error != null && c.report == null
              ? _ErrorView(message: c.error!, onRetry: c.load)
              : _ReportBody(report: c.report),
    );
  }
}

class _ReportBody extends StatelessWidget {
  const _ReportBody({required this.report});

  final Map<String, dynamic>? report;

  @override
  Widget build(BuildContext context) {
    final dailyMinutes = _parseDailyMinutes(report);
    final totalMinutes = report?['total_minutes'] as int? ??
        (report?['regular_minutes'] as int? ?? 0) +
            (report?['overtime_minutes'] as int? ?? 0);

    return ListView(
      padding: const EdgeInsets.all(WMTokens.sp4),
      children: [
        // Total summary card
        Container(
          padding: const EdgeInsets.all(WMTokens.sp4),
          decoration: BoxDecoration(
            color: WMTokens.white,
            borderRadius: BorderRadius.circular(WMTokens.rLg),
          ),
          child: Row(
            children: [
              const Icon(Icons.access_time, color: WMTokens.blue500, size: 20),
              const SizedBox(width: WMTokens.sp2),
              const Text(
                '이번 주 총 근무시간',
                style: TextStyle(color: WMTokens.grey700, fontSize: 14),
              ),
              const Spacer(),
              Text(
                _formatMinutes(totalMinutes),
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: WMTokens.grey900,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: WMTokens.sp4),
        // 7-day bar chart
        Container(
          padding: const EdgeInsets.all(WMTokens.sp4),
          decoration: BoxDecoration(
            color: WMTokens.white,
            borderRadius: BorderRadius.circular(WMTokens.rLg),
          ),
          child: _BarChart(dailyMinutes: dailyMinutes),
        ),
        const SizedBox(height: WMTokens.sp4),
        // Extra stats if available
        if (report != null) _StatsRow(report: report!),
      ],
    );
  }

  static List<int> _parseDailyMinutes(Map<String, dynamic>? report) {
    final raw = report?['daily_minutes'];
    if (raw is List) {
      final list = raw.cast<int>();
      // Pad to 7 if shorter, trim if longer
      final result = List<int>.filled(7, 0);
      for (var i = 0; i < list.length && i < 7; i++) {
        result[i] = list[i];
      }
      return result;
    }
    // Fallback: distribute regular_minutes evenly across days_worked
    final daysWorked = report?['days_worked'] as int? ?? 0;
    final regularMins = report?['regular_minutes'] as int? ?? 0;
    final perDay = daysWorked > 0 ? regularMins ~/ daysWorked : 0;
    return List.generate(7, (i) => i < daysWorked ? perDay : 0);
  }

  static String _formatMinutes(int m) {
    final h = m ~/ 60;
    final min = m % 60;
    return '${h}h ${min.toString().padLeft(2, '0')}m';
  }
}

class _BarChart extends StatelessWidget {
  const _BarChart({required this.dailyMinutes});

  final List<int> dailyMinutes;

  static const List<String> _labels = ['월', '화', '수', '목', '금', '토', '일'];
  static const double _maxBarHeight = 120.0;

  @override
  Widget build(BuildContext context) {
    final maxVal = dailyMinutes.fold(0, (a, b) => a > b ? a : b);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '요일별 근무시간',
          style: TextStyle(
            fontWeight: FontWeight.w600,
            color: WMTokens.grey900,
            fontSize: 14,
          ),
        ),
        const SizedBox(height: WMTokens.sp4),
        SizedBox(
          height: _maxBarHeight + 40,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: List.generate(7, (i) {
              final mins = dailyMinutes[i];
              final barHeight = maxVal > 0
                  ? (mins / maxVal) * _maxBarHeight
                  : 0.0;
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 3),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Container(
                        key: ValueKey('bar_$i'),
                        height: barHeight < 4 && mins > 0 ? 4 : barHeight,
                        decoration: BoxDecoration(
                          color: WMTokens.blue500,
                          borderRadius: BorderRadius.circular(WMTokens.rXs),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        _labels[i],
                        style: const TextStyle(
                          fontSize: 12,
                          color: WMTokens.grey600,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }
}

class _StatsRow extends StatelessWidget {
  const _StatsRow({required this.report});

  final Map<String, dynamic> report;

  @override
  Widget build(BuildContext context) {
    final daysWorked = report['days_worked'] as int? ?? 0;
    final overtimeMins = report['overtime_minutes'] as int? ?? 0;

    return Row(
      children: [
        Expanded(
          child: _StatTile(
            label: '근무일',
            value: '$daysWorked일',
            icon: Icons.calendar_today_outlined,
          ),
        ),
        const SizedBox(width: WMTokens.sp3),
        Expanded(
          child: _StatTile(
            label: '연장',
            value: _fmt(overtimeMins),
            icon: Icons.more_time,
            accent: overtimeMins > 0 ? WMTokens.warn : null,
          ),
        ),
      ],
    );
  }

  static String _fmt(int m) {
    final h = m ~/ 60;
    final min = m % 60;
    return '${h}h ${min.toString().padLeft(2, '0')}m';
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({
    required this.label,
    required this.value,
    required this.icon,
    this.accent,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color? accent;

  @override
  Widget build(BuildContext context) {
    final color = accent ?? WMTokens.blue500;
    return Container(
      padding: const EdgeInsets.all(WMTokens.sp4),
      decoration: BoxDecoration(
        color: WMTokens.white,
        borderRadius: BorderRadius.circular(WMTokens.rLg),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: WMTokens.sp2),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 12, color: WMTokens.grey600)),
              Text(
                value,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(WMTokens.sp8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: WMTokens.danger),
            const SizedBox(height: WMTokens.sp3),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: WMTokens.sp4),
            TextButton(onPressed: onRetry, child: const Text('재시도')),
          ],
        ),
      ),
    );
  }
}
