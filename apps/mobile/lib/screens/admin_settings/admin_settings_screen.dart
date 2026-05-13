import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/admin_settings_controller.dart';

class AdminSettingsScreen extends StatefulWidget {
  const AdminSettingsScreen({
    super.key,
    required this.controller,
    required this.onOpenWebView,
  });

  final AdminSettingsController controller;
  final void Function(String path) onOpenWebView;

  @override
  State<AdminSettingsScreen> createState() => _AdminSettingsScreenState();
}

class _AdminSettingsScreenState extends State<AdminSettingsScreen> {
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
          '회사 설정',
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
            if (c.loading && c.settings == null)
              const LinearProgressIndicator(minHeight: 2),
            if (c.error != null) _errorBanner(c.error!),
            if (c.settings != null) ..._cards(c.settings!),
            const SizedBox(height: WMTokens.sp6),
            _editButton(),
          ],
        ),
      ),
    );
  }

  List<Widget> _cards(CompanySettings s) {
    return [
      _InfoCard(
        label: '회사명',
        child: Text(
          s.companyName.isNotEmpty ? s.companyName : '—',
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: WMTokens.grey900,
          ),
        ),
      ),
      const SizedBox(height: WMTokens.sp3),
      _InfoCard(
        label: '회계연도 시작',
        child: Text(
          s.fiscalYearStart.isNotEmpty ? s.fiscalYearStart : '—',
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: WMTokens.grey900,
          ),
        ),
      ),
      const SizedBox(height: WMTokens.sp3),
      _InfoCard(
        label: '브랜드 컬러',
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: _parseHex(s.brandColor),
                borderRadius: BorderRadius.circular(WMTokens.rSm),
                border: Border.all(color: WMTokens.grey200),
              ),
            ),
            const SizedBox(width: WMTokens.sp2),
            Text(
              s.brandColor,
              style: const TextStyle(
                fontSize: 14,
                color: WMTokens.grey700,
                fontFamily: 'monospace',
              ),
            ),
          ],
        ),
      ),
      if (s.logoUrl != null && s.logoUrl!.isNotEmpty) ...[
        const SizedBox(height: WMTokens.sp3),
        _InfoCard(
          label: '로고',
          child: ClipRRect(
            borderRadius: BorderRadius.circular(WMTokens.rSm),
            child: Image.network(
              s.logoUrl!,
              height: 48,
              fit: BoxFit.contain,
              errorBuilder: (_, __, ___) => Text(
                s.logoUrl!,
                style: const TextStyle(
                  fontSize: 12,
                  color: WMTokens.grey600,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),
        ),
      ],
    ];
  }

  Widget _editButton() {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: () => widget.onOpenWebView('/admin/settings'),
        icon: const Icon(Icons.open_in_new, size: 18),
        label: const Text('WebView 에서 수정'),
        style: OutlinedButton.styleFrom(
          foregroundColor: WMTokens.blue500,
          side: const BorderSide(color: WMTokens.blue500),
          padding: const EdgeInsets.symmetric(vertical: WMTokens.sp3),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(WMTokens.rMd),
          ),
        ),
      ),
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

  static Color _parseHex(String hex) {
    final cleaned = hex.replaceAll('#', '');
    if (cleaned.length == 6) {
      final val = int.tryParse('FF$cleaned', radix: 16);
      if (val != null) return Color(val);
    }
    return WMTokens.blue500;
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.label, required this.child});

  final String label;
  final Widget child;

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
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: WMTokens.grey600,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: WMTokens.sp2),
          child,
        ],
      ),
    );
  }
}
