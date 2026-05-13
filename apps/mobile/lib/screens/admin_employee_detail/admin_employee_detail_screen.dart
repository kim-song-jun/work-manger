import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/admin_employee_detail_controller.dart';

class AdminEmployeeDetailScreen extends StatefulWidget {
  const AdminEmployeeDetailScreen({
    super.key,
    required this.controller,
    required this.onOpenWebView,
  });

  final AdminEmployeeDetailController controller;
  final void Function(String path) onOpenWebView;

  @override
  State<AdminEmployeeDetailScreen> createState() =>
      _AdminEmployeeDetailScreenState();
}

class _AdminEmployeeDetailScreenState
    extends State<AdminEmployeeDetailScreen> {
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
          '직원 상세',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: Builder(builder: (_) {
        if (c.loading) {
          return const Center(child: CircularProgressIndicator());
        }
        if (c.error != null) {
          return _errorView(c.error!);
        }
        if (c.data == null) {
          return const SizedBox.shrink();
        }
        return _body(c);
      }),
    );
  }

  Widget _body(AdminEmployeeDetailController c) {
    final d = c.data!;
    final status = d['status'] as String? ?? 'ACTIVE';
    final isActive = status == 'ACTIVE';
    final rows = [
      ('이름', d['name'] as String? ?? '-'),
      ('이메일', d['email'] as String? ?? '-'),
      ('부서', d['department'] as String? ?? '-'),
      ('직급', d['position'] as String? ?? '-'),
      ('입사일', d['hire_date'] as String? ?? '-'),
      ('상태', isActive ? '재직' : '휴직'),
    ];
    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(WMTokens.sp4),
            children: [
              Container(
                decoration: BoxDecoration(
                  color: WMTokens.white,
                  borderRadius: BorderRadius.circular(WMTokens.rLg),
                ),
                child: Column(
                  children: List.generate(rows.length, (i) {
                    final (label, value) = rows[i];
                    return _KvRow(
                      label: label,
                      value: value,
                      divider: i < rows.length - 1,
                    );
                  }),
                ),
              ),
            ],
          ),
        ),
        _actionBar(c),
      ],
    );
  }

  Widget _actionBar(AdminEmployeeDetailController c) {
    return Container(
      padding: const EdgeInsets.fromLTRB(
        WMTokens.sp4,
        WMTokens.sp3,
        WMTokens.sp4,
        WMTokens.sp6,
      ),
      decoration: const BoxDecoration(
        color: WMTokens.white,
        border: Border(top: BorderSide(color: WMTokens.grey100)),
      ),
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: () =>
              widget.onOpenWebView('/admin/employees/${c.id}'),
          style: ElevatedButton.styleFrom(
            backgroundColor: WMTokens.blue500,
            foregroundColor: WMTokens.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(WMTokens.rMd),
            ),
            elevation: 0,
          ),
          child: const Text(
            'WebView 에서 편집',
            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
          ),
        ),
      ),
    );
  }

  Widget _errorView(String msg) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(WMTokens.sp4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, color: WMTokens.danger, size: 48),
            const SizedBox(height: 12),
            Text(
              msg,
              textAlign: TextAlign.center,
              style: const TextStyle(color: WMTokens.danger, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }
}

class _KvRow extends StatelessWidget {
  const _KvRow({
    required this.label,
    required this.value,
    this.divider = true,
  });

  final String label;
  final String value;
  final bool divider;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: WMTokens.sp4,
            vertical: WMTokens.sp3,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 80,
                child: Text(
                  label,
                  style: const TextStyle(
                    color: WMTokens.grey600,
                    fontSize: 14,
                  ),
                ),
              ),
              Expanded(
                child: Text(
                  value,
                  style: const TextStyle(
                    color: WMTokens.grey900,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
        if (divider)
          const Divider(height: 1, color: WMTokens.grey100, indent: WMTokens.sp4),
      ],
    );
  }
}
