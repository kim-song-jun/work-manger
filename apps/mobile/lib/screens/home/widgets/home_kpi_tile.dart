import 'package:flutter/material.dart';

import '../../../theme/tokens.g.dart';

enum KpiAccent { none, caution }

class HomeKpiTile extends StatelessWidget {
  const HomeKpiTile({
    super.key,
    required this.label,
    required this.value,
    this.accent = KpiAccent.none,
  });

  final String label;
  final String value;
  final KpiAccent accent;

  @override
  Widget build(BuildContext context) {
    // Token substitution: orange50 → warnSoft, orange700 → warn (no orange* in palette)
    final bg = accent == KpiAccent.caution ? WMTokens.warnSoft : WMTokens.white;
    final valueColor =
        accent == KpiAccent.caution ? WMTokens.warn : WMTokens.grey900;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 120),
      curve: Curves.easeOut,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(WMTokens.rMd),
        boxShadow: [
          BoxShadow(
            color: WMTokens.grey900.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: WMTokens.grey600,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              color: valueColor,
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
