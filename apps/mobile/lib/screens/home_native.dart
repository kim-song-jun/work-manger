/// home_native.dart — B-NAT-03 Phase A: 첫 native page draft.
///
/// Re-implements `/m/home` (React SPA) as a Flutter native widget.
/// 사용 토큰: `lib/theme/tokens.g.dart` (gen_tokens.mjs codegen).
/// 사용 API: `lib/api/generated/` (gen_openapi_dart.sh codegen — TBD).
///
/// 현재는 골격 + UI 구성. Phase A 진입 시:
///   1. fetchToday / fetchWeeklyStats / fetchBalance / fetchTeamGrid 연결
///   2. SlideToClockIn → Flutter Slidable + Haptic feedback 으로 재구현
///   3. 상태 관리 — Riverpod (또는 flutter_bloc) 도입 검토
library;

import 'package:flutter/material.dart';

import '../theme/tokens.g.dart';

class HomeNativePage extends StatefulWidget {
  const HomeNativePage({super.key});

  @override
  State<HomeNativePage> createState() => _HomeNativePageState();
}

class _HomeNativePageState extends State<HomeNativePage> {
  // TODO(B-NAT-03 W2): replace with API call (openapi-generated client).
  bool _clockedIn = false;
  int _workedMinutes = 0;
  int _weeklyTotalMin = 0;
  int _overtimeMin = 0;
  double _remainingDays = 15;

  // Polish: 정규 8h 대비 누적 — m-home web parity.
  double get _progressPct => _clockedIn
      ? (_workedMinutes / 480.0).clamp(0.0, 1.0)
      : 0.0;

  String _fmtMinutes(int min) {
    final h = min ~/ 60;
    final m = min % 60;
    return '${h}h ${m.toString().padLeft(2, '0')}m';
  }

  String _fmtHoursOneDecimal(int min) {
    if (min <= 0) return '0';
    return (min / 60).toStringAsFixed(1);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
          children: [
            _DateGreeting(clockedIn: _clockedIn),
            const SizedBox(height: 8),
            _HeroCard(
              clockedIn: _clockedIn,
              workedMinutes: _workedMinutes,
              progressPct: _progressPct,
              formatMinutes: _fmtMinutes,
            ),
            const SizedBox(height: 10),
            const _LocationChip(),
            const SizedBox(height: 14),
            _SlideToClockIn(
              clockedIn: _clockedIn,
              onToggle: () => setState(() {
                _clockedIn = !_clockedIn;
                _workedMinutes = _clockedIn ? 36 : 0;
              }),
            ),
            const SizedBox(height: 14),
            _KpiRow(
              weeklyLabel: _fmtHoursOneDecimal(_weeklyTotalMin),
              remainingDays: _remainingDays,
              overtimeLabel: _fmtHoursOneDecimal(_overtimeMin),
              overtimeHot: _overtimeMin >= 30,
            ),
            const SizedBox(height: 10),
            const _TeamPreview(
              officeCount: 3,
              wfhCount: 2,
              leaveCount: 1,
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────── Sub-widgets ───────────────────────

class _DateGreeting extends StatelessWidget {
  final bool clockedIn;
  const _DateGreeting({required this.clockedIn});

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    final weekday = dayNames[now.weekday % 7];
    final date = '${weekday} · ${now.month}월 ${now.day}일';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(date,
            style: const TextStyle(
                fontSize: 12,
                color: WMTokens.grey600,
                fontWeight: FontWeight.w500)),
        const SizedBox(height: 4),
        Text(clockedIn ? '오늘 하루 수고하셨어요' : '안녕하세요, 좋은 아침이에요',
            style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: WMTokens.grey900,
                letterSpacing: -0.4)),
      ],
    );
  }
}

class _HeroCard extends StatelessWidget {
  final bool clockedIn;
  final int workedMinutes;
  final double progressPct;
  final String Function(int) formatMinutes;

  const _HeroCard({
    required this.clockedIn,
    required this.workedMinutes,
    required this.progressPct,
    required this.formatMinutes,
  });

