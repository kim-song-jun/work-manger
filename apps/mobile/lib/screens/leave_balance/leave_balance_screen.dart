import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/leave_balance_controller.dart';

class LeaveBalanceScreen extends StatefulWidget {
  const LeaveBalanceScreen({super.key, required this.controller, required this.onApply});
  final LeaveBalanceController controller;
  final VoidCallback onApply;

  @override
  State<LeaveBalanceScreen> createState() => _LeaveBalanceScreenState();
}

class _LeaveBalanceScreenState extends State<LeaveBalanceScreen> {
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

  void _on() => mounted ? setState(() {}) : null;

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    final d = c.data;
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text('휴가 잔여', style: TextStyle(fontWeight: FontWeight.w700)),
        backgroundColor: WMTokens.white,
        elevation: 0,
        actions: [
          TextButton(onPressed: widget.onApply, child: const Text('신청')),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: c.load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (c.loading && d == null) const LinearProgressIndicator(minHeight: 2),
            if (d != null) ...[
              _bucket('연차', d.annual),
              const SizedBox(height: 12),
              _bucket('보상', d.comp),
              const SizedBox(height: 24),
              const Text(
                '최근 신청',
                style: TextStyle(fontWeight: FontWeight.w700, color: WMTokens.grey900),
              ),
              const SizedBox(height: 8),
              ...d.recent.map(
                (r) => Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: WMTokens.white,
                    borderRadius: BorderRadius.circular(WMTokens.rMd),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          '${r['type'] ?? ''} · ${r['from'] ?? ''} ~ ${r['to'] ?? ''}',
                          style: const TextStyle(color: WMTokens.grey900),
                        ),
                      ),
                      Text(
                        r['status']?.toString() ?? '',
                        style: const TextStyle(color: WMTokens.grey600, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ),
            ],
            if (c.error != null)
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Text(c.error!, style: const TextStyle(color: WMTokens.danger)),
              ),
          ],
        ),
      ),
    );
  }

  Widget _bucket(String label, Map<String, num> b) {
    final total = b['total'] ?? 0;
    final used = b['used'] ?? 0;
    final remaining = b['remaining'] ?? 0;
    final progress = total > 0 ? (used / total).toDouble().clamp(0.0, 1.0) : 0.0;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: WMTokens.white,
        borderRadius: BorderRadius.circular(WMTokens.rMd),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                label,
                style: const TextStyle(fontWeight: FontWeight.w700, color: WMTokens.grey900),
              ),
              const Spacer(),
              Text(
                '$remaining / $total일',
                style: const TextStyle(color: WMTokens.grey900, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 4,
              backgroundColor: WMTokens.grey200,
              valueColor: const AlwaysStoppedAnimation(WMTokens.blue500),
            ),
          ),
          const SizedBox(height: 6),
          Text('사용 $used일', style: const TextStyle(color: WMTokens.grey600, fontSize: 12)),
        ],
      ),
    );
  }
}
