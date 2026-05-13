import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/admin_reports_controller.dart';

class AdminReportsScreen extends StatefulWidget {
  const AdminReportsScreen({super.key, required this.controller});
  final AdminReportsController controller;

  @override
  State<AdminReportsScreen> createState() => _AdminReportsScreenState();
}

class _AdminReportsScreenState extends State<AdminReportsScreen> {
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

  void _onDownload(String name) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$name — 준비 중')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text(
          '리포트',
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
    final name = (it['name'] as String?) ?? '';
    final period = (it['period'] as String?) ?? '';

    return ListTile(
      tileColor: WMTokens.white,
      title: Text(name),
      subtitle: Text(period, style: const TextStyle(color: WMTokens.grey600)),
      trailing: IconButton(
        icon: const Icon(Icons.download_outlined, color: WMTokens.blue500),
        onPressed: () => _onDownload(name),
        tooltip: '다운로드',
      ),
    );
  }
}
