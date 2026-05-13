import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/admin_compliance_controller.dart';

class AdminComplianceScreen extends StatefulWidget {
  const AdminComplianceScreen({super.key, required this.controller});
  final AdminComplianceController controller;

  @override
  State<AdminComplianceScreen> createState() => _AdminComplianceScreenState();
}

class _AdminComplianceScreenState extends State<AdminComplianceScreen> {
  // 2400 min = 40 h threshold
  static const _thresholdMinutes = 2400;

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
          '52시간 (팀)',
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
    final usedMinutes = (it['used_minutes'] as num?)?.toInt() ?? 0;
    final isOver = usedMinutes >= _thresholdMinutes;
    final bg = isOver ? WMTokens.warnSoft : WMTokens.white;
    final hours = usedMinutes ~/ 60;
    final mins = usedMinutes % 60;

    return ListTile(
      tileColor: bg,
      title: Text(employeeName),
      subtitle: Text(
        '$hours시간 $mins분',
        style: const TextStyle(color: WMTokens.grey600),
      ),
      trailing: isOver
          ? const Icon(Icons.warning_amber_rounded, color: WMTokens.warn)
          : null,
    );
  }
}
