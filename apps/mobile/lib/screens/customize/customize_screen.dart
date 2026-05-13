import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/customize_controller.dart';

class CustomizeScreen extends StatefulWidget {
  const CustomizeScreen({
    super.key,
    required this.controller,
    required this.onSaved,
  });

  final CustomizeController controller;
  final VoidCallback onSaved;

  @override
  State<CustomizeScreen> createState() => _CustomizeScreenState();
}

class _CustomizeScreenState extends State<CustomizeScreen> {
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
    if (!mounted) return;
    if (widget.controller.success) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('저장됨')));
      widget.onSaved();
    }
    setState(() {});
  }

  Future<void> _submit() async {
    final c = widget.controller;
    await c.submit({
      'dark_mode': c.darkMode,
      'large_text': c.largeText,
      'vibration': c.vibration,
      'theme': c.theme,
    });
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text(
          '화면 꾸미기',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: c.loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(WMTokens.sp4),
              children: [
                _switchTile('다크 모드', c.darkMode, c.setDarkMode),
                _switchTile('큰 글씨', c.largeText, c.setLargeText),
                _switchTile('알림 진동', c.vibration, c.setVibration),
                const SizedBox(height: WMTokens.sp5),
                _sectionLabel('테마 색상'),
                Wrap(
                  spacing: WMTokens.sp2,
                  children: [
                    ('blue', '파랑'),
                    ('green', '녹색'),
                    ('orange', '주황'),
                    ('grey', '회색'),
                  ].map((t) {
                    final selected = c.theme == t.$1;
                    return ChoiceChip(
                      label: Text(t.$2),
                      selected: selected,
                      onSelected: (_) => c.setTheme(t.$1),
                      selectedColor: WMTokens.blue500.withValues(alpha: 0.15),
                      labelStyle: TextStyle(
                        color: selected ? WMTokens.blue500 : WMTokens.grey700,
                      ),
                    );
                  }).toList(),
                ),
                if (c.error != null) ...[
                  const SizedBox(height: WMTokens.sp4),
                  Text(
                    c.error!,
                    style: const TextStyle(
                        color: WMTokens.danger, fontSize: 13),
                  ),
                ],
                const SizedBox(height: WMTokens.sp6),
                FilledButton(
                  onPressed: c.submitting ? null : _submit,
                  style: FilledButton.styleFrom(
                    minimumSize: const Size.fromHeight(48),
                  ),
                  child: Text(c.submitting ? '저장 중...' : '저장'),
                ),
              ],
            ),
    );
  }

  Widget _switchTile(String label, bool value, ValueChanged<bool> onChanged) {
    return Container(
      margin: const EdgeInsets.only(bottom: WMTokens.sp2),
      decoration: BoxDecoration(
        color: WMTokens.white,
        borderRadius: BorderRadius.circular(WMTokens.rMd),
        border: Border.all(color: WMTokens.grey200),
      ),
      child: SwitchListTile(
        title: Text(label,
            style: const TextStyle(color: WMTokens.grey900)),
        value: value,
        onChanged: onChanged,
        activeColor: WMTokens.blue500,
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
