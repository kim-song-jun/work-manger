import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';

class ComplianceBlockScreen extends StatelessWidget {
  const ComplianceBlockScreen({super.key, required this.onContactAdmin});

  final VoidCallback onContactAdmin;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        backgroundColor: WMTokens.white,
        elevation: 0,
        title: const Text(
          '근무 제한',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: WMTokens.sp8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.shield, size: 64, color: WMTokens.danger),
              const SizedBox(height: WMTokens.sp4),
              const Text(
                '이번 주 52시간을 초과했습니다',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: WMTokens.grey900,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: WMTokens.sp2),
              const Text(
                '관리자 승인 후 출근 가능',
                style: TextStyle(fontSize: 14, color: WMTokens.grey600, height: 1.6),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: WMTokens.sp6),
              OutlinedButton(
                onPressed: onContactAdmin,
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(200, 48),
                  side: const BorderSide(color: WMTokens.danger),
                  foregroundColor: WMTokens.danger,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(WMTokens.rMd),
                  ),
                ),
                child: const Text('관리자에게 문의'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
