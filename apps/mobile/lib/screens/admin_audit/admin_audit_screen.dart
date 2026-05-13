import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/admin_audit_controller.dart';

class AdminAuditScreen extends StatefulWidget {
  const AdminAuditScreen({super.key, required this.controller});
  final AdminAuditController controller;

  @override
  State<AdminAuditScreen> createState() => _AdminAuditScreenState();
}

class _AdminAuditScreenState extends State<AdminAuditScreen> {
  static const _filters = [
    ('ALL', '전체'),
    ('LOGIN', '로그인'),
    ('APPROVAL', '승인'),
    ('SETTINGS', '설정'),
  ];

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
          '감사 로그',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          _filterChips(),
          if (c.loading && c.items.isEmpty)
            const LinearProgressIndicator(minHeight: 2),
          Expanded(
            child: RefreshIndicator(
              onRefresh: c.load,
              child: c.items.isEmpty && !c.loading
                  ? const Center(child: Text('비어있습니다.'))
                  : ListView.builder(
                      itemCount: c.items.length,
                      itemBuilder: (_, i) => _tile(c.items[i]),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _filterChips() {
    return Container(
      height: 48,
      color: WMTokens.white,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Row(
        children: _filters.map((f) {
          final selected = widget.controller.filter == f.$1;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(f.$2),
              selected: selected,
              onSelected: (_) => widget.controller.setFilter(f.$1),
              selectedColor: WMTokens.blue50,
              labelStyle: TextStyle(
                color: selected ? WMTokens.blue600 : WMTokens.grey700,
                fontSize: 13,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _tile(Map<String, dynamic> it) {
    final action = (it['action'] as String?) ?? '';
    final actor = (it['actor'] as String?) ?? '';
    final at = (it['at'] as String?) ?? (it['created_at'] as String?) ?? '';

    return ListTile(
      tileColor: WMTokens.white,
      title: Text(action),
      subtitle: Text(
        '$actor · $at',
        style: const TextStyle(color: WMTokens.grey600),
      ),
    );
  }
}
