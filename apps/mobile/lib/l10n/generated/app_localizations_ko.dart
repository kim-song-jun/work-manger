import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Korean (`ko`).
class AppLocalizationsKo extends AppLocalizations {
  AppLocalizationsKo([String locale = 'ko']) : super(locale);

  @override
  String get appTitle => '근무 관리';

  @override
  String get navHome => '홈';

  @override
  String get navTeam => '팀';

  @override
  String get navLeave => '연차';

  @override
  String get navMy => '마이';

  @override
  String get authLogin => '로그인';

  @override
  String get authSignup => '회원가입';

  @override
  String get authLoginTitle => '안녕하세요\n오늘도 기록해볼까요?';

  @override
  String get authLoginSub => '회사에서 받은 이메일로 로그인해주세요.';

  @override
  String get authSignupTitle => '회사 이메일로\n시작해볼까요?';

  @override
  String get authSignupSub => '조직 도메인으로 계정을 만들고 팀 초대를 확인하세요.';

  @override
  String get authEmail => '이메일';

  @override
  String get authWorkEmail => '회사 이메일';

  @override
  String get authPassword => '비밀번호';

  @override
  String get authName => '이름';

  @override
  String get authSubmit => '확인';

  @override
  String get authNoAccount => '계정이 없나요?';

  @override
  String get authHaveAccount => '이미 계정이 있나요?';

  @override
  String get authInvalid => '이메일 또는 비밀번호가 올바르지 않습니다.';

  @override
  String get authForgot => '비밀번호를 잊으셨나요?';

  @override
  String get authHelp => '도움 받기';

  @override
  String get authForgotTitle => '비밀번호 재설정';

  @override
  String get authForgotDesc => '가입한 이메일로 재설정 링크를 보내드릴게요.';

  @override
  String get authForgotSend => '재설정 링크 보내기';

  @override
  String get authForgotDone => '이메일을 확인해주세요.';

  @override
  String get authBackToLogin => '로그인으로 돌아가기';

  @override
  String get authPasswordHint => '8자 이상, 영문 + 숫자 + 특수문자 포함';

  @override
  String get homeGoodMorning => '안녕하세요, 좋은 아침이에요';

  @override
  String get homeGoodEvening => '오늘 하루 수고하셨어요';

  @override
  String get homeTodayWork => '오늘 근무';

  @override
  String get homeAtOffice => '본사에서 근무 중';

  @override
  String get homeAtWfh => '재택에서 근무 중';

  @override
  String get homeAutoDetected => '자동 감지됨';

  @override
  String get homeChange => '변경';

  @override
  String get homeSlideIn => '밀어서 출근';

  @override
  String get homeSlideOut => '밀어서 퇴근';

  @override
  String get homeWeekLabel => '이번 주';

  @override
  String get homeLeaveBalance => '잔여 연차';

  @override
  String get homeOvertimeLabel => '초과 누적';

  @override
  String get homeTeamStatus => '팀 현황';

  @override
  String get homeClockInOffice => '본사 출근';

  @override
  String get homeClockInWfh => '재택 출근';

  @override
  String get homeClockInSuccess => '출근이 등록됐어요';

  @override
  String get homeClockInFailed => '출근 등록에 실패했어요';

  @override
  String get homeGeoUnsupported => '위치 정보를 사용할 수 없어요';

  @override
  String get homeGeoDenied => '위치 권한을 허용해주세요';

  @override
  String get homeOpenTweaks => '테마 설정';

  @override
  String get homeLabelClockIn => '출근';

  @override
  String get homeLabelClockOut => '퇴근';

  @override
  String get homeLabelRegular => '정규';

  @override
  String get homeLocationOfficeName => '강남 오피스';

  @override
  String get homeFakeMember_1 => '지우';

  @override
  String get homeFakeMember_2 => '민수';

  @override
  String get homeFakeMember_3 => '예린';

  @override
  String get homeFakeMember_4 => '현우';

  @override
  String get homeFakeMember_5 => '수아';

  @override
  String get homeFakeMember_6 => '도윤';

  @override
  String get homeFakeMember_7 => '하린';

  @override
  String get homeStatusWorking => '근무 중';

  @override
  String get homeProgressLabel => '정규 대비';

  @override
  String homeTeamCountOffice(Object n) {
    return '$n명 출근';
  }

  @override
  String homeTeamCountWfh(Object n) {
    return '$n명 재택';
  }

  @override
  String homeTeamCountLeave(Object n) {
    return '$n명 휴가';
  }

  @override
  String homeTeamCountBreak(Object n) {
    return '$n명 휴게';
  }

  @override
  String get teamTitle => '팀 현황';

  @override
  String get teamEmpty => '팀원이 없어요';

  @override
  String get teamLoading => '불러오는 중';

  @override
  String get leaveTitle => '연차';

  @override
  String get leaveBalance => '잔여';

  @override
  String get leaveUsed => '사용';

  @override
  String get leaveAccrued => '발생';

  @override
  String get leaveExpiring => '소멸 예정';

  @override
  String get leaveApply => '연차 신청';

  @override
  String get leaveNoneYet => '아직 연차 정보가 없어요';

  @override
  String get leaveDaysUnit => '일';

  @override
  String get leaveTypeAnnual => '연차';

  @override
  String get leaveTypeComp => '보상휴가';

  @override
  String get leaveTypeSick => '병가';

  @override
  String get leaveTypePersonal => '개인 사유';

  @override
  String get myTitle => '마이';

  @override
  String get myProfile => '프로필';

  @override
  String get mySettings => '설정';

  @override
  String get myCustomize => '화면 꾸미기';

  @override
  String get myHelp => '도움말';

  @override
  String get myLogout => '로그아웃';

  @override
  String get onbNext => '다음';

  @override
  String get onbBack => '이전';

  @override
  String get onbSkip => '건너뛰기';

  @override
  String get onbLater => '나중에 할게요';

  @override
  String get onbWelcomeTitle => '출근부터 연차까지\n한 번에 관리하세요';

  @override
  String get onbWelcomeSub => '우리 회사를 위한 가장 단순한 근무 관리 도구';

  @override
  String get onbWelcomeStart => '시작하기';

  @override
  String get onbFeatureLocTitle => '위치 기반 자동 출근';

  @override
  String get onbFeatureLocSub => '본사·재택 자동 인식';

