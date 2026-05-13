import 'package:flutter/material.dart';

import '../inbox/inbox_screen.dart';
import '../inbox/state/inbox_controller.dart';

/// Thin wrapper around [InboxScreen] with role='ADMIN'.
/// Uses [InboxController] from Plan-F Task 1 — no new controller needed.
class AdminApprovalsScreen extends StatelessWidget {
  const AdminApprovalsScreen({
    super.key,
    required this.controller,
    required this.onOpenItem,
  });

  final InboxController controller;
  final void Function(InboxItem) onOpenItem;

  @override
  Widget build(BuildContext context) {
    return InboxScreen(
      controller: controller,
      onOpenItem: onOpenItem,
    );
  }
}
