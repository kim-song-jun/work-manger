import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';

class LeaveSuccessScreen extends StatelessWidget {
  const LeaveSuccessScreen({super.key, required this.onClose});

  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        backgroundColor: WMTokens.white,
        elevation: 0,
        title: const Text(
          '휴가 신청',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: WMTokens.sp8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.check_circle, size: 64, color: WMTokens.success),
              const SizedBox(height: WMTokens.sp4),
              const Text(
                '휴가 신청이 완료되었습니다',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: WMTokens.grey900,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: WMTokens.sp2),
              const Text(
                '승인 대기 중',
                style: TextStyle(fontSize: 14, color: WMTokens.grey600, height: 1.6),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: WMTokens.sp6),
              FilledButton(
                onPressed: onClose,
                style: FilledButton.styleFrom(
                  minimumSize: const Size(200, 48),
                ),
                child: const Text('확인'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