  @override
  String get onbFeatureLeaveTitle => '연차 자동 발생·소멸';

  @override
  String get onbFeatureLeaveSub => '깜빡할 일 없도록 안내';

  @override
  String get onbFeatureTeamTitle => '팀원 근무 상태 한눈에';

  @override
  String get onbFeatureTeamSub => '실시간 협업이 더 쉬워져요';

  @override
  String get onbCodeTitle => '회사 코드를 입력해주세요';

  @override
  String get onbCodeSub => '관리자에게 받은 6자리 코드를 입력하세요';

  @override
  String get onbCodeHelp => '코드를 모르시나요?';

  @override
  String get onbCodeContactAdmin => '관리자에게 문의';

  @override
  String get onbProfileTitle => '프로필을 만들어요';

  @override
  String get onbProfileSub => '팀원들에게 어떻게 보일지 설정해요';

  @override
  String get onbProfileName => '이름';

  @override
  String get onbProfileTeam => '소속 팀';

  @override
  String get onbProfileRole => '직책';

  @override
  String get onbProfileEmpNo => '사번';

  @override
  String get onbLocationTitle => '위치를 등록해주세요';

  @override
  String get onbLocationSub => '본사·재택 위치를 자동으로 인식해요';

  @override
  String onbLocationOffice(Object name) {
    return '본사 — $name';
  }

  @override
  String get onbLocationRadius => '반경 100m';

  @override
  String get onbLocationWfh => '재택 위치';

  @override
  String get onbLocationWfhSub => '지금 위치를 재택으로 등록';

  @override
  String get onbLocationPrivacy => '위치는 출퇴근 인식에만 사용되며, 근무 시간 외에는 추적하지 않아요.';

  @override
  String get onbLocationOfficeAddress => '서울 강남구';

  @override
  String get onbScheduleTitle => '근무시간을 확인하세요';

  @override
  String get onbScheduleSub => '관리자가 설정한 표준 시간이에요';

  @override
  String get onbScheduleStandard => '표준 근무시간';

  @override
  String get onbSchedulePattern => '근무 패턴';

  @override
  String get onbScheduleLunch => '점심 12:00–13:00 · 주 40시간';

  @override
  String get onbNotifTitle => '알림을 받을까요?';

  @override
  String get onbNotifSub => '중요한 일은 놓치지 않게요';

  @override
  String get onbNotifClock => '출퇴근 알림';

  @override
  String get onbNotifClockSub => '출근 시간 10분 전';

  @override
  String get onbNotifLeave => '연차 소멸 안내';

  @override
  String get onbNotifLeaveSub => '소멸 30일 전 / 7일 전';

  @override
  String get onbNotifOvertime => '초과근무 승인 결과';

  @override
  String get onbNotifOvertimeSub => '관리자 승인 즉시';

  @override
  String get onbWidgetTitle => '홈 화면에 위젯을 추가할까요?';

  @override
  String get onbWidgetSub => '앱을 열지 않고도 출근할 수 있어요';

  @override
  String get onbWidgetAdd => '위젯 추가하기';

  @override
  String get onbDoneTitle => '준비 완료!';

  @override
  String get onbDoneSub => '첫 출근을 응원해요\n아래 가이드를 따라가 보세요';

  @override
  String get onbDoneStep1 => '본사 도착하면 자동 출근';

  @override
  String get onbDoneStep1Sub => 'GPS가 위치를 인식해요';

  @override
  String get onbDoneStep2 => '점심 후 휴게 등록';

  @override
  String get onbDoneStep2Sub => '12:00–13:00 자동 차감';

  @override
  String get onbDoneStep3 => '퇴근은 직접 탭하기';

  @override
  String get onbDoneStep3Sub => '오늘 근무가 마무리돼요';

  @override
  String get onbDoneGoHome => '홈으로 가기';

  @override
  String get onbScheduleOvertimeTitle => '초과근무 자동 감지';

  @override
  String get onbScheduleOvertimeSub => '18시 이후 근무 시 승인 요청';

  @override
  String get onbScheduleLeaveTitle => '연차 자동 발생';

  @override
  String get onbScheduleLeaveSub => '매월 1일 입사일 기준';

  @override
  String get onbWidgetSizeSmall => 'Small';

  @override
  String get onbWidgetSizeSmallSub => '근무시간만';

  @override
  String get onbWidgetSizeMedium => 'Medium';

  @override
  String get onbWidgetSizeMediumSub => '근무 + 팀';

  @override
  String get onbWidgetSizeLarge => 'Large';

  @override
  String get onbWidgetSizeLargeSub => '풀 대시보드';

  @override
  String get onbWidgetDemoToday => '오늘 근무';

  @override
  String get onbWidgetDemoOfficeTime => '본사 · 09:02';

  @override
  String get onbWidgetDemoClockOut => '퇴근하기';

  @override
  String get tweaksTitle => '테마 설정';

  @override
  String get tweaksTheme => '테마';

  @override
  String get tweaksThemeLight => '라이트';

  @override
  String get tweaksThemeDark => '다크';

  @override
  String get tweaksBrand => '브랜드 컬러';

  @override
  String get tweaksFontSize => '글자 크기';

  @override
  String get tweaksFontSm => '작게';

  @override
  String get tweaksFontMd => '보통';

  @override
  String get tweaksFontLg => '크게';

  @override
  String get tweaksLanguage => '언어';

  @override
  String get tweaksReset => '기본값으로';

  @override
  String get pushSection => '푸시 알림';

  @override
  String get pushEnable => '푸시 알림 켜기';

  @override
  String get pushDisable => '푸시 알림 끄기';

  @override
  String get pushSuccess => '푸시 알림이 활성화됐어요';

  @override
  String get pushDisabled => '푸시 알림을 껐어요';

  @override
  String get pushErrorUNSUPPORTED => '이 브라우저는 푸시 알림을 지원하지 않아요';

  @override
  String get pushErrorPERMISSION_DENIED => '알림 권한이 거부됐어요';

  @override
  String get pushErrorNO_VAPID_KEY => '푸시 서버 설정이 필요해요';

  @override
  String get pushErrorSUBSCRIBE_FAILED => '구독에 실패했어요';

  @override
  String get pushErrorREGISTER_FAILED => '서비스 워커 등록에 실패했어요';

  @override
  String get tripTitle => '출장/외근';

