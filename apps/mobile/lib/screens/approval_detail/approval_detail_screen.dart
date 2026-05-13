import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/approval_detail_controller.dart';

class ApprovalDetailScreen extends StatefulWidget {
  const ApprovalDetailScreen({super.key, required this.controller});

  final ApprovalDetailController controller;

  @override
  State<ApprovalDetailScreen> createState() => _ApprovalDetailScreenState();
}

class _ApprovalDetailScreenState extends State<ApprovalDetailScreen> {
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

  Future<void> _decide(String action) async {
    final ok = await widget.controller.decide(action);
    if (ok && mounted) {
      Navigator.of(context).pop(action);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text(
          '결재',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: Builder(builder: (_) {
        if (c.loading) {
          return const Center(child: CircularProgressIndicator());
        }
        if (c.error != null) {
          return _errorView(c.error!);
        }
        if (c.data == null) {
          return const SizedBox.shrink();
        }
        return _body(c);
      }),
    );
  }

  Widget _body(ApprovalDetailController c) {
    final d = c.data!;
    final rows = [
      ('종류', d['kind'] as String? ?? '-'),
      ('신청자', d['requester_name'] as String? ?? '-'),
      ('신청일', d['requested_at'] as String? ?? '-'),
      ('상세', d['detail'] as String? ?? '-'),
    ];
    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(WMTokens.sp4),
            children: [
              Container(
                decoration: BoxDecoration(
                  color: WMTokens.white,
                  borderRadius: BorderRadius.circular(WMTokens.rLg),
                ),
                child: Column(
                  children: List.generate(rows.length, (i) {
                    final (label, value) = rows[i];
                    return _KvRow(
                      label: label,
                      value: value,
                      divider: i < rows.length - 1,
                    );
                  }),
                ),
              ),
            ],
          ),
        ),
        _actionBar(c),
      ],
    );
  }

  Widget _actionBar(ApprovalDetailController c) {
    return Container(
      padding: const EdgeInsets.fromLTRB(
        WMTokens.sp4,
        WMTokens.sp3,
        WMTokens.sp4,
        WMTokens.sp6,
      ),
      decoration: const BoxDecoration(
        color: WMTokens.white,
        border: Border(top: BorderSide(color: WMTokens.grey100)),
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: c.deciding ? null : () => _decide('REJECT'),
              style: OutlinedButton.styleFrom(
                foregroundColor: WMTokens.danger,
                side: const BorderSide(color: WMTokens.danger),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(WMTokens.rMd),
                ),
              ),
              child: c.deciding
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text(
                      '반려',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                      ),
                    ),
            ),
          ),
          const SizedBox(width: WMTokens.sp3),
          Expanded(
            child: ElevatedButton(
              onPressed: c.deciding ? null : () => _decide('APPROVE'),
              style: ElevatedButton.styleFrom(
                backgroundColor: WMTokens.blue500,
                foregroundColor: WMTokens.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(WMTokens.rMd),
                ),
                elevation: 0,
              ),
              child: c.deciding
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: WMTokens.white,
                      ),
                    )
                  : const Text(
                      '승인',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _errorView(String msg) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(WMTokens.sp4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, color: WMTokens.danger, size: 48),
            const SizedBox(height: 12),
            Text(
              msg,
              textAlign: TextAlign.center,
              style: const TextStyle(color: WMTokens.danger, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }
}

class _KvRow extends StatelessWidget {
  const _KvRow({
    required this.label,
    required this.value,
    this.divider = true,
  });

  final String label;
  final String value;
  final bool divider;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: WMTokens.sp4,
            vertical: WMTokens.sp3,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 80,
                child: Text(
                  label,
                  style: const TextStyle(
                    color: WMTokens.grey600,
                    fontSize: 14,
                  ),
                ),
              ),
              Expanded(
                child: Text(
                  value,
                  style: const TextStyle(
                    color: WMTokens.grey900,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
        if (divider)
          const Divider(height: 1, color: WMTokens.grey100, indent: WMTokens.sp4),
      ],
    );
  }
}
