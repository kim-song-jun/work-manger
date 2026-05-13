import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/admin_employees_controller.dart';

class AdminEmployeesScreen extends StatefulWidget {
  const AdminEmployeesScreen({
    super.key,
    required this.controller,
    required this.onOpenWebView,
    this.onOpenEmployee,
  });

  final AdminEmployeesController controller;
  final void Function(String path) onOpenWebView;

  /// If provided, tapping an employee row pushes the native detail screen
  /// instead of falling back to WebView.
  final void Function(String id)? onOpenEmployee;

  @override
  State<AdminEmployeesScreen> createState() => _AdminEmployeesScreenState();
}

class _AdminEmployeesScreenState extends State<AdminEmployeesScreen> {
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_on);
    widget.controller.load();
  }

  @override
  void dispose() {
    widget.controller.removeListener(_on);
    _searchCtrl.dispose();
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
          '직원 관리',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          _searchBar(c),
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
                      itemBuilder: (_, i) => _EmployeeTile(
                        item: c.items[i],
                        onTap: () {
                          final id = c.items[i].id;
                          if (widget.onOpenEmployee != null) {
                            widget.onOpenEmployee!(id);
                          } else {
                            widget.onOpenWebView('/admin/employees/$id');
                          }
                        },
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _searchBar(AdminEmployeesController c) {
    return Container(
      color: WMTokens.white,
      padding: const EdgeInsets.fromLTRB(
        WMTokens.sp4,
        WMTokens.sp3,
        WMTokens.sp4,
        WMTokens.sp3,
      ),
      child: TextField(
        controller: _searchCtrl,
        onChanged: c.search,
        decoration: InputDecoration(
          hintText: '이름으로 검색',
          hintStyle: const TextStyle(color: WMTokens.grey400, fontSize: 14),
          prefixIcon: const Icon(Icons.search, color: WMTokens.grey400),
          filled: true,
          fillColor: WMTokens.grey100,
          contentPadding: const EdgeInsets.symmetric(vertical: 10),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(WMTokens.rMd),
            borderSide: BorderSide.none,
          ),
        ),
      ),
    );
  }

  Widget _errorBanner(String msg) {
    return Container(
      margin: const EdgeInsets.all(WMTokens.sp3),
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

  Widget _empty() {
    return ListView(
      children: const [
        SizedBox(height: 80),
        Icon(Icons.people_outline, size: 64, color: WMTokens.grey400),
        SizedBox(height: 12),
        Center(
          child: Text(
            '직원이 없습니다.',
            style: TextStyle(color: WMTokens.grey600, fontSize: 14),
          ),
        ),
      ],
    );
  }
}

class _EmployeeTile extends StatelessWidget {
  const _EmployeeTile({required this.item, required this.onTap});

  final EmployeeItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isActive = item.status == 'ACTIVE';
    return ListTile(
      tileColor: WMTokens.white,
      leading: CircleAvatar(
        backgroundColor: WMTokens.blue50,
        child: Text(
          item.name.isNotEmpty ? item.name[0] : '?',
          style: const TextStyle(
            color: WMTokens.blue500,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      title: Text(
        item.name,
        style: const TextStyle(
          fontWeight: FontWeight.w600,
          color: WMTokens.grey900,
        ),
      ),
      subtitle: Text(
        item.role,
        style: const TextStyle(color: WMTokens.grey600, fontSize: 13),
      ),
      trailing: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: isActive ? WMTokens.successSoft : WMTokens.warnSoft,
          borderRadius: BorderRadius.circular(WMTokens.rPill),
        ),
        child: Text(
          isActive ? '재직' : '휴직',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isActive ? WMTokens.success : WMTokens.warn,
          ),
        ),
      ),
      onTap: onTap,
    );
  }
}
