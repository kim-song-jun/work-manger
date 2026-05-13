import 'package:flutter/material.dart';

import '../../../theme/tokens.g.dart';
import '../state/inbox_controller.dart';

class InboxItemTile extends StatelessWidget {
  const InboxItemTile({super.key, required this.item, required this.onTap});

  final InboxItem item;
  final VoidCallback onTap;

  static const _kindLabels = {
    'LEAVE': '휴가',
    'OVERTIME': '연장',
    'TRIP': '출장',
    'NOTICE': '공지',
  };

  @override
  Widget build(BuildContext context) {
    final kindLabel = _kindLabels[item.kind] ?? item.kind;
    final statusColor = item.status == 'APPROVED'
        ? WMTokens.success
        : item.status == 'REJECTED'
            ? WMTokens.danger
            : WMTokens.blue500;

    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: const BoxDecoration(
          border: Border(
            bottom: BorderSide(color: WMTokens.grey200, width: 0.5),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: WMTokens.grey100,
                borderRadius: BorderRadius.circular(WMTokens.rSm),
              ),
              child: Text(
                kindLabel,
                style: const TextStyle(
                  fontSize: 11,
                  color: WMTokens.grey700,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: WMTokens.grey900,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    item.subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: WMTokens.grey600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                color: statusColor,
                shape: BoxShape.circle,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
