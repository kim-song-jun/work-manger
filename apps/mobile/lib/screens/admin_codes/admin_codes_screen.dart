import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../theme/tokens.g.dart';
import 'state/admin_codes_controller.dart';

class AdminCodesScreen extends StatefulWidget {
  const AdminCodesScreen({super.key, required this.controller});
  final AdminCodesController controller;

  @override
  State<AdminCodesScreen> createState() => _AdminCodesScreenState();
}

class _AdminCodesScreenState extends State<AdminCodesScreen> {
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

  Future<void> _copy(String code) async {
    await Clipboard.setData(ClipboardData(text: code));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('복사됨')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text(
          '회사 코드',
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
    final code = (it['code'] as String?) ?? '';
    final status = (it['status'] as String?) ?? '';
    final expiresAt = (it['expires_at'] as String?) ?? '';
    final isActive = status.toUpperCase() == 'ACTIVE';

    return ListTile(
      tileColor: WMTokens.white,
      title: Text(
        code,
        style: const TextStyle(fontFamily: 'monospace', letterSpacing: 1.2),
      ),
      subtitle: Text(
        '${isActive ? '활성' : '만료'} · $expiresAt',
        style: TextStyle(
          color: isActive ? WMTokens.success : WMTokens.grey400,
        ),
      ),
      trailing: IconButton(
        icon: const Icon(Icons.copy_outlined, color: WMTokens.blue500),
        onPressed: () => _copy(code),
        tooltip: '복사',
      ),
    );
  }
}
