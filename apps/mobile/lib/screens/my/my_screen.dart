import 'package:flutter/material.dart';

import '../../api/jwt_store.dart';
import '../../theme/tokens.g.dart';
import '../help/help_screen.dart';
import 'state/my_controller.dart';

class MyScreen extends StatefulWidget {
  const MyScreen({
    super.key,
    required this.controller,
    this.onOpenWebView,
    this.onLogout,
  });
  final MyController controller;
  final void Function(String path)? onOpenWebView;

  /// Called after JWT is cleared. Caller should navigate to login.
  final VoidCallback? onLogout;

  @override
  State<MyScreen> createState() => _MyScreenState();
}

class _MyScreenState extends State<MyScreen> {
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

  Future<void> _confirmLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('로그아웃'),
        content: const Text('정말 로그아웃하시겠습니까?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('로그아웃', style: TextStyle(color: WMTokens.danger)),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await JwtStore().clear();
      widget.onLogout?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    final p = c.profile;
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text('내 정보', style: TextStyle(fontWeight: FontWeight.w700)),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: c.load,
        child: ListView(
          padding: const EdgeInsets.all(WMTokens.sp4),
          children: [
            if (c.loading && p == null) const LinearProgressIndicator(minHeight: 2),
            // Profile header card
            Container(
              padding: const EdgeInsets.all(WMTokens.sp4),
              decoration: BoxDecoration(
                color: WMTokens.white,
                borderRadius: BorderRadius.circular(WMTokens.rLg),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: WMTokens.blue500,
                    child: Text(
                      p != null && p.name.isNotEmpty ? p.name[0] : '?',
                      style: const TextStyle(
                        color: WMTokens.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(width: WMTokens.sp4),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          p?.name ?? '-',
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 17,
                            color: WMTokens.grey900,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          p?.email ?? '',
                          style: const TextStyle(color: WMTokens.grey600, fontSize: 13),
                        ),
                        if (p != null && p.role.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: WMTokens.blue50,
                                borderRadius: BorderRadius.circular(WMTokens.rSm),
                              ),
                              child: Text(
                                p.role,
                                style: const TextStyle(
                                  color: WMTokens.blue600,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: WMTokens.sp4),
            // Sub-menu
            Container(
              decoration: BoxDecoration(
                color: WMTokens.white,
                borderRadius: BorderRadius.circular(WMTokens.rLg),
              ),
              child: Column(
                children: [
                  _tile(
                    icon: Icons.person_outline,
                    label: '프로필',
                    onTap: () => widget.onOpenWebView?.call('/m/profile-full'),
                  ),
                  _divider(),
                  _tile(
                    icon: Icons.lock_outline,
                    label: '비밀번호 변경',
                    onTap: () => widget.onOpenWebView?.call('/m/settings/password'),
                  ),
                  _divider(),
                  _tile(
                    icon: Icons.security_outlined,
                    label: '2단계 인증',
                    onTap: () => widget.onOpenWebView?.call('/m/settings/2fa'),
                  ),
                  _divider(),
                  _tile(
                    icon: Icons.notifications_outlined,
                    label: '알림 설정',
                    onTap: () => widget.onOpenWebView?.call('/m/notifications'),
                  ),
                  _divider(),
                  _tile(
                    icon: Icons.palette_outlined,
                    label: '화면 꾸미기',
                    onTap: () => widget.onOpenWebView?.call('/m/customize'),
                  ),
                  _divider(),
                  _tile(
                    icon: Icons.help_outline,
                    label: '도움말',
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute<void>(
                        builder: (_) => HelpScreen(onOpenWebView: widget.onOpenWebView),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: WMTokens.sp4),
            Container(
              decoration: BoxDecoration(
                color: WMTokens.white,
                borderRadius: BorderRadius.circular(WMTokens.rLg),
              ),
              child: _tile(
                icon: Icons.logout,
                label: '로그아웃',
                labelColor: WMTokens.danger,
                iconColor: WMTokens.danger,
                onTap: _confirmLogout,
              ),
            ),
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

  Widget _tile({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    Color labelColor = WMTokens.grey900,
    Color iconColor = WMTokens.grey500,
  }) {
    return ListTile(
      leading: Icon(icon, color: iconColor, size: 22),
      title: Text(
        label,
        style: TextStyle(color: labelColor, fontWeight: FontWeight.w500, fontSize: 15),
      ),
      trailing: const Icon(Icons.chevron_right, color: WMTokens.grey300, size: 20),
      onTap: onTap,
    );
  }

  Widget _divider() {
    return const Divider(height: 1, indent: 56, endIndent: 16, color: WMTokens.grey100);
  }
}
