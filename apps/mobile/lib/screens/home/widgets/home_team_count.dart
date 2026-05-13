import 'package:flutter/material.dart';

import '../../../theme/tokens.g.dart';

class HomeTeamCount extends StatelessWidget {
  const HomeTeamCount({super.key, required this.count});

  /// {office: N, wfh: N, leave: N, break: N}
  final Map<String, int> count;

  @override
  Widget build(BuildContext context) {
    // Token substitution: green500 → success (no green* in palette)
    // Token substitution: orange500 → warn (no orange* in palette)
    final segments = [
      ('office', '출근', WMTokens.blue500, count['office'] ?? 0),
      ('wfh', '재택', WMTokens.success, count['wfh'] ?? 0),
      ('leave', '휴가', WMTokens.warn, count['leave'] ?? 0),
      ('break', '휴식', WMTokens.grey500, count['break'] ?? 0),
    ].where((s) => s.$4 > 0).toList();

    if (segments.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Wrap(
        spacing: 12,
        runSpacing: 4,
        children: [
          for (final s in segments)
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(color: s.$3, shape: BoxShape.circle),
                ),
                const SizedBox(width: 4),
                Text(
                  '${s.$4}명 ${s.$2}',
                  style: const TextStyle(color: WMTokens.grey700, fontSize: 13),
                ),
              ],
            ),
        ],
      ),
    );
  }
}