  @override
  String get tripNew => '새 신청';

  @override
  String get tripMyRequests => '내 신청 내역';

  @override
  String get tripEmpty => '신청 내역이 없어요';

  @override
  String get tripKind => '유형';

  @override
  String get tripKindBusiness => '출장';

  @override
  String get tripKindField => '외근';

  @override
  String get tripStartsOn => '시작일';

  @override
  String get tripEndsOn => '종료일';

  @override
  String get tripPlace => '장소';

  @override
  String get tripPurpose => '목적';

  @override
  String get tripSubmit => '신청하기';

  @override
  String get tripSubmitted => '출장 신청이 등록되었어요';

  @override
  String get tripFailed => '신청에 실패했어요';

  @override
  String get tripStatusPending => '대기 중';

  @override
  String get tripStatusApproved => '승인';

  @override
  String get tripStatusRejected => '반려';

  @override
  String get tripStatusCancelled => '취소됨';

  @override
  String get tripErrorsInvalidRange => '종료일은 시작일과 같거나 이후여야 해요';

  @override
  String get tripErrorsLocationRequired => '장소를 입력해 주세요';

  @override
  String get noticeTitle => '공지사항';

  @override
  String get noticePinned => '상단 고정';

  @override
  String get noticeRecent => '최근';

  @override
  String get noticeEmpty => '공지가 없어요';

  @override
  String get noticeShowPinned => '상단 고정만 보기';

  @override
  String get noticeShowAll => '전체 보기';

  @override
  String get noticeCatAll => '전체';

  @override
  String get noticeCatPolicy => '정책';

  @override
  String get noticeCatEvent => '이벤트';

  @override
  String get noticeCatIt => 'IT';

  @override
  String get noticeCatHr => '인사';

  @override
  String get noticeCatGeneral => '일반';

  @override
  String get commonLoading => '불러오는 중';

  @override
  String get commonRetry => '다시 시도';

  @override
  String get commonError => '문제가 발생했어요';

  @override
  String get commonCancel => '취소';

  @override
  String get commonConfirm => '확인';

  @override
  String get commonClose => '닫기';

  @override
  String get commonSkipToMain => '본문으로 건너뛰기';

  @override
  String get commonPrev => '이전';

  @override
  String get commonNext => '다음';

  @override
  String get commonDaysShortSun => '일';

  @override
  String get commonDaysShortMon => '월';

  @override
  String get commonDaysShortTue => '화';

  @override
  String get commonDaysShortWed => '수';

  @override
  String get commonDaysShortThu => '목';

  @override
  String get commonDaysShortFri => '금';

  @override
  String get commonDaysShortSat => '토';

  @override
  String commonYearMonth(Object month, Object year) {
    return '$year년 $month월';
  }

  @override
  String commonMonthDay(Object day, Object month) {
    return '$month월 $day일';
  }

  @override
  String commonWeekdayMonthDay(Object day, Object month, Object weekday) {
    return '$weekday · $month월 $day일';
  }

  @override
  String get commonLangKo => '한국어';

  @override
  String get commonLangEn => 'English';

  @override
  String get commonNotfoundTitle => '페이지를 찾을 수 없어요';

  @override
  String get commonNotfoundSub => '주소를 다시 확인하거나 아래 버튼으로 이동해주세요';

  @override
  String get commonNotfoundGoHome => '홈으로';

  @override
  String get commonNotfoundGoLogin => '로그인 화면';

  @override
  String get webNavDashboard => '대시보드';

  @override
  String get webNavInbox => '인박스';

  @override
  String get webNavTeamLeave => '팀 캘린더';

  @override
  String get webNavRecords => '기록';

  @override
  String get webNavAdmin => '관리자';

  @override
  String get webPrimaryNav => '주요 메뉴';

  @override
  String get webWorkspace => '내 워크스페이스';

  @override
  String get webOpenMenu => '메뉴 열기';

  @override
  String get webCloseMenu => '메뉴 닫기';

  @override
  String get webOpenUser => '사용자 메뉴';

  @override
  String get webLogout => '로그아웃';

  @override
  String get webTodayKpi => '오늘의 KPI';

  @override
  String get webClockInAt => '출근 시각';

  @override
  String get webCumWork => '누적 근무';

  @override
  String get webLeaveRemaining => '잔여 연차';

  @override
  String get webTeamPreview => '팀 현황 미리보기';

  @override
  String get webRecentRecords => '최근 기록';

  @override
  String get webPendingInbox => '처리 대기';

  @override
  String get webSeeAll => '전체 보기';

  @override
  String get webSkeletonLoading => '불러오는 중';

  @override
  String get inboxTitle => '인박스';

  @override
  String get inboxFilterAll => '전체';

  @override
  String get inboxFilterPending => '대기';

  @override
  String get inboxFilterApproved => '승인';

  @override
  String get inboxFilterRejected => '반려';

  @override
  String get inboxFilterToApprove => '내가 승인';

  @override
  String get inboxFilterMine => '내 요청';

  @override
  String get inboxFilterCompany => '전사';

  @override
  String get inboxSelectToView => '왼쪽에서 항목을 선택하세요';

  @override
  String get inboxRequester => '요청자';

  @override
  String get inboxRequestedAt => '요청 시각';

  @override
  String get inboxReason => '사유';

  @override
  String get inboxType => '카테고리';

  @override
  String get inboxDetail => '상세';

  @override
  String get inboxApprove => '승인';

  @override
  String get inboxReject => '반려';

  @override
  String get inboxRejectReasonLabel => '반려 사유 (선택)';

  @override
  String get inboxRejectReasonPlaceholder => '왜 반려하는지 알려주세요';

  @override
  String get inboxSubmitReject => '반려 보내기';

  @override
  String get inboxApprovedToast => '승인했어요';

  @override
  String get inboxRejectedToast => '반려했어요';

  @override
  String get inboxDecisionFailed => '처리 중 문제가 발생했어요';

  @override
  String get inboxEmptyList => '처리할 항목이 없어요';

  @override
  String get inboxKindLeave => '연차';

  @override
  String get inboxKindOvertime => '초과근무';

  @override
  String get inboxKindWfh => '재택';

  @override
  String get recordsTitle => '근무 기록';

  @override
  String get recordsMonthFilter => '월';

  @override
  String get recordsStatusFilter => '상태';

