import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/inbox_quick_controller.dart';

class InboxQuickScreen extends StatefulWidget {
  const InboxQuickScreen({super.key, required this.controller});
  final InboxQuickController controller;

  @override
  State<InboxQuickScreen> createState() => _InboxQuickScreenState();
}

class _InboxQuickScreenState extends State<InboxQuickScreen> {
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

  static const _kindColors = {
    'LEAVE': WMTokens.blue50,
    'OVERTIME': WMTokens.warnSoft,
    'TRIP': WMTokens.infoSoft,
    'NOTICE': WMTokens.grey100,
  };

  static const _kindLabels = {
    'LEAVE': '휴가',
    'OVERTIME': '연장',
    'TRIP': '출장',
    'NOTICE': '공지',
  };

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text(
          '빠른 받은함',
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
    final title = (it['title'] as String?) ?? '';
    final at = (it['requested_at'] as String?) ??
        (it['at'] as String?) ??
        '';
    final kind = (it['kind'] as String?) ?? '';
    final chipColor = _kindColors[kind] ?? WMTokens.grey100;
    final kindLabel = _kindLabels[kind] ?? kind;

    return ListTile(
      tileColor: WMTokens.white,
      title: Text(title),
      subtitle: Text(at, style: const TextStyle(color: WMTokens.grey600)),
      trailing: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: chipColor,
          borderRadius: BorderRadius.circular(WMTokens.rPill),
        ),
        child: Text(kindLabel, style: const TextStyle(fontSize: 12)),
      ),
    );
  }
}