  @override
  Widget build(BuildContext context) {
    final bg = clockedIn
        ? const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [WMTokens.brand, WMTokens.brandHover])
        : null;
    final color = clockedIn ? Colors.white : WMTokens.grey900;
    return AnimatedContainer(
      duration: WMTokens.motionStandard,
      curve: Curves.easeOutCubic,
      decoration: BoxDecoration(
        color: clockedIn ? null : WMTokens.white,
        gradient: bg,
        borderRadius: BorderRadius.circular(WMTokens.rMd),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: clockedIn ? 0.10 : 0.06),
            blurRadius: clockedIn ? 12 : 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(WMTokens.rMd),
        child: Stack(
          children: [
            if (clockedIn)
              Positioned(
                top: 0,
                left: 0,
                child: AnimatedContainer(
                  duration: WMTokens.motionSlow,
                  height: 3,
                  width: MediaQuery.of(context).size.width * progressPct,
                  color: Colors.white.withValues(alpha: 0.85),
                ),
              ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('오늘 근무',
                          style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: clockedIn
                                  ? Colors.white.withValues(alpha: 0.85)
                                  : WMTokens.grey500)),
                      if (clockedIn)
                        Container(
                          padding:
                              const EdgeInsets.fromLTRB(8, 4, 10, 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.18),
                            borderRadius: BorderRadius.circular(WMTokens.rPill),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              _PulseDot(),
                              SizedBox(width: 6),
                              Text('근무 중',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                      clockedIn ? formatMinutes(workedMinutes) : '—',
                      style: TextStyle(
                          fontSize: 40,
                          fontWeight: FontWeight.w700,
                          color: color,
                          height: 1.0,
                          letterSpacing: -0.5,
                          fontFeatures: const [
                            FontFeature.tabularFigures()
                          ])),
                  const SizedBox(height: 20),
                  _StatRow(
                    inverse: clockedIn,
                    items: const [
                      ('출근', '—'),
                      ('퇴근', '—'),
                      ('정규', '09–18'),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PulseDot extends StatefulWidget {
  const _PulseDot();
  @override
  State<_PulseDot> createState() => _PulseDotState();
}

class _PulseDotState extends State<_PulseDot>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (_, __) {
        final t = _ctrl.value;
        final ring = t < 0.7 ? t / 0.7 : 0.0;
        return SizedBox(
          width: 6,
          height: 6,
          child: Stack(
            alignment: Alignment.center,
            children: [
              Container(
                width: 6 + ring * 6,
                height: 6 + ring * 6,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color:
                      Colors.white.withValues(alpha: 0.55 * (1 - ring)),
                ),
              ),
              Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(
                    shape: BoxShape.circle, color: Colors.white),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _StatRow extends StatelessWidget {
  final bool inverse;
  final List<(String, String)> items;
  const _StatRow({required this.items, this.inverse = false});

  @override
  Widget build(BuildContext context) {
    final labelColor = inverse
        ? Colors.white.withValues(alpha: 0.75)
        : WMTokens.grey500;
    final valueColor = inverse ? Colors.white : WMTokens.grey900;
    return Row(
      children: items.map((it) {
        return Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(it.$1,
                  style: TextStyle(fontSize: 12, color: labelColor)),
              const SizedBox(height: 4),
              Text(it.$2,
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: valueColor,
                      fontFeatures: const [
                        FontFeature.tabularFigures()
                      ])),
            ],
          ),
        );
      }).toList(),
    );
  }
}

class _LocationChip extends StatelessWidget {
  const _LocationChip();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: WMTokens.white,
        borderRadius: BorderRadius.circular(WMTokens.rMd),
        boxShadow: const [
          BoxShadow(color: Color(0x0F000000), blurRadius: 3, offset: Offset(0, 1))
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: WMTokens.brandSoft,
              borderRadius: BorderRadius.circular(WMTokens.rMd),
            ),
            child:
                const Icon(Icons.business_rounded, color: WMTokens.brand, size: 20),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('본사에서 근무 중',
                    style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: WMTokens.grey900)),
                SizedBox(height: 2),
                Text('강남 오피스 · 자동 감지됨',
                    style: TextStyle(fontSize: 12, color: WMTokens.grey600)),
              ],
            ),
          ),
          TextButton(onPressed: () {}, child: const Text('변경')),
        ],
      ),
    );
  }
}