  @override
  String get recordsStatusAll => '전체';

  @override
  String get recordsStatusOk => '정상';

  @override
  String get recordsStatusLate => '지각';

  @override
  String get recordsStatusOt => '초과';

  @override
  String get recordsStatusOff => '휴일';

  @override
  String get recordsColumnDate => '일자';

  @override
  String get recordsColumnIn => '출근';

  @override
  String get recordsColumnOut => '퇴근';

  @override
  String get recordsColumnTotal => '근무';

  @override
  String get recordsColumnLocation => '위치';

  @override
  String get recordsColumnStatus => '상태';

  @override
  String get recordsDetailTitle => '근무 상세';

  @override
  String get recordsDetailClockIn => '출근';

  @override
  String get recordsDetailClockOut => '퇴근';

  @override
  String get recordsDetailTotal => '총 근무';

  @override
  String get recordsDetailLate => '지각';

  @override
  String get recordsDetailLocation => '위치';

  @override
  String get recordsDetailClose => '닫기';

  @override
  String get recordsLoadMore => '더 보기';

  @override
  String get recordsEmpty => '기록이 없어요';

  @override
  String get teamLeaveTitle => '팀 연차';

  @override
  String get teamLeaveMonth => '월';

  @override
  String get teamLeaveQuarter => '분기';

  @override
  String get teamLeaveLeaveLabel => '연차';

  @override
  String get teamLeaveWeekendLabel => '주말';

  @override
  String get teamLeaveCellOpen => '이 날 휴가 중인 팀원';

  @override
  String get teamLeaveNoOne => '휴가 중인 사람이 없어요';

  @override
  String get complianceTitle => '주 52시간';

  @override
  String get complianceSub => '이번 주 누적 근무 시간을 확인하세요';

  @override
  String get complianceThreshold => '한도';

  @override
  String get complianceCurrent => '현재';

  @override
  String get complianceRemaining => '남은 시간';

  @override
  String get complianceHoursUnit => '시간';

  @override
  String get complianceStatusOk => '정상';

  @override
  String get complianceStatusWarn => '경고';

  @override
  String get complianceStatusOver => '초과';

  @override
  String get complianceHistory => '최근 이력';

  @override
  String complianceWeekLabel(Object week) {
    return '$week 주';
  }

  @override
  String get complianceBlockTitle => '출근이 차단됐어요';

  @override
  String get complianceBlockSub => '주 52시간 한도를 초과해 출근할 수 없어요. 매니저와 상의해주세요.';

  @override
  String get complianceBlockClose => '닫기';

  @override
  String get complianceAdminTitle => '52시간 컴플라이언스';

  @override
  String get complianceAdminSub => '회사 전체 주간 누적';

  @override
  String get complianceColMember => '직원';

  @override
  String get complianceColDept => '부서';

  @override
  String get complianceColHours => '누적';

  @override
  String get complianceColStatus => '상태';

  @override
  String get complianceBulkMessage => '선택 인원에 알림 보내기';

  @override
  String get complianceEmpty => '이번 주 데이터가 없어요';

  @override
  String get complianceMatrixTitle => '팀 캘린더';

  @override
  String get complianceMatrixMember => '직원';

  @override
  String get complianceMatrixLegendOffice => '본사';

  @override
  String get complianceMatrixLegendWfh => '재택';

  @override
  String get complianceMatrixLegendLeave => '연차';

  @override
  String get complianceMatrixLegendBreak => '휴게';

  @override
  String get complianceMatrixLegendOff => '휴무';

  @override
  String get leaveApplyTitle => '연차 신청';

  @override
  String get leaveApplyFrom => '시작일';

  @override
  String get leaveApplyTo => '종료일';

  @override
  String get leaveApplyReason => '사유';

  @override
  String get leaveApplySubmit => '신청하기';

  @override
  String get leaveApplySubmitted => '신청을 보냈어요';

  @override
  String get leaveApplyFailed => '신청에 실패했어요';

  @override
  String get leaveApplyInvalidDates => '종료일은 시작일 이후여야 해요';

  @override
  String get adminNavDashboard => '대시보드';

  @override
  String get adminNavApprovals => '승인';

  @override
  String get adminNavEmployees => '직원';

  @override
  String get adminNavReports => '리포트';

  @override
  String get adminNavAudit => '감사';

  @override
  String get adminNavCodes => '코드';

  @override
  String get adminNavSettings => '설정';

  @override
  String get adminNavCompliance => '52시간';

  @override
  String get adminNavExpiringLeave => '소멸 예정';

  @override
  String get adminRoleOwner => '소유자';

  @override
  String get adminRoleAdmin => '관리자';

  @override
  String get adminRoleManager => '매니저';

  @override
  String get adminRoleEmployee => '직원';

  @override
  String get adminDashTitle => '대시보드';

  @override
  String get adminDashSub => '오늘의 근태 현황';

  @override
  String get adminKpiAttendanceRate => '출근률';

  @override
  String get adminKpiAbsent => '미출근';

  @override
  String get adminKpiPendingApprovals => '승인 대기';

  @override
  String get adminKpiOngoingOvertime => '진행 중 초과';

  @override
  String get adminQuickActions => '빠른 액션';

  @override
  String get adminQaReviewApprovals => '승인 검토';

  @override
  String get adminQaViewEmployees => '직원 보기';

  @override
  String get adminQaOpenReports => '리포트 열기';

  @override
  String get adminQaIssueCode => '코드 발급';

  @override
  String get adminApprTitle => '승인 관리';

  @override
  String get adminApprSub => '검토를 기다리는 요청';

  @override
  String get adminApprFilterStatus => '상태';

  @override
  String get adminApprFilterAll => '전체';

  @override
  String get adminApprFilterPending => '대기';

  @override
  String get adminApprFilterApproved => '승인';

  @override
  String get adminApprFilterRejected => '반려';

  @override
  String get adminApprBulkApprove => '일괄 승인';

  @override
  String get adminApprBulkReject => '일괄 반려';

  @override
  String get adminApprSelectAll => '전체 선택';

  @override
  String adminApprSelected(Object n) {
    return '$n건 선택됨';
  }

  @override
  String get adminApprKindLeave => '연차';

  @override
  String get adminApprKindOvertime => '초과근무';

  @override
  String get adminApprKindTrip => '출장';

