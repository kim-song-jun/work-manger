import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../theme/tokens.g.dart';

class ErrorGpsScreen extends StatelessWidget {
  const ErrorGpsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        backgroundColor: WMTokens.white,
        elevation: 0,
        title: const Text(
          'GPS 오류',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: WMTokens.sp8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.location_off, size: 64, color: WMTokens.warn),
              const SizedBox(height: WMTokens.sp4),
              const Text(
                'GPS 권한이 필요합니다',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: WMTokens.grey900,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: WMTokens.sp2),
              const Text(
                '출퇴근 기록을 위해 위치 권한을 허용해 주세요.\n설정에서 위치 접근을 허용하면 정상적으로 사용할 수 있습니다.',
                style: TextStyle(fontSize: 14, color: WMTokens.grey600, height: 1.6),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: WMTokens.sp6),
              FilledButton(
                onPressed: () => openAppSettings(),
                style: FilledButton.styleFrom(
                  minimumSize: const Size(200, 48),
                ),
                child: const Text('설정 열기'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