class _SlideToClockIn extends StatelessWidget {
  final bool clockedIn;
  final VoidCallback onToggle;
  const _SlideToClockIn({required this.clockedIn, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    // TODO(B-NAT-03 W3): implement actual slide-to-confirm with drag gesture +
    //   Haptic feedback. Current draft: simple FilledButton fallback.
    return SizedBox(
      width: double.infinity,
      height: 64,
      child: FilledButton.tonal(
        style: FilledButton.styleFrom(
          backgroundColor: clockedIn ? WMTokens.danger : WMTokens.brand,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(WMTokens.rPill)),
        ),
        onPressed: onToggle,
        child: Text(clockedIn ? '밀어서 퇴근 →' : '밀어서 출근 →',
            style: const TextStyle(
                fontSize: 15, fontWeight: FontWeight.w600)),
      ),
    );
  }
}

class _KpiRow extends StatelessWidget {
  final String weeklyLabel;
  final double remainingDays;
  final String overtimeLabel;
  final bool overtimeHot;

  const _KpiRow({
    required this.weeklyLabel,
    required this.remainingDays,
    required this.overtimeLabel,
    required this.overtimeHot,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _KpiTile(label: '이번 주', value: weeklyLabel, unit: 'h')),
        const SizedBox(width: 8),
        Expanded(
            child: _KpiTile(
                label: '잔여 연차',
                value: remainingDays.toStringAsFixed(0),
                unit: '일')),
        const SizedBox(width: 8),
        Expanded(
            child: _KpiTile(
                label: '초과 누적',
                value: overtimeLabel,
                unit: 'h',
                emphasis: overtimeHot)),
      ],
    );
  }
}

class _KpiTile extends StatelessWidget {
  final String label;
  final String value;
  final String unit;
  final bool emphasis;
  const _KpiTile({
    required this.label,
    required this.value,
    required this.unit,
    this.emphasis = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: emphasis ? WMTokens.warnSoft : WMTokens.white,
        borderRadius: BorderRadius.circular(WMTokens.rMd),
        boxShadow: const [
          BoxShadow(color: Color(0x0F000000), blurRadius: 3, offset: Offset(0, 1))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: const TextStyle(fontSize: 11, color: WMTokens.grey600)),
          const SizedBox(height: 6),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(value,
                  style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: WMTokens.grey900,
                      fontFeatures: [FontFeature.tabularFigures()])),
              const SizedBox(width: 2),
              Text(unit,
                  style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: WMTokens.grey500)),
            ],
          ),
        ],
      ),
    );
  }
}

class _TeamPreview extends StatelessWidget {
  final int officeCount;
  final int wfhCount;
  final int leaveCount;
  const _TeamPreview({
    required this.officeCount,
    required this.wfhCount,
    required this.leaveCount,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: WMTokens.white,
        borderRadius: BorderRadius.circular(WMTokens.rMd),
        boxShadow: const [
          BoxShadow(color: Color(0x0F000000), blurRadius: 3, offset: Offset(0, 1))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('팀 현황',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: WMTokens.grey900)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 12,
            runSpacing: 6,
            children: [
              if (officeCount > 0)
                _statusCount(WMTokens.sOffice, '$officeCount명 출근'),
              if (wfhCount > 0)
                _statusCount(WMTokens.sWfh, '$wfhCount명 재택'),
              if (leaveCount > 0)
                _statusCount(WMTokens.sLeave, '$leaveCount명 휴가'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _statusCount(Color dotColor, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(shape: BoxShape.circle, color: dotColor),
        ),
        const SizedBox(width: 4),
        Text(label,
            style: const TextStyle(fontSize: 12, color: WMTokens.grey700)),
      ],
    );
  }
}
