import 'package:flutter/material.dart';

import '../../../theme/tokens.g.dart';

class HomeHero extends StatelessWidget {
  const HomeHero({
    super.key,
    required this.status,
    required this.todayMinutes,
    required this.onClockIn,
  });

  final String status; // OFF | WORKING | BREAK | WFH | LEAVE
  final int todayMinutes;
  final VoidCallback onClockIn;

  static const _regularMinutes = 8 * 60;

  @override
  Widget build(BuildContext context) {
    final isActive = status == 'WORKING' || status == 'WFH';
    final progress = (todayMinutes / _regularMinutes).clamp(0.0, 1.0);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: isActive
            ? const LinearGradient(
                // Token substitution: blue500 gradient — no blue600/lighter available; use blue500 + blue700 for depth
                colors: [WMTokens.blue500, WMTokens.blue700],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : null,
        color: isActive ? null : WMTokens.white,
        borderRadius: BorderRadius.circular(WMTokens.rLg),
        boxShadow: isActive
            ? [
                BoxShadow(
                  color: WMTokens.blue500.withValues(alpha: 0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ]
            : [
                BoxShadow(
                  color: WMTokens.grey900.withValues(alpha: 0.04),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (isActive) ...[
                _pulseDot(),
                const SizedBox(width: 8),
              ],
              Text(
                _statusLabel(status),
                style: TextStyle(
                  color: isActive ? WMTokens.white : WMTokens.grey900,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            _formatHM(todayMinutes),
            style: TextStyle(
              color: isActive ? WMTokens.white : WMTokens.grey900,
              fontSize: 36,
              fontWeight: FontWeight.w700,
              letterSpacing: -1.0,
            ),
          ),
          const SizedBox(height: 16),
          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 3,
              backgroundColor: (isActive ? WMTokens.white : WMTokens.grey200)
                  .withValues(alpha: 0.3),
              valueColor: AlwaysStoppedAnimation(
                  isActive ? WMTokens.white : WMTokens.blue500,),
            ),
          ),
          if (!isActive) ...[
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: onClockIn,
                child: const Text('출근'),
              ),
            ),
          ],
        ],
      ),
    );
  }

  static String _statusLabel(String s) {
    switch (s) {
      case 'WORKING':
        return '근무 중';
      case 'BREAK':
        return '휴식';
      case 'WFH':
        return '재택';
      case 'LEAVE':
        return '휴가';
      default:
        return '출근 전';
    }
  }

  static String _formatHM(int minutes) {
    final h = minutes ~/ 60;
    final m = minutes % 60;
    return '${h}h ${m.toString().padLeft(2, '0')}m';
  }

  Widget _pulseDot() {
    return Container(
      width: 8,
      height: 8,
      decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
      ),
    );
  }
}