  @override
  String get adminApprKindManualClockIn => '수동 출근';

  @override
  String get adminApprApprove => '승인';

  @override
  String get adminApprReject => '반려';

  @override
  String get adminApprEmpty => '검토할 요청이 없어요';

  @override
  String get adminApprAlreadyDecided => '이미 처리된 항목이에요';

  @override
  String adminApprPartialFail(Object failed, Object succeeded, Object total) {
    return '$succeeded/$total 처리됨 · $failed건 실패';
  }

  @override
  String get adminEmpTitle => '직원 관리';

  @override
  String get adminEmpSearchPlaceholder => '이름·이메일·팀 검색';

  @override
  String get adminEmpRoleAll => '역할 · 전체';

  @override
  String get adminEmpColEmployee => '직원';

  @override
  String get adminEmpColRole => '역할';

  @override
  String get adminEmpColTeam => '팀';

  @override
  String get adminEmpColPosition => '직책';

  @override
  String get adminEmpColStatus => '상태';

  @override
  String get adminEmpColJoined => '입사일';

  @override
  String get adminEmpStatusActive => '활성';

  @override
  String get adminEmpStatusInactive => '비활성';

  @override
  String get adminEmpEmpty => '표시할 직원이 없어요';

  @override
  String get adminEmpDetailOverview => '개요';

  @override
  String get adminEmpDetailAttendance => '출근';

  @override
  String get adminEmpDetailLeave => '연차';

  @override
  String get adminEmpDetailPerm => '권한';

  @override
  String get adminEmpFieldRole => '역할';

  @override
  String get adminEmpFieldPosition => '직책';

  @override
  String get adminEmpFieldDepartment => '부서';

  @override
  String get adminEmpFieldActive => '활성 상태';

  @override
  String get adminEmpSave => '저장';

  @override
  String get adminEmpDeactivate => '비활성화';

  @override
  String get adminEmpRoleRequired => '역할은 필수예요';

  @override
  String get adminEmpPositionTooLong => '직책은 50자 이내';

  @override
  String get adminEmpDepartmentTooLong => '부서는 50자 이내';

  @override
  String get adminEmpSaveSuccess => '변경 사항을 저장했어요';

  @override
  String get adminEmpSaveFailed => '저장에 실패했어요';

  @override
  String get adminRepTitle => '월간 리포트';

  @override
  String get adminRepPickMonth => '월 선택';

  @override
  String get adminRepExportCsv => 'CSV 내보내기';

  @override
  String get adminRepExportPdf => 'PDF 내보내기';

  @override
  String get adminRepPdfTodo => 'PDF 내보내기는 준비 중이에요';

  @override
  String get adminRepKpiOnTime => '정시 출근율';

  @override
  String get adminRepKpiAvgWeekly => '평균 주 근무';

  @override
  String get adminRepKpiTotalOvertime => '누적 초과근무';

  @override
  String get adminRepKpiLeaveUsage => '연차 사용률';

  @override
  String get adminRepTeamTable => '팀별 성과';

  @override
  String get adminRepColTeam => '팀';

  @override
  String get adminRepColAttendance => '정시 출근율';

  @override
  String get adminRepColAvgWeek => '평균 주 근무';

  @override
  String get adminRepColAvgOvertime => '평균 초과';

  @override
  String get adminExpiringTitle => '소멸 예정 연차';

  @override
  String adminExpiringSub(Object days) {
    return '$days일 이내 소멸 위험';
  }

  @override
  String get adminExpiringColEmployee => '직원';

  @override
  String get adminExpiringColRemaining => '잔여';

  @override
  String get adminExpiringColExpiring => '소멸 예정';

  @override
  String get adminExpiringEmpty => '소멸 위험이 없어요';

  @override
  String get adminSettingsTitle => '회사 설정';

  @override
  String get adminSettingsSubOwner => '회사 정보, 브랜드, 운영 정책을 관리해요';

  @override
  String get adminSettingsSubAdmin => '회사 설정을 확인할 수 있어요. 변경은 소유주 권한이 필요해요';

  @override
  String get adminSettingsSectionCompany => '회사 정보';

  @override
  String get adminSettingsSectionBrand => '브랜드';

  @override
  String get adminSettingsSectionPolicy => '운영 정책';

  @override
  String get adminSettingsCompanyName => '회사명';

  @override
  String get adminSettingsCompanyCode => '회사 코드';

  @override
  String get adminSettingsFiscalYear => '회계 연도 시작';

  @override
  String get adminSettingsLocale => '기본 언어';

  @override
  String get adminSettingsTimezone => '시간대';

  @override
  String get adminSettingsBrandColor => '브랜드 색상';

  @override
  String get adminSettingsLogoUrl => '로고 URL';

  @override
  String get adminSettingsComplianceBlock => '주 52시간 초과 시 출근 차단';

  @override
  String get adminSettingsComplianceBlockDesc => '한도 초과 직원의 자동 출근을 차단합니다. 기본은 경고만.';

  @override
  String get adminSettingsLeavePromotion => '연차 사용 촉진 자동 알림';

  @override
  String get adminSettingsLeavePromotionDesc => '근로기준법 §61 — 만료 6개월/2개월 전 자동 알림.';

  @override
  String get adminSettingsSave => '저장';

  @override
  String get adminSettingsSaving => '저장 중...';

  @override
  String get adminSettingsSaved => '저장됐어요';

  @override
  String get adminSettingsReset => '변경 취소';

  @override
  String get adminSettingsOwnerOnlyHint => '소유주만 설정을 변경할 수 있어요';

  @override
  String get adminSettingsSectionData => '데이터 관리';

  @override
  String get adminSettingsDataExportTitle => '데이터 내보내기 요청';

  @override
  String get adminSettingsDataExportDesc => '회사 데이터 전체를 내보내려면 이메일로 요청하세요.';

  @override
  String get adminSettingsDataExportBtn => '내보내기 요청 이메일 열기';

  @override
  String get adminSettingsDataDeleteTitle => '데이터 삭제 요청';

  @override
  String get adminSettingsDataDeleteDesc => '회사/계정 데이터 삭제는 privacy@molcube.com 으로 요청하세요.';

  @override
  String get adminSettingsDataDeleteBtn => '삭제 요청 이메일 열기';

  @override
  String get adminSettingsSectionHelp => '운영 가이드';

