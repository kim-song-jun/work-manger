import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/profile_full_controller.dart';

class ProfileFullScreen extends StatefulWidget {
  const ProfileFullScreen({
    super.key,
    required this.controller,
    required this.onSaved,
  });

  final ProfileFullController controller;
  final VoidCallback onSaved;

  @override
  State<ProfileFullScreen> createState() => _ProfileFullScreenState();
}

class _ProfileFullScreenState extends State<ProfileFullScreen> {
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _emergencyCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_on);
    widget.controller.load().then((_) {
      _nameCtrl.text = widget.controller.name;
      _phoneCtrl.text = widget.controller.phone;
      _emergencyCtrl.text = widget.controller.emergencyContact;
    });
    _nameCtrl.addListener(() => widget.controller.setName(_nameCtrl.text));
    _phoneCtrl.addListener(() => widget.controller.setPhone(_phoneCtrl.text));
    _emergencyCtrl.addListener(
        () => widget.controller.setEmergencyContact(_emergencyCtrl.text));
  }

  @override
  void dispose() {
    widget.controller.removeListener(_on);
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _emergencyCtrl.dispose();
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

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text(
          '프로필 편집',
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
                _sectionLabel('이름'),
                _editableField(_nameCtrl, hint: '이름 입력'),
                const SizedBox(height: WMTokens.sp4),
                _sectionLabel('전화번호'),
                _editableField(
                  _phoneCtrl,
                  hint: '전화번호 입력',
                  keyboard: TextInputType.phone,
                ),
                const SizedBox(height: WMTokens.sp4),
                _sectionLabel('부서'),
                _readonlyField(c.department.isEmpty ? '—' : c.department),
                const SizedBox(height: WMTokens.sp4),
                _sectionLabel('직급'),
                _readonlyField(c.position.isEmpty ? '—' : c.position),
                const SizedBox(height: WMTokens.sp4),
                _sectionLabel('입사일'),
                _readonlyField(c.joinedAt.isEmpty ? '—' : c.joinedAt),
                const SizedBox(height: WMTokens.sp4),
                _sectionLabel('비상 연락처'),
                _editableField(_emergencyCtrl,
                    hint: '비상 연락처 입력',
                    keyboard: TextInputType.phone),
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
                  onPressed: c.submitting ? null : () => c.submit({}),
                  style: FilledButton.styleFrom(
                    minimumSize: const Size.fromHeight(48),
                  ),
                  child: Text(c.submitting ? '저장 중...' : '저장'),
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
            fontSize: 13,
          ),
        ),
      );

  Widget _editableField(
    TextEditingController ctrl, {
    required String hint,
    TextInputType keyboard = TextInputType.text,
  }) {
    return TextField(
      controller: ctrl,
      keyboardType: keyboard,
      decoration: InputDecoration(
        hintText: hint,
        filled: true,
        fillColor: WMTokens.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(WMTokens.rMd),
          borderSide: const BorderSide(color: WMTokens.grey200),
        ),
      ),
    );
  }

  Widget _readonlyField(String value) {
    return Container(
      padding: const EdgeInsets.symmetric(
          horizontal: WMTokens.sp4, vertical: 14),
      decoration: BoxDecoration(
        color: WMTokens.grey100,
        borderRadius: BorderRadius.circular(WMTokens.rMd),
        border: Border.all(color: WMTokens.grey200),
      ),
      child: Text(
        value,
        style: const TextStyle(color: WMTokens.grey600),
      ),
    );
  }
}
