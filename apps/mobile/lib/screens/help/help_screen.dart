import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';

const List<Map<String, String>> _faqs = [
  {
    'q': '출근/퇴근하기',
    'a': '홈 화면 하단의 [출근] 버튼을 탭하면 출근이 기록됩니다. 퇴근 시에는 동일한 위치의 [퇴근] 버튼을 탭하세요. GPS 위치 기반 자동 출근을 설정하면 회사 반경 내 진입 시 자동으로 출근 처리됩니다.',
  },
  {
    'q': '휴가 신청',
    'a': '하단 메뉴 [휴가 잔여]에서 [신청] 버튼을 탭하거나, [휴가 신청] 화면으로 이동하여 휴가 유형·기간을 선택한 뒤 제출하세요. 승인 결과는 알림으로 전송됩니다.',
  },
  {
    'q': '팀 보기',
    'a': '[팀] 메뉴에서 소속 팀원 목록과 현재 근무 상태를 확인할 수 있습니다. 관리자에 의해 팀이 배정된 경우에만 표시됩니다.',
  },
  {
    'q': '프로필 변경',
    'a': '[내 정보] → [프로필] 메뉴에서 이름, 프로필 사진, 연락처 등을 수정할 수 있습니다. 변경 사항은 저장 후 즉시 반영됩니다.',
  },
  {
    'q': '비밀번호 분실',
    'a': '로그인 화면 하단의 [비밀번호 찾기]를 탭하고 가입한 이메일 주소를 입력하세요. 재설정 링크가 발송됩니다. 이메일을 받지 못한 경우 스팸함을 확인하거나 고객센터에 문의하세요.',
  },
];

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key, this.onOpenWebView});
  final void Function(String path)? onOpenWebView;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text('도움말', style: TextStyle(fontWeight: FontWeight.w700)),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(WMTokens.sp4),
        children: [
          ..._faqs.map(
            (faq) => Container(
              margin: const EdgeInsets.only(bottom: WMTokens.sp2),
              decoration: BoxDecoration(
                color: WMTokens.white,
                borderRadius: BorderRadius.circular(WMTokens.rMd),
              ),
              child: ExpansionTile(
                tilePadding: const EdgeInsets.symmetric(
                  horizontal: WMTokens.sp4,
                  vertical: WMTokens.sp1,
                ),
                childrenPadding: const EdgeInsets.fromLTRB(
                  WMTokens.sp4,
                  0,
                  WMTokens.sp4,
                  WMTokens.sp4,
                ),
                title: Text(
                  faq['q']!,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: WMTokens.grey900,
                    fontSize: 14,
                  ),
                ),
                children: [
                  Text(
                    faq['a']!,
                    style: const TextStyle(color: WMTokens.grey700, fontSize: 13, height: 1.6),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: WMTokens.sp6),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => onOpenWebView?.call('/m/help/contact'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                side: const BorderSide(color: WMTokens.blue500),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(WMTokens.rMd),
                ),
              ),
              child: const Text(
                '고객센터 문의',
                style: TextStyle(color: WMTokens.blue500, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