  @override
  String get adminSettingsHelpDataExportSop => '데이터 내보내기 SOP';

  @override
  String get adminSettingsHelpDataDeleteSop => '데이터 삭제 SOP';

  @override
  String get adminSettingsHelpEmergencyPw => '긴급 비밀번호 초기화 SOP';

  @override
  String get adminSettingsHelpOnboard => '신규 회사 온보딩 SOP';

  @override
  String get adminSettingsLoadError => '설정을 불러오지 못했어요';

  @override
  String get adminSettingsLoadErrorRetry => '다시 시도';

  @override
  String get adminNavAriaLabel => '관리자 메뉴';

  @override
  String get adminAuditTitle => '감사 로그';

  @override
  String get adminAuditFilterAction => '액션';

  @override
  String get adminAuditFilterActor => '수행자';

  @override
  String get adminAuditFilterFrom => '시작일';

  @override
  String get adminAuditFilterTo => '종료일';

  @override
  String get adminAuditApply => '적용';

  @override
  String get adminAuditLoadMore => '더 보기';

  @override
  String get adminAuditColAt => '시각';

  @override
  String get adminAuditColActor => '수행자';

  @override
  String get adminAuditColAction => '액션';

  @override
  String get adminAuditColTarget => '대상';

  @override
  String get adminAuditEmpty => '감사 항목이 없어요';

  @override
  String get adminCodeTitle => '초대 코드';

  @override
  String get adminCodeIssue => '발급';

  @override
  String get adminCodeRevoke => '회수';

  @override
  String get adminCodeMaxUses => '최대 사용 횟수';

  @override
  String get adminCodeExpiresAt => '만료일';

  @override
  String get adminCodeOptional => '선택';

  @override
  String get adminCodeColCode => '코드';

  @override
  String get adminCodeColUses => '사용';

  @override
  String get adminCodeColExpires => '만료';

  @override
  String get adminCodeColStatus => '상태';

  @override
  String get adminCodeStatusActive => '활성';

  @override
  String get adminCodeStatusRevoked => '회수됨';

  @override
  String get adminCodeEmpty => '발급된 코드가 없어요';

  @override
  String get adminCommonBack => '뒤로';

  @override
  String get adminCommonSave => '저장';

  @override
  String get adminCommonCancel => '취소';

  @override
  String get adminCommonLoading => '불러오는 중';

  @override
  String get adminCommonError => '문제가 발생했어요';

  @override
  String get adminForbiddenTitle => '접근 권한이 없어요';

  @override
  String get adminForbiddenSub => '관리자 페이지는 ADMIN/OWNER만 열 수 있어요';

  @override
  String get ownerBillingTitle => '결제 / 구독';

  @override
  String get ownerBillingSubtitle => '현재 플랜과 결제 내역을 확인해요';

  @override
  String get ownerBillingCurrentPlan => '현재 플랜';

  @override
  String get ownerBillingMonth => '월';

  @override
  String get ownerBillingNoSubscription => '활성 구독이 없어요';

  @override
  String get ownerBillingPeriodEnd => '다음 결제일';

  @override
  String get ownerBillingChangePlan => '플랜 변경';

  @override
  String get ownerBillingChangePlanTooltip => 'iter14 예정 — Stripe 결제 연동 후 활성화';

  @override
  String get ownerBillingStatusTrial => '체험판';

  @override
  String get ownerBillingStatusActive => '이용 중';

  @override
  String get ownerBillingStatusPastDue => '결제 실패';

  @override
  String get ownerBillingStatusCanceled => '취소됨';

  @override
  String get ownerBillingInvoiceHistory => '결제 내역';

  @override
  String get ownerBillingNoInvoices => '발행된 결제 내역이 없어요';

  @override
  String get ownerBillingColIssuedAt => '발행일';

  @override
  String get ownerBillingColAmount => '금액';

  @override
  String get ownerBillingColStatus => '상태';

  @override
  String get ownerBillingColPdf => '영수증';

  @override
  String get ownerBillingInvoiceStatusDraft => '미확정';

  @override
  String get ownerBillingInvoiceStatusPaid => '결제 완료';

  @override
  String get ownerBillingInvoiceStatusVoid => '무효';

  @override
  String get ownerBillingDownloadPdf => 'PDF';

  @override
  String get ownerBillingNavBilling => '결제';

  @override
  String get mobileBack => '뒤로';

  @override
  String get mobileLeaveApplyKind => '유형';

  @override
  String get mobileLeaveApplyKindFull => '연차';

  @override
  String get mobileLeaveApplyKindAmHalf => '오전 반차';

  @override
  String get mobileLeaveApplyKindPmHalf => '오후 반차';

  @override
  String mobileLeaveApplyDaysUsedOne(Object n) {
    return '$n일 사용';
  }

  @override
  String get mobileLeaveApplyAfterBalance => '신청 후 잔여';

  @override
  String get mobileLeaveApplyOverBalance => '잔여 연차를 초과해요';

  @override
  String get mobileLeaveApplySubmit => '신청하기';

  @override
  String get mobileLeaveApplySuccessTitle => '신청이 접수됐어요';

  @override
  String get mobileLeaveApplySuccessSub => '승인자가 확인하는 대로 알려드려요';

  @override
  String get mobileLeaveApplyPeriod => '기간';

  @override
  String get mobileLeaveApplyType => '유형';

  @override
  String get mobileLeaveApplyPrimary => '확인';

  @override
  String get mobileLeaveApplySecondary => '신청 내역 보기';

  @override
  String get mobileLeaveApplyExpiryTitle => '연차가 곧 소멸돼요';

  @override
  String mobileLeaveApplyExpirySub(Object days) {
    return '$days일이 7일 이내에 사라져요';
  }

  @override
  String get mobileLeaveApplyExpiryCta => '지금 신청하기';

  @override
  String get mobileLeaveApplyExpiryDismiss => '나중에';

  @override
  String get mobileLeaveApplyReasonPlaceholder => '사유 (선택)';

  @override
  String get mobileOvertimeTitle => '초과근무';

  @override
  String get mobileOvertimeTabRequest => '신청';

  @override
  String get mobileOvertimeTabSettings => '자동설정';

  @override
  String get mobileOvertimeTabHistory => '이력';

  @override
  String get mobileOvertimeWorkDate => '근무일';

  @override
  String get mobileOvertimeMinutes => '시간 (분)';

