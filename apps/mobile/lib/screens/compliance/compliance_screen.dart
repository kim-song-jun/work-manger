import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/compliance_controller.dart';

class ComplianceScreen extends StatefulWidget {
  const ComplianceScreen({super.key, required this.controller});

  final ComplianceController controller;

  @override
  State<ComplianceScreen> createState() => _ComplianceScreenState();
}

class _ComplianceScreenState extends State<ComplianceScreen> {
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
          '52시간',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: c.load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (c.loading && c.data == null)
              const LinearProgressIndicator(minHeight: 2),
            if (c.error != null) _errorBanner(c.error!),
            if (c.data != null) _body(c.data!),
          ],
        ),
      ),
    );
  }

  Widget _body(ComplianceData d) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (d.weekLabel.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Text(
              d.weekLabel,
              style: const TextStyle(
                fontSize: 13,
                color: WMTokens.grey500,
              ),
            ),
          ),
        if (d.isWarning) _warningBanner(d),
        const SizedBox(height: 16),
        _progressCard(d),
      ],
    );
  }

  Widget _warningBanner(ComplianceData d) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: WMTokens.warnSoft,
        borderRadius: BorderRadius.circular(WMTokens.rMd),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.warning_amber_rounded,
            color: WMTokens.warn,
            size: 20,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              '이번 주 근무시간이 ${d.usedLabel}입니다. 52시간 한도에 유의하세요.',
              style: const TextStyle(
                color: WMTokens.warn,
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _progressCard(ComplianceData d) {
    final barColor = d.isWarning ? WMTokens.warn : WMTokens.blue500;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: WMTokens.white,
        borderRadius: BorderRadius.circular(WMTokens.rLg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                '이번 주 근무시간',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: WMTokens.grey700,
                ),
              ),
              Text(
                '${d.usedLabel} / ${d.limitLabel}',
                style: const TextStyle(
                  fontSize: 13,
                  color: WMTokens.grey600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(WMTokens.rSm),
            child: LinearProgressIndicator(
              value: d.progress,
              minHeight: 12,
              backgroundColor: WMTokens.grey200,
              valueColor: AlwaysStoppedAnimation<Color>(barColor),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${(d.progress * 100).toStringAsFixed(1)}% 사용',
                style: TextStyle(
                  fontSize: 12,
                  color: barColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const Text(
                '한도: 52시간',
                style: TextStyle(
                  fontSize: 12,
                  color: WMTokens.grey500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _errorBanner(String msg) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
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
}
