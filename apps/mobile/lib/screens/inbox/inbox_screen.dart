import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/inbox_controller.dart';
import 'widgets/inbox_item_tile.dart';

class InboxScreen extends StatefulWidget {
  const InboxScreen({
    super.key,
    required this.controller,
    required this.onOpenItem,
  });

  final InboxController controller;
  final void Function(InboxItem) onOpenItem;

  @override
  State<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends State<InboxScreen> {
  static const _tabs = [
    ('ALL', '전체'),
    ('LEAVE', '휴가'),
    ('OVERTIME', '연장'),
    ('TRIP', '출장'),
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
          '받은 함',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          if (c.role == 'MANAGER' ||
              c.role == 'ADMIN' ||
              c.role == 'OWNER')
            _tabBar(),
          if (c.loading && c.items.isEmpty)
            const LinearProgressIndicator(minHeight: 2),
          if (c.error != null) _errorBanner(c.error!),
          Expanded(
            child: RefreshIndicator(
              onRefresh: c.load,
              child: c.items.isEmpty && !c.loading
                  ? _empty()
                  : ListView.builder(
                      itemCount: c.items.length,
                      itemBuilder: (_, i) => InboxItemTile(
                        item: c.items[i],
                        onTap: () => widget.onOpenItem(c.items[i]),
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _tabBar() {
    return Container(
      height: 44,
      color: WMTokens.white,
      child: Row(
        children: _tabs.map((t) {
          final selected = widget.controller.tabKind == t.$1;
          return Expanded(
            child: InkWell(
              onTap: () => widget.controller.setTab(t.$1),
              child: Center(
                child: Text(
                  t.$2,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight:
                        selected ? FontWeight.w700 : FontWeight.w400,
                    color: selected ? WMTokens.blue500 : WMTokens.grey600,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _errorBanner(String msg) {
    return Container(
      margin: const EdgeInsets.all(12),
      padding: const EdgeInsets.all(12),
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

  Widget _empty() {
    return ListView(
      children: const [
        SizedBox(height: 80),
        Icon(Icons.inbox_outlined, size: 64, color: WMTokens.grey400),
        SizedBox(height: 12),
        Center(
          child: Text(
            '받은 함이 비어있습니다.',
            style: TextStyle(color: WMTokens.grey600, fontSize: 14),
          ),
        ),
      ],
    );
  }
}