  @override
  String get mobileOvertimeMinutesHint => '예: 90 = 1시간 30분';

  @override
  String get mobileOvertimeReason => '사유';

  @override
  String get mobileOvertimeReasonPlaceholder => '스프린트 마감, 디자인 QA 등';

  @override
  String get mobileOvertimeSubmit => '신청하기';

  @override
  String get mobileOvertimeSubmitted => '초과근무 요청을 보냈어요';

  @override
  String get mobileOvertimeFailed => '신청에 실패했어요';

  @override
  String get mobileOvertimeAutoThreshold => '자동 신청 기준 (분)';

  @override
  String get mobileOvertimeAutoThresholdDesc => '정규 퇴근 후 N분 이상이면 자동 신청';

  @override
  String get mobileOvertimeAutoEnabled => '자동 신청 사용';

  @override
  String get mobileOvertimeHistoryEmpty => '이력이 없어요';

  @override
  String get mobileOvertimeMinutesRequired => '시간을 입력해주세요';

  @override
  String get mobileOvertimeMinutesMin => '최소 1분 이상이어야 해요';

  @override
  String get mobileOvertimeMinutesMax => '최대 720분(12시간)까지 신청 가능해요';

  @override
  String get mobileOvertimeReasonRequired => '사유를 입력해주세요';

  @override
  String get mobileOvertimeDateRequired => '근무일을 선택해주세요';

  @override
  String get mobileInboxTitle => '요청함';

  @override
  String get mobileInboxTabToApprove => '승인할 것';

  @override
  String get mobileInboxTabMine => '내 요청';

  @override
  String get mobileInboxTabSystem => '알림';

  @override
  String get mobileInboxEmpty => '처리할 항목이 없어요';

  @override
  String get mobileInboxEmptySub => '잠시 후 다시 확인해주세요';

  @override
  String get mobileInboxQuickTitle => '빠른 승인';

  @override
  String get mobileInboxSwipeHint => '왼쪽으로 밀어 거절 · 오른쪽으로 밀어 승인';

  @override
  String get mobileInboxRejectLabel => '거절';

  @override
  String get mobileInboxApproveLabel => '승인';

  @override
  String get mobileInboxRejectReason => '반려 사유 (선택)';

  @override
  String get mobileInboxRejectReasonPlaceholder => '왜 반려하는지 알려주세요';

  @override
  String get mobileInboxSendReject => '반려 보내기';

  @override
  String get mobileInboxApprovedToast => '승인했어요';

  @override
  String get mobileInboxRejectedToast => '반려했어요';

  @override
  String get mobileInboxDecisionFailed => '처리 중 문제가 발생했어요';

  @override
  String get mobileInboxKindOvertime => '초과근무';

  @override
  String get mobileInboxKindLeave => '연차';

  @override
  String get mobileInboxKindWfh => '재택';

  @override
  String get mobileInboxKindOutwork => '외근';

  @override
  String get mobileInboxKindManualClockIn => '수동 출근';

  @override
  String get mobileInboxKindTrip => '출장';

  @override
  String get mobileNotificationsTitle => '알림';

  @override
  String get mobileNotificationsMarkAll => '모두 읽음';

  @override
  String get mobileNotificationsEmptyTitle => '모두 확인했어요';

  @override
  String get mobileNotificationsEmptySub => '새로운 알림이 오면 여기에 표시돼요';

  @override
  String get mobileNotificationsFilterAll => '전체';

  @override
  String get mobileNotificationsFilterApprove => '승인';

  @override
  String get mobileNotificationsFilterLeave => '연차';

  @override
  String get mobileNotificationsFilterNotice => '공지';

  @override
  String get mobileNoticeTitle => '공지사항';

  @override
  String get mobileNoticePinned => '상단 고정';

  @override
  String get mobileNoticeRecent => '최근';

  @override
  String mobileNoticeViews(Object n) {
    return '조회 $n';
  }

  @override
  String get mobileNoticeEmpty => '공지가 없어요';

  @override
  String get mobileNoticeRequiredTag => '[필수]';

  @override
  String get mobileNoticePinnedTitle => '연차 소멸 정책 변경 안내';

  @override
  String get mobileNoticePinnedBody => '2026년부터 연차는 발생일 기준 2년 이내 사용해야 합니다. 미사용 시 자동 소멸…';

  @override
  String get mobileNoticeDemoWorkshopTag => '워크샵';

  @override
  String get mobileNoticeDemoWorkshopTitle => '12월 팀 워크샵 신청 안내';

  @override
  String get mobileNoticeDemoWorkshopSub => '제주도 2박 3일 · 12/20 출발';

  @override
  String get mobileNoticeDemoSystemTag => '시스템';

  @override
  String get mobileNoticeDemoSystemTitle => '출퇴근 앱 v2.1 업데이트';

  @override
  String get mobileNoticeDemoSystemSub => '위젯 기능 추가 · 성능 개선';

  @override
  String get mobileSettingsTitle => '설정';

  @override
  String get mobileSettingsProfileSection => '내 정보';

  @override
  String get mobileSettingsNotificationsSection => '알림';

  @override
  String get mobileSettingsAppearanceSection => '테마';

  @override
  String get mobileSettingsNotifClock => '출퇴근 알림';

  @override
  String get mobileSettingsNotifLeave => '연차 소멸 안내';

  @override
  String get mobileSettingsNotifOvertime => '초과근무 결과';

  @override
  String get mobileSettingsOn => '켜짐';

  @override
  String get mobileSettingsOff => '꺼짐';

  @override
  String get mobileCustomizeTitle => '화면 꾸미기';

  @override
  String get mobileCustomizeTheme => '테마';

  @override
  String get mobileCustomizeThemeLight => '라이트';

  @override
  String get mobileCustomizeThemeDark => '다크';

  @override
  String get mobileCustomizeBrand => '브랜드 컬러';

  @override
  String get mobileCustomizeFontSize => '글자 크기';

  @override
  String get mobileCustomizeFontSm => '작게';

  @override
  String get mobileCustomizeFontMd => '보통';

  @override
  String get mobileCustomizeFontLg => '크게';

  @override
  String get mobileCustomizeLanguage => '언어';

  @override
  String get mobileCustomizeReset => '기본값으로';

  @override
  String get mobileTripTitle => '출장/외근';

