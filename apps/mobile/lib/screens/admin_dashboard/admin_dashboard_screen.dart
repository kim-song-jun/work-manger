import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/admin_dashboard_controller.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key, required this.controller});

  final AdminDashboardController controller;

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
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
          '대시보드',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: c.load,
        child: ListView(
          padding: const EdgeInsets.all(WMTokens.sp4),
          children: [
            if (c.loading && c.stats == null)
              const LinearProgressIndicator(minHeight: 2),
            if (c.error != null) _errorBanner(c.error!),
            if (c.stats != null) _kpiGrid(c.stats!),
          ],
        ),
      ),
    );
  }

  Widget _kpiGrid(DashboardStats s) {
    final cards = [
      _KpiData(
        label: '전체 직원',
        value: s.employeeCount,
        icon: Icons.people_outline,
        iconColor: WMTokens.blue500,
      ),
      _KpiData(
        label: '오늘 출근',
        value: s.todayAttendance,
        icon: Icons.login_outlined,
        iconColor: WMTokens.success,
      ),
      _KpiData(
        label: '대기 결재',
        value: s.pendingApprovals,
        icon: Icons.pending_actions_outlined,
        iconColor: WMTokens.warn,
      ),
      _KpiData(
        label: '52h 초과',
        value: s.complianceWarnings,
        icon: Icons.warning_amber_outlined,
        iconColor: WMTokens.danger,
      ),
    ];
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: WMTokens.sp3,
      mainAxisSpacing: WMTokens.sp3,
      childAspectRatio: 1.4,
      children: cards.map(_KpiCard.new).toList(),
    );
  }

  Widget _errorBanner(String msg) {
    return Container(
      margin: const EdgeInsets.only(bottom: WMTokens.sp3),
      padding: const EdgeInsets.all(WMTokens.sp3),
      decoration: BoxDecoration(
        color: WMTokens.dangerSoft,
        borderRadius: BorderRadius.circular(WMTokens.rMd),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: WMTokens.danger, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              msg,
              style: const TextStyle(color: WMTokens.danger, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }
}

class _KpiData {
  const _KpiData({
    required this.label,
    required this.value,
    required this.icon,
    required this.iconColor,
  });

  final String label;
  final int value;
  final IconData icon;
  final Color iconColor;
}

class _KpiCard extends StatelessWidget {
  const _KpiCard(this.data);

  final _KpiData data;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(WMTokens.sp4),
      decoration: BoxDecoration(
        color: WMTokens.white,
        borderRadius: BorderRadius.circular(WMTokens.rLg),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 4,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                data.label,
                style: const TextStyle(
                  fontSize: 13,
                  color: WMTokens.grey600,
                ),
              ),
              Icon(data.icon, size: 20, color: data.iconColor),
            ],
          ),
          Text(
            '${data.value}',
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w700,
              color: WMTokens.grey900,
            ),
          ),
        ],
      ),
    );
  }
}
