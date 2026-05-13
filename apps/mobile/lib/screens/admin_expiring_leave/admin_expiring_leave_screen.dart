import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/admin_expiring_leave_controller.dart';

class AdminExpiringLeaveScreen extends StatefulWidget {
  const AdminExpiringLeaveScreen({super.key, required this.controller});
  final AdminExpiringLeaveController controller;

  @override
  State<AdminExpiringLeaveScreen> createState() =>
      _AdminExpiringLeaveScreenState();
}

class _AdminExpiringLeaveScreenState extends State<AdminExpiringLeaveScreen> {
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
          '만료 임박 휴가 (팀)',
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
    final employeeName = (it['employee_name'] as String?) ??
        (it['name'] as String?) ??
        '';
    final leaveType = (it['leave_type'] as String?) ??
        (it['type'] as String?) ??
        '';
    final daysLeft = (it['days_left'] as num?)?.toInt() ??
        (it['remaining_days'] as num?)?.toInt() ??
        99;
    final bg = daysLeft < 7 ? WMTokens.dangerSoft : WMTokens.white;

    return ListTile(
      tileColor: bg,
      title: Text(employeeName),
      subtitle: Text(
        '$leaveType · 잔여 $daysLeft 일',
        style: const TextStyle(color: WMTokens.grey600),
      ),
      trailing: daysLeft < 7
          ? const Icon(Icons.schedule, color: WMTokens.danger, size: 18)
          : null,
    );
  }
}
