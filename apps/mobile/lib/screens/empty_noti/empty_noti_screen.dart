import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';

class EmptyNotiScreen extends StatelessWidget {
  const EmptyNotiScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        backgroundColor: WMTokens.white,
        elevation: 0,
        title: const Text(
          '알림',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: WMTokens.sp8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: const [
              Icon(
                Icons.notifications_off_outlined,
                size: 64,
                color: WMTokens.grey400,
              ),
              SizedBox(height: WMTokens.sp4),
              Text(
                '알림이 없습니다',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: WMTokens.grey900,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: WMTokens.sp2),
              Text(
                '새로운 알림이 도착하면 여기에 표시됩니다.',
                style: TextStyle(fontSize: 14, color: WMTokens.grey600, height: 1.6),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
