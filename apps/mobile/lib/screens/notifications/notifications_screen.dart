import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/notifications_controller.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key, required this.controller});
  final NotificationsController controller;

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
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

  String _ago(String? raw) {
    if (raw == null) return '';
    final dt = DateTime.tryParse(raw);
    if (dt == null) return raw;
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return '방금';
    if (diff.inMinutes < 60) return '${diff.inMinutes}분 전';
    if (diff.inHours < 24) return '${diff.inHours}시간 전';
    return '${diff.inDays}일 전';
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text('알림', style: TextStyle(fontWeight: FontWeight.w700)),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: c.load,
        child: ListView(
          padding: const EdgeInsets.all(WMTokens.sp4),
          children: [
            if (c.loading && c.items.isEmpty) const LinearProgressIndicator(minHeight: 2),
            if (c.items.isEmpty && !c.loading && c.error == null)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 48),
                child: Center(
                  child: Text('알림이 없습니다.', style: TextStyle(color: WMTokens.grey500)),
                ),
              ),
            ...c.items.map((item) {
              final id = item['id']?.toString() ?? '';
              final isRead = item['is_read'] == true;
              final title = item['title']?.toString() ?? '';
              final body = item['body']?.toString() ?? item['message']?.toString() ?? '';
              final createdAt = item['created_at']?.toString();
              return GestureDetector(
                onTap: isRead ? null : () => c.markRead(id),
                child: Container(
                  margin: const EdgeInsets.only(bottom: WMTokens.sp2),
                  decoration: BoxDecoration(
                    color: isRead ? WMTokens.white : WMTokens.blue50,
                    borderRadius: BorderRadius.circular(WMTokens.rMd),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: WMTokens.sp4,
                      vertical: WMTokens.sp1,
                    ),
                    leading: Stack(
                      clipBehavior: Clip.none,
                      children: [
                        const CircleAvatar(
                          radius: 20,
                          backgroundColor: WMTokens.grey100,
                          child: Icon(Icons.notifications_outlined, color: WMTokens.grey500, size: 20),
                        ),
                        if (!isRead)
                          Positioned(
                            top: 0,
                            right: 0,
                            child: Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: WMTokens.blue500,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                      ],
                    ),
                    title: Text(
                      title,
                      style: TextStyle(
                        fontWeight: isRead ? FontWeight.w500 : FontWeight.w700,
                        color: WMTokens.grey900,
                        fontSize: 14,
                      ),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (body.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 2),
                            child: Text(
                              body,
                              style: const TextStyle(color: WMTokens.grey600, fontSize: 13),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(
                            _ago(createdAt),
                            style: const TextStyle(color: WMTokens.grey400, fontSize: 11),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
            if (c.error != null)
              Padding(
                padding: const EdgeInsets.only(top: WMTokens.sp4),
                child: Text(c.error!, style: const TextStyle(color: WMTokens.danger)),
              ),
          ],
        ),
      ),
    );
  }
}
