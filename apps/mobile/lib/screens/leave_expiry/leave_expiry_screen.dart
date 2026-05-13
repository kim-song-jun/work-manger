import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/leave_expiry_controller.dart';

class LeaveExpiryScreen extends StatefulWidget {
  const LeaveExpiryScreen({super.key, required this.controller});
  final LeaveExpiryController controller;

  @override
  State<LeaveExpiryScreen> createState() => _LeaveExpiryScreenState();
}

class _LeaveExpiryScreenState extends State<LeaveExpiryScreen> {
  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_on);
    widget.controller.load();
  }

  @override
  void dispose() {
    widget.controller.removeListener(_on);
    super.dispose();
  }

  void _on() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text(
          '만료 임박 휴가',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: c.load,
        child: c.items.isEmpty && !c.loading
            ? const Center(child: Text('비어있습니다.'))
            : ListView.builder(
                itemCount: c.items.length,
                itemBuilder: (_, i) => _tile(c.items[i]),
              ),
      ),
    );
  }

  Widget _tile(Map<String, dynamic> it) {
    final remainingDays = (it['remaining_days'] as num?)?.toInt() ?? 99;
    final bg = remainingDays < 7 ? WMTokens.dangerSoft : WMTokens.white;
    final expiresAt = (it['expires_at'] as String?) ?? '';
    final type = (it['type'] as String?) ?? '';

    return ListTile(
      tileColor: bg,
      title: Text(type),
      subtitle: Text(
        '만료: $expiresAt · 잔여: $remainingDays 일',
        style: const TextStyle(color: WMTokens.grey600),
      ),
    );
  }
}
