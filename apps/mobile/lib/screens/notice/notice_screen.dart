import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../theme/tokens.g.dart';
import 'state/notice_controller.dart';

class NoticeScreen extends StatefulWidget {
  const NoticeScreen({
    super.key,
    required this.controller,
    required this.onOpenWebView,
  });

  final NoticeController controller;
  final void Function(String path) onOpenWebView;

  @override
  State<NoticeScreen> createState() => _NoticeScreenState();
}

class _NoticeScreenState extends State<NoticeScreen> {
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
          '공지',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: Column(
        children: [
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
                      itemBuilder: (_, i) => _NoticeTile(
                        item: c.items[i],
                        onTap: () => widget
                            .onOpenWebView('/m/notice/${c.items[i].id}'),
                      ),
                    ),
            ),
          ),
        ],
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
        Icon(Icons.campaign_outlined, size: 64, color: WMTokens.grey400),
        SizedBox(height: 12),
        Center(
          child: Text(
            '공지사항이 없습니다.',
            style: TextStyle(color: WMTokens.grey600, fontSize: 14),
          ),
        ),
      ],
    );
  }
}

class _NoticeTile extends StatelessWidget {
  const _NoticeTile({required this.item, required this.onTap});

  final NoticeItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final dateStr = DateFormat('yyyy.MM.dd').format(item.publishedAt);
    return InkWell(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: WMTokens.white,
          borderRadius: BorderRadius.circular(WMTokens.rMd),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    item.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                      color: WMTokens.grey900,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  dateStr,
                  style: const TextStyle(
                    fontSize: 12,
                    color: WMTokens.grey500,
                  ),
                ),
              ],
            ),
            if (item.bodyExcerpt.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                item.bodyExcerpt,
                style: const TextStyle(
                  fontSize: 13,
                  color: WMTokens.grey600,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
