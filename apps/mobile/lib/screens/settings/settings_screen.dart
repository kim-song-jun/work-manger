import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/settings_controller.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key, required this.controller, required this.onOpenWebView});
  final SettingsController controller;
  final void Function(String path) onOpenWebView;

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
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
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text('설정', style: TextStyle(fontWeight: FontWeight.w700)),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: ListView(
        children: [
          const SizedBox(height: 8),
          _section('일반'),
          SwitchListTile(
            tileColor: WMTokens.white,
            title: const Text('네이티브 홈 사용'),
            subtitle: const Text(
              'WebView 대신 Flutter native 홈 사용',
              style: TextStyle(color: WMTokens.grey600, fontSize: 12),
            ),
            value: c.useNativeHome,
            onChanged: c.loading ? null : c.toggleUseNativeHome,
          ),
          _section('계정'),
          ListTile(
            tileColor: WMTokens.white,
            title: const Text('프로필'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => widget.onOpenWebView('/m/profile-full'),
          ),
          ListTile(
            tileColor: WMTokens.white,
            title: const Text('2단계 인증'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => widget.onOpenWebView('/m/settings/2fa'),
          ),
          ListTile(
            tileColor: WMTokens.white,
            title: const Text('비밀번호 변경'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => widget.onOpenWebView('/m/settings/password'),
          ),
          _section('기타'),
          ListTile(
            tileColor: WMTokens.white,
            title: const Text('알림 설정'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => widget.onOpenWebView('/m/notifications'),
          ),
          ListTile(
            tileColor: WMTokens.white,
            title: const Text('화면 꾸미기'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => widget.onOpenWebView('/m/customize'),
          ),
          ListTile(
            tileColor: WMTokens.white,
            title: const Text('도움말'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => widget.onOpenWebView('/m/help'),
          ),
          if (c.error != null)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(c.error!, style: const TextStyle(color: WMTokens.danger)),
            ),
        ],
      ),
    );
  }

  Widget _section(String s) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
    child: Text(
      s,
      style: const TextStyle(fontWeight: FontWeight.w700, color: WMTokens.grey600, fontSize: 12),
    ),
  );
}
