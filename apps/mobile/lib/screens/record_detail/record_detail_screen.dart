import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/record_detail_controller.dart';

class RecordDetailScreen extends StatefulWidget {
  const RecordDetailScreen({super.key, required this.controller});

  final RecordDetailController controller;

  @override
  State<RecordDetailScreen> createState() => _RecordDetailScreenState();
}

class _RecordDetailScreenState extends State<RecordDetailScreen> {
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
          '근무 기록',
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
        return _body(c.data!);
      }),
    );
  }

  Widget _body(Map<String, dynamic> d) {
    final rows = [
      ('날짜', d['date'] as String? ?? '-'),
      ('출근', d['clock_in'] as String? ?? '-'),
      ('퇴근', d['clock_out'] as String? ?? '-'),
      ('휴식', d['break_minutes'] != null ? '${d['break_minutes']}분' : '-'),
      ('총 시간', d['total_minutes'] != null ? '${d['total_minutes']}분' : '-'),
      ('위치', d['location'] as String? ?? '-'),
    ];
    return ListView(
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
