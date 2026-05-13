import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/overtime_controller.dart';

class OvertimeScreen extends StatefulWidget {
  const OvertimeScreen({
    super.key,
    required this.controller,
    required this.onSaved,
  });

  final OvertimeController controller;
  final VoidCallback onSaved;

  @override
  State<OvertimeScreen> createState() => _OvertimeScreenState();
}

class _OvertimeScreenState extends State<OvertimeScreen> {
  final _reasonCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_on);
    _reasonCtrl.addListener(
        () => widget.controller.setReason(_reasonCtrl.text));
  }

  @override
  void dispose() {
    widget.controller.removeListener(_on);
    _reasonCtrl.dispose();
    super.dispose();
  }

  void _on() {
    if (!mounted) return;
    if (widget.controller.success) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('저장됨')));
      widget.onSaved();
    }
    setState(() {});
  }

  Future<void> _pickDate() async {
    final d = await showDatePicker(
      context: context,
      initialDate: widget.controller.date ?? DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 90)),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );
    if (d != null) widget.controller.setDate(d);
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text(
          '연장 신청',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(WMTokens.sp4),
        children: [
          _sectionLabel('날짜'),
          InkWell(
            onTap: _pickDate,
            child: Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: WMTokens.sp4, vertical: 14),
              decoration: BoxDecoration(
                color: WMTokens.white,
                borderRadius: BorderRadius.circular(WMTokens.rMd),
                border: Border.all(color: WMTokens.grey200),
              ),
              child: Row(
                children: [
                  Text('날짜',
                      style:
                          const TextStyle(color: WMTokens.grey600)),
                  const Spacer(),
                  Text(
                    c.date != null
                        ? '${c.date!.year}-${c.date!.month.toString().padLeft(2, '0')}-${c.date!.day.toString().padLeft(2, '0')}'
                        : '선택',
                    style: TextStyle(
                      color: c.date != null
                          ? WMTokens.grey900
                          : WMTokens.grey500,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(width: WMTokens.sp2),
                  const Icon(Icons.calendar_today_outlined,
                      size: 16, color: WMTokens.grey500),
                ],
              ),
            ),
          ),
          const SizedBox(height: WMTokens.sp5),
          _sectionLabel('시간'),
          Wrap(
            spacing: WMTokens.sp2,
            children: [
              (30, '30분'),
              (60, '1시간'),
              (90, '1.5시간'),
              (120, '2시간'),
              (180, '3시간'),
            ].map((t) {
              final selected = c.minutes == t.$1;
              return ChoiceChip(
                label: Text(t.$2),
                selected: selected,
                onSelected: (_) => c.setMinutes(t.$1),
                selectedColor: WMTokens.blue500.withValues(alpha: 0.15),
                labelStyle: TextStyle(
                  color: selected ? WMTokens.blue500 : WMTokens.grey700,
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: WMTokens.sp5),
          _sectionLabel('사유'),
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
            const SizedBox(height: WMTokens.sp4),
            Text(
              c.error!,
              style: const TextStyle(color: WMTokens.danger, fontSize: 13),
            ),
          ],
          const SizedBox(height: WMTokens.sp6),
          FilledButton(
            onPressed: c.canSubmit ? () => c.submit({}) : null,
            style: FilledButton.styleFrom(
              minimumSize: const Size.fromHeight(48),
            ),
            child: Text(c.submitting ? '제출 중...' : '제출'),
          ),
        ],
      ),
    );
  }

  Widget _sectionLabel(String s) => Padding(
        padding: const EdgeInsets.only(bottom: WMTokens.sp2),
        child: Text(
          s,
          style: const TextStyle(
            fontWeight: FontWeight.w700,
            color: WMTokens.grey900,
          ),
        ),
      );
}
