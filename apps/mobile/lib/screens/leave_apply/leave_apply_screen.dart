import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/leave_apply_controller.dart';

class LeaveApplyScreen extends StatefulWidget {
  const LeaveApplyScreen({
    super.key,
    required this.controller,
    required this.onDone,
  });

  final LeaveApplyController controller;
  final VoidCallback onDone;

  @override
  State<LeaveApplyScreen> createState() => _LeaveApplyScreenState();
}

class _LeaveApplyScreenState extends State<LeaveApplyScreen> {
  final _reasonCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_on);
    _reasonCtrl.addListener(() => widget.controller.setReason(_reasonCtrl.text));
  }

  @override
  void dispose() {
    widget.controller.removeListener(_on);
    _reasonCtrl.dispose();
    super.dispose();
  }

  void _on() {
    if (!mounted) return;
    if (widget.controller.success) widget.onDone();
    setState(() {});
  }

  Future<void> _pickFrom() async {
    final d = await showDatePicker(
      context: context,
      initialDate: widget.controller.from ?? DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (d != null) widget.controller.setFrom(d);
  }

  Future<void> _pickTo() async {
    final d = await showDatePicker(
      context: context,
      initialDate:
          widget.controller.to ?? widget.controller.from ?? DateTime.now(),
      firstDate: widget.controller.from ?? DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (d != null) widget.controller.setTo(d);
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text(
          '휴가 신청',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _section('유형'),
          Wrap(
            spacing: 8,
            children: [
              ('ANNUAL', '연차'),
              ('COMP', '보상'),
              ('SICK', '병가'),
              ('UNPAID', '무급'),
            ].map((t) {
              final selected = c.leaveType == t.$1;
              return ChoiceChip(
                label: Text(t.$2),
                selected: selected,
                onSelected: (_) => c.setLeaveType(t.$1),
                selectedColor: WMTokens.blue500.withValues(alpha: 0.15),
                labelStyle: TextStyle(
                  color: selected ? WMTokens.blue500 : WMTokens.grey700,
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 20),
          _section('기간'),
          _dateRow('시작', c.from, _pickFrom),
          const SizedBox(height: 8),
          _dateRow('종료', c.to, _pickTo),
          const SizedBox(height: 20),
          _section('사유 (선택)'),
          TextField(
            controller: _reasonCtrl,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: '사유 입력',
              filled: true,
              fillColor: WMTokens.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(WMTokens.rMd),
                borderSide: const BorderSide(color: WMTokens.grey200),
              ),
            ),
          ),
          if (c.error != null) ...[
            const SizedBox(height: 16),
            Text(
              c.error!,
              style: const TextStyle(color: WMTokens.danger, fontSize: 13),
            ),
          ],
          const SizedBox(height: 24),
          FilledButton(
            onPressed: c.canSubmit ? c.submit : null,
            style: FilledButton.styleFrom(
              minimumSize: const Size.fromHeight(48),
            ),
            child: Text(c.submitting ? '제출 중...' : '제출'),
          ),
        ],
      ),
    );
  }

  Widget _section(String s) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(
          s,
          style: const TextStyle(
            fontWeight: FontWeight.w700,
            color: WMTokens.grey900,
          ),
        ),
      );

  Widget _dateRow(String label, DateTime? d, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: WMTokens.white,
          borderRadius: BorderRadius.circular(WMTokens.rMd),
          border: Border.all(color: WMTokens.grey200),
        ),
        child: Row(
          children: [
            Text(label, style: const TextStyle(color: WMTokens.grey600)),
            const Spacer(),
            Text(
              d != null
                  ? '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}'
                  : '선택',
              style: TextStyle(
                color: d != null ? WMTokens.grey900 : WMTokens.grey500,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(width: 8),
            const Icon(
              Icons.calendar_today_outlined,
              size: 16,
              color: WMTokens.grey500,
            ),
          ],
        ),
      ),
    );
  }
}