  @override
  String get mobileTripStartsOn => '시작일';

  @override
  String get mobileTripEndsOn => '종료일';

  @override
  String get mobileTripPlace => '장소';

  @override
  String get mobileTripPurpose => '목적';

  @override
  String get mobileTripSubmit => '등록하기';

  @override
  String get mobileTripSubmitted => '등록되었어요';

  @override
  String get mobileTripComingSoon => '곧 출시될 기능이에요';

  @override
  String get mobileHelpTitle => '도움말';

  @override
  String get mobileHelpFaqQ1 => '출근이 안 잡혀요';

  @override
  String get mobileHelpFaqA1 => '위치 권한이 허용됐는지 확인해 주세요. 회사 위치 100m 이내에서만 자동 인식돼요.';

  @override
  String get mobileHelpFaqQ2 => '연차가 며칠 남았는지 어떻게 봐요?';

  @override
  String get mobileHelpFaqA2 => '[연차] 탭에서 잔여/사용/소멸을 확인할 수 있어요.';

  @override
  String get mobileHelpFaqQ3 => '초과근무는 어떻게 신청해요?';

  @override
  String get mobileHelpFaqA3 => '[홈]에서 정규 퇴근 시간이 지나면 초과근무 요청 카드가 떠요. 또는 [마이>설정>초과근무]에서 직접 신청할 수 있어요.';

  @override
  String get mobileHelpFaqQ4 => '푸시 알림이 안 와요';

  @override
  String get mobileHelpFaqA4 => '[마이>알림 설정]에서 알림 받기 토글을 켜고, OS 알림 권한과 백그라운드 새로고침이 활성됐는지 확인해 주세요. 안드로이드는 배터리 최적화에서 앱을 제외해 주세요.';

  @override
  String get mobileHelpFaqQ5 => '비밀번호를 잊었어요';

  @override
  String get mobileHelpFaqA5 => '로그인 화면 > [비밀번호를 잊으셨나요?] > 회사 이메일 입력 > 메일의 링크 클릭 > 새 비밀번호 설정.';

  @override
  String get mobileHelpFaqQ6 => '회사 코드를 어떻게 받나요?';

  @override
  String get mobileHelpFaqA6 => '회사의 인사 담당자 또는 관리자에게 6자리 회사 코드 (예: ACMEDM) 를 받으세요. 코드는 사이드바에서 관리자만 발급/만료할 수 있어요.';

  @override
  String get mobileHelpContact => '문의하기';

  @override
  String get mobileHelpManualsTitle => '전체 매뉴얼';

  @override
  String get mobileHelpManualsSub => '역할별 가이드를 확인해 보세요';

  @override
  String get mobileHelpManualEmployee => '직원 가이드';

  @override
  String get mobileHelpManualManager => '매니저 가이드';

  @override
  String get mobileHelpManualAdmin => '관리자 가이드';

  @override
  String get mobileHelpManualOwner => '소유주 가이드';

  @override
  String get mobileHelpManualLinkExternal => '(웹 가이드 열기)';

  @override
  String get mobileRecordTitle => '근무 상세';

  @override
  String get mobileRecordTotalWork => '총 근무';

  @override
  String get mobileRecordTimeline => '타임라인';

  @override
  String get mobileRecordMemo => '메모';

  @override
  String get mobileRecordOvertimeApproved => '초과근무 승인됨';

  @override
  String get mobileRecordLabelIn => '출근';

  @override
  String get mobileRecordLabelOut => '퇴근';

  @override
  String get mobileRecordLabelBreak => '휴게';

  @override
  String get mobileWeeklyTitle => '이번 주 리포트';

  @override
  String get mobileWeeklyTotal => '총 근무';

  @override
  String get mobileWeeklyAvg => '일 평균';

  @override
  String get mobileWeeklyOvertime => '초과';

  @override
  String get mobileWeeklyTarget => '목표';

  @override
  String mobileWeeklyAboveAvg(Object n) {
    return '평균보다 ${n}h 많아요';
  }

  @override
  String mobileWeeklyBelowAvg(Object n) {
    return '평균보다 ${n}h 적어요';
  }

  @override
  String get mobileLocPickerTitle => '근무지를 선택해 주세요';

  @override
  String get mobileLocPickerSub => '자동 감지와 다르다면 직접 바꿀 수 있어요';

  @override
  String get mobileLocPickerOffice => '본사';

  @override
  String get mobileLocPickerHome => '재택';

  @override
  String get mobileLocPickerOutside => '외근';

  @override
  String get mobileLocPickerConfirm => '확인';

  @override
  String get mobileErrorGpsTitle => '위치를 확인할 수 없어요';

  @override
  String get mobileErrorGpsSub => '위치 권한을 허용했는지 확인해 주세요. 수동으로 재택/본사를 선택할 수도 있어요.';

  @override
  String get mobileErrorGpsRetry => '다시 시도';

  @override
  String get mobileErrorGpsManual => '수동으로 선택';

  @override
  String get mobileProfileFullTitle => '프로필';

  @override
  String get mobileProfileFullKpiAttendance => '출근율';

  @override
  String get mobileProfileFullKpiLeaveUsed => '연차 사용';

  @override
  String get mobileProfileFullKpiAvgWork => '일 평균';

  @override
  String get mobileTeamTabsGrid => '그리드';

  @override
  String get mobileTeamTabsGrouped => '팀별';

  @override
  String get mobileTeamTabsTimeline => '타임라인';

  @override
  String mobileTeamDemoWorkingCount(Object total, Object working) {
    return '$working/$total 근무 중';
  }

  @override
  String get mobileTeamDemoTeamDesign => '디자인';

  @override
  String get mobileTeamDemoTeamEngineering => '엔지니어링';

  @override
  String get mobileTeamDemoTeamProduct => '프로덕트';

  @override
  String get mobileTeamDemoTeamOperations => '오퍼레이션';

  @override
  String get mobileTeamDemoMemberJiwoo => '지우';

  @override
  String get mobileTeamDemoMemberMinsoo => '민수';

  @override
  String get mobileTeamDemoMemberYerin => '예린';

  @override
  String get mobileTeamDemoMemberHyunwoo => '현우';

  @override
  String get mobileTeamDemoMemberSooa => '수아';

  @override
  String get mobileTeamDemoMemberDoyoon => '도윤';
}
