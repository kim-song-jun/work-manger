import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_ko.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'generated/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale) : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates = <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('ko')
  ];

  /// No description provided for @appTitle.
  ///
  /// In ko, this message translates to:
  /// **'근무 관리'**
  String get appTitle;

  /// No description provided for @navHome.
  ///
  /// In ko, this message translates to:
  /// **'홈'**
  String get navHome;

  /// No description provided for @navTeam.
  ///
  /// In ko, this message translates to:
  /// **'팀'**
  String get navTeam;

  /// No description provided for @navLeave.
  ///
  /// In ko, this message translates to:
  /// **'연차'**
  String get navLeave;

  /// No description provided for @navMy.
  ///
  /// In ko, this message translates to:
  /// **'마이'**
  String get navMy;

  /// No description provided for @authLogin.
  ///
  /// In ko, this message translates to:
  /// **'로그인'**
  String get authLogin;

  /// No description provided for @authSignup.
  ///
  /// In ko, this message translates to:
  /// **'회원가입'**
  String get authSignup;

  /// No description provided for @authLoginTitle.
  ///
  /// In ko, this message translates to:
  /// **'안녕하세요\n오늘도 기록해볼까요?'**
  String get authLoginTitle;

  /// No description provided for @authLoginSub.
  ///
  /// In ko, this message translates to:
  /// **'회사에서 받은 이메일로 로그인해주세요.'**
  String get authLoginSub;

  /// No description provided for @authSignupTitle.
  ///
  /// In ko, this message translates to:
  /// **'회사 이메일로\n시작해볼까요?'**
  String get authSignupTitle;

  /// No description provided for @authSignupSub.
  ///
  /// In ko, this message translates to:
  /// **'조직 도메인으로 계정을 만들고 팀 초대를 확인하세요.'**
  String get authSignupSub;

  /// No description provided for @authEmail.
  ///
  /// In ko, this message translates to:
  /// **'이메일'**
  String get authEmail;

  /// No description provided for @authWorkEmail.
  ///
  /// In ko, this message translates to:
  /// **'회사 이메일'**
  String get authWorkEmail;

  /// No description provided for @authPassword.
  ///
  /// In ko, this message translates to:
  /// **'비밀번호'**
  String get authPassword;

  /// No description provided for @authName.
  ///
  /// In ko, this message translates to:
  /// **'이름'**
  String get authName;

  /// No description provided for @authSubmit.
  ///
  /// In ko, this message translates to:
  /// **'확인'**
  String get authSubmit;

  /// No description provided for @authNoAccount.
  ///
  /// In ko, this message translates to:
  /// **'계정이 없나요?'**
  String get authNoAccount;

  /// No description provided for @authHaveAccount.
  ///
  /// In ko, this message translates to:
  /// **'이미 계정이 있나요?'**
  String get authHaveAccount;

  /// No description provided for @authInvalid.
  ///
  /// In ko, this message translates to:
  /// **'이메일 또는 비밀번호가 올바르지 않습니다.'**
  String get authInvalid;

  /// No description provided for @authForgot.
  ///
  /// In ko, this message translates to:
  /// **'비밀번호를 잊으셨나요?'**
  String get authForgot;

  /// No description provided for @authHelp.
  ///
  /// In ko, this message translates to:
  /// **'도움 받기'**
  String get authHelp;

  /// No description provided for @authForgotTitle.
  ///
  /// In ko, this message translates to:
  /// **'비밀번호 재설정'**
  String get authForgotTitle;

  /// No description provided for @authForgotDesc.
  ///
  /// In ko, this message translates to:
  /// **'가입한 이메일로 재설정 링크를 보내드릴게요.'**
  String get authForgotDesc;

  /// No description provided for @authForgotSend.
  ///
  /// In ko, this message translates to:
  /// **'재설정 링크 보내기'**
  String get authForgotSend;

  /// No description provided for @authForgotDone.
  ///
  /// In ko, this message translates to:
  /// **'이메일을 확인해주세요.'**
  String get authForgotDone;

  /// No description provided for @authBackToLogin.
  ///
  /// In ko, this message translates to:
  /// **'로그인으로 돌아가기'**
  String get authBackToLogin;

  /// No description provided for @authPasswordHint.
  ///
  /// In ko, this message translates to:
  /// **'8자 이상, 영문 + 숫자 + 특수문자 포함'**
  String get authPasswordHint;

  /// No description provided for @homeGoodMorning.
  ///
  /// In ko, this message translates to:
  /// **'안녕하세요, 좋은 아침이에요'**
  String get homeGoodMorning;

  /// No description provided for @homeGoodEvening.
  ///
  /// In ko, this message translates to:
  /// **'오늘 하루 수고하셨어요'**
  String get homeGoodEvening;

  /// No description provided for @homeTodayWork.
  ///
  /// In ko, this message translates to:
  /// **'오늘 근무'**
  String get homeTodayWork;

  /// No description provided for @homeAtOffice.
  ///
  /// In ko, this message translates to:
  /// **'본사에서 근무 중'**
  String get homeAtOffice;

  /// No description provided for @homeAtWfh.
  ///
  /// In ko, this message translates to:
  /// **'재택에서 근무 중'**
  String get homeAtWfh;

  /// No description provided for @homeAutoDetected.
  ///
  /// In ko, this message translates to:
  /// **'자동 감지됨'**
  String get homeAutoDetected;

  /// No description provided for @homeChange.
  ///
  /// In ko, this message translates to:
  /// **'변경'**
  String get homeChange;

  /// No description provided for @homeSlideIn.
  ///
  /// In ko, this message translates to:
  /// **'밀어서 출근'**
  String get homeSlideIn;

  /// No description provided for @homeSlideOut.
  ///
  /// In ko, this message translates to:
  /// **'밀어서 퇴근'**
  String get homeSlideOut;

  /// No description provided for @homeWeekLabel.
  ///
  /// In ko, this message translates to:
  /// **'이번 주'**
  String get homeWeekLabel;

  /// No description provided for @homeLeaveBalance.
  ///
  /// In ko, this message translates to:
  /// **'잔여 연차'**
  String get homeLeaveBalance;

  /// No description provided for @homeOvertimeLabel.
  ///
  /// In ko, this message translates to:
  /// **'초과 누적'**
  String get homeOvertimeLabel;

  /// No description provided for @homeTeamStatus.
  ///
  /// In ko, this message translates to:
  /// **'팀 현황'**
  String get homeTeamStatus;

  /// No description provided for @homeClockInOffice.
  ///
  /// In ko, this message translates to:
  /// **'본사 출근'**
  String get homeClockInOffice;

  /// No description provided for @homeClockInWfh.
  ///
  /// In ko, this message translates to:
  /// **'재택 출근'**
  String get homeClockInWfh;

  /// No description provided for @homeClockInSuccess.
  ///
  /// In ko, this message translates to:
  /// **'출근이 등록됐어요'**
  String get homeClockInSuccess;

  /// No description provided for @homeClockInFailed.
  ///
  /// In ko, this message translates to:
  /// **'출근 등록에 실패했어요'**
  String get homeClockInFailed;

  /// No description provided for @homeGeoUnsupported.
  ///
  /// In ko, this message translates to:
  /// **'위치 정보를 사용할 수 없어요'**
  String get homeGeoUnsupported;

  /// No description provided for @homeGeoDenied.
  ///
  /// In ko, this message translates to:
  /// **'위치 권한을 허용해주세요'**
  String get homeGeoDenied;

  /// No description provided for @homeOpenTweaks.
  ///
  /// In ko, this message translates to:
  /// **'테마 설정'**
  String get homeOpenTweaks;

  /// No description provided for @homeLabelClockIn.
  ///
  /// In ko, this message translates to:
  /// **'출근'**
  String get homeLabelClockIn;

  /// No description provided for @homeLabelClockOut.
  ///
  /// In ko, this message translates to:
  /// **'퇴근'**
  String get homeLabelClockOut;

  /// No description provided for @homeLabelRegular.
  ///
  /// In ko, this message translates to:
  /// **'정규'**
  String get homeLabelRegular;

  /// No description provided for @homeLocationOfficeName.
  ///
  /// In ko, this message translates to:
  /// **'강남 오피스'**
  String get homeLocationOfficeName;

  /// No description provided for @homeFakeMember_1.
  ///
  /// In ko, this message translates to:
  /// **'지우'**
  String get homeFakeMember_1;

  /// No description provided for @homeFakeMember_2.
  ///
  /// In ko, this message translates to:
  /// **'민수'**
  String get homeFakeMember_2;

  /// No description provided for @homeFakeMember_3.
  ///
  /// In ko, this message translates to:
  /// **'예린'**
  String get homeFakeMember_3;

  /// No description provided for @homeFakeMember_4.
  ///
  /// In ko, this message translates to:
  /// **'현우'**
  String get homeFakeMember_4;

  /// No description provided for @homeFakeMember_5.
  ///
  /// In ko, this message translates to:
  /// **'수아'**
  String get homeFakeMember_5;

  /// No description provided for @homeFakeMember_6.
  ///
  /// In ko, this message translates to:
  /// **'도윤'**
  String get homeFakeMember_6;

  /// No description provided for @homeFakeMember_7.
  ///
  /// In ko, this message translates to:
  /// **'하린'**
  String get homeFakeMember_7;

  /// No description provided for @homeStatusWorking.
  ///
  /// In ko, this message translates to:
  /// **'근무 중'**
  String get homeStatusWorking;

  /// No description provided for @homeProgressLabel.
  ///
  /// In ko, this message translates to:
  /// **'정규 대비'**
  String get homeProgressLabel;

  /// No description provided for @homeTeamCountOffice.
  ///
  /// In ko, this message translates to:
  /// **'{n}명 출근'**
  String homeTeamCountOffice(Object n);

  /// No description provided for @homeTeamCountWfh.
  ///
  /// In ko, this message translates to:
  /// **'{n}명 재택'**
  String homeTeamCountWfh(Object n);

  /// No description provided for @homeTeamCountLeave.
  ///
  /// In ko, this message translates to:
  /// **'{n}명 휴가'**
  String homeTeamCountLeave(Object n);

  /// No description provided for @homeTeamCountBreak.
  ///
  /// In ko, this message translates to:
  /// **'{n}명 휴게'**
  String homeTeamCountBreak(Object n);

  /// No description provided for @teamTitle.
  ///
  /// In ko, this message translates to:
  /// **'팀 현황'**
  String get teamTitle;

  /// No description provided for @teamEmpty.
  ///
  /// In ko, this message translates to:
  /// **'팀원이 없어요'**
  String get teamEmpty;

  /// No description provided for @teamLoading.
  ///
  /// In ko, this message translates to:
  /// **'불러오는 중'**
  String get teamLoading;

  /// No description provided for @leaveTitle.
  ///
  /// In ko, this message translates to:
  /// **'연차'**
  String get leaveTitle;

  /// No description provided for @leaveBalance.
  ///
  /// In ko, this message translates to:
  /// **'잔여'**
  String get leaveBalance;

  /// No description provided for @leaveUsed.
  ///
  /// In ko, this message translates to:
  /// **'사용'**
  String get leaveUsed;

  /// No description provided for @leaveAccrued.
  ///
  /// In ko, this message translates to:
  /// **'발생'**
  String get leaveAccrued;

  /// No description provided for @leaveExpiring.
  ///
  /// In ko, this message translates to:
  /// **'소멸 예정'**
  String get leaveExpiring;

  /// No description provided for @leaveApply.
  ///
  /// In ko, this message translates to:
  /// **'연차 신청'**
  String get leaveApply;

  /// No description provided for @leaveNoneYet.
  ///
  /// In ko, this message translates to:
  /// **'아직 연차 정보가 없어요'**
  String get leaveNoneYet;

  /// No description provided for @leaveDaysUnit.
  ///
  /// In ko, this message translates to:
  /// **'일'**
  String get leaveDaysUnit;

  /// No description provided for @leaveTypeAnnual.
  ///
  /// In ko, this message translates to:
  /// **'연차'**
  String get leaveTypeAnnual;

  /// No description provided for @leaveTypeComp.
  ///
  /// In ko, this message translates to:
  /// **'보상휴가'**
  String get leaveTypeComp;

  /// No description provided for @leaveTypeSick.
  ///
  /// In ko, this message translates to:
  /// **'병가'**
  String get leaveTypeSick;

  /// No description provided for @leaveTypePersonal.
  ///
  /// In ko, this message translates to:
  /// **'개인 사유'**
  String get leaveTypePersonal;

  /// No description provided for @myTitle.
  ///
  /// In ko, this message translates to:
  /// **'마이'**
  String get myTitle;

  /// No description provided for @myProfile.
  ///
  /// In ko, this message translates to:
  /// **'프로필'**
  String get myProfile;

  /// No description provided for @mySettings.
  ///
  /// In ko, this message translates to:
  /// **'설정'**
  String get mySettings;

  /// No description provided for @myCustomize.
  ///
  /// In ko, this message translates to:
  /// **'화면 꾸미기'**
  String get myCustomize;

  /// No description provided for @myHelp.
  ///
  /// In ko, this message translates to:
  /// **'도움말'**
  String get myHelp;

  /// No description provided for @myLogout.
  ///
  /// In ko, this message translates to:
  /// **'로그아웃'**
  String get myLogout;

  /// No description provided for @onbNext.
  ///
  /// In ko, this message translates to:
  /// **'다음'**
  String get onbNext;

  /// No description provided for @onbBack.
  ///
  /// In ko, this message translates to:
  /// **'이전'**
  String get onbBack;

  /// No description provided for @onbSkip.
  ///
  /// In ko, this message translates to:
  /// **'건너뛰기'**
  String get onbSkip;

  /// No description provided for @onbLater.
  ///
  /// In ko, this message translates to:
  /// **'나중에 할게요'**
  String get onbLater;

  /// No description provided for @onbWelcomeTitle.
  ///
  /// In ko, this message translates to:
  /// **'출근부터 연차까지\n한 번에 관리하세요'**
  String get onbWelcomeTitle;

  /// No description provided for @onbWelcomeSub.
  ///
  /// In ko, this message translates to:
  /// **'우리 회사를 위한 가장 단순한 근무 관리 도구'**
  String get onbWelcomeSub;

  /// No description provided for @onbWelcomeStart.
  ///
  /// In ko, this message translates to:
  /// **'시작하기'**
  String get onbWelcomeStart;

  /// No description provided for @onbFeatureLocTitle.
  ///
  /// In ko, this message translates to:
  /// **'위치 기반 자동 출근'**
  String get onbFeatureLocTitle;

  /// No description provided for @onbFeatureLocSub.
  ///
  /// In ko, this message translates to:
  /// **'본사·재택 자동 인식'**
  String get onbFeatureLocSub;

  /// No description provided for @onbFeatureLeaveTitle.
  ///
  /// In ko, this message translates to:
  /// **'연차 자동 발생·소멸'**
  String get onbFeatureLeaveTitle;

  /// No description provided for @onbFeatureLeaveSub.
  ///
  /// In ko, this message translates to:
  /// **'깜빡할 일 없도록 안내'**
  String get onbFeatureLeaveSub;

  /// No description provided for @onbFeatureTeamTitle.
  ///
  /// In ko, this message translates to:
  /// **'팀원 근무 상태 한눈에'**
  String get onbFeatureTeamTitle;

  /// No description provided for @onbFeatureTeamSub.
  ///
  /// In ko, this message translates to:
  /// **'실시간 협업이 더 쉬워져요'**
  String get onbFeatureTeamSub;

  /// No description provided for @onbCodeTitle.
  ///
  /// In ko, this message translates to:
  /// **'회사 코드를 입력해주세요'**
  String get onbCodeTitle;

  /// No description provided for @onbCodeSub.
  ///
  /// In ko, this message translates to:
  /// **'관리자에게 받은 6자리 코드를 입력하세요'**
  String get onbCodeSub;

  /// No description provided for @onbCodeHelp.
  ///
  /// In ko, this message translates to:
  /// **'코드를 모르시나요?'**
  String get onbCodeHelp;

  /// No description provided for @onbCodeContactAdmin.
  ///
  /// In ko, this message translates to:
  /// **'관리자에게 문의'**
  String get onbCodeContactAdmin;

  /// No description provided for @onbProfileTitle.
  ///
  /// In ko, this message translates to:
  /// **'프로필을 만들어요'**
  String get onbProfileTitle;

  /// No description provided for @onbProfileSub.
  ///
  /// In ko, this message translates to:
  /// **'팀원들에게 어떻게 보일지 설정해요'**
  String get onbProfileSub;

  /// No description provided for @onbProfileName.
  ///
  /// In ko, this message translates to:
  /// **'이름'**
  String get onbProfileName;

  /// No description provided for @onbProfileTeam.
  ///
  /// In ko, this message translates to:
  /// **'소속 팀'**
  String get onbProfileTeam;

  /// No description provided for @onbProfileRole.
  ///
  /// In ko, this message translates to:
  /// **'직책'**
  String get onbProfileRole;

  /// No description provided for @onbProfileEmpNo.
  ///
  /// In ko, this message translates to:
  /// **'사번'**
  String get onbProfileEmpNo;

  /// No description provided for @onbLocationTitle.
  ///
  /// In ko, this message translates to:
  /// **'위치를 등록해주세요'**
  String get onbLocationTitle;

  /// No description provided for @onbLocationSub.
  ///
  /// In ko, this message translates to:
  /// **'본사·재택 위치를 자동으로 인식해요'**
  String get onbLocationSub;

  /// No description provided for @onbLocationOffice.
  ///
  /// In ko, this message translates to:
  /// **'본사 — {name}'**
  String onbLocationOffice(Object name);

  /// No description provided for @onbLocationRadius.
  ///
  /// In ko, this message translates to:
  /// **'반경 100m'**
  String get onbLocationRadius;

  /// No description provided for @onbLocationWfh.
  ///
  /// In ko, this message translates to:
  /// **'재택 위치'**
  String get onbLocationWfh;

  /// No description provided for @onbLocationWfhSub.
  ///
  /// In ko, this message translates to:
  /// **'지금 위치를 재택으로 등록'**
  String get onbLocationWfhSub;

  /// No description provided for @onbLocationPrivacy.
  ///
  /// In ko, this message translates to:
  /// **'위치는 출퇴근 인식에만 사용되며, 근무 시간 외에는 추적하지 않아요.'**
  String get onbLocationPrivacy;

  /// No description provided for @onbLocationOfficeAddress.
  ///
  /// In ko, this message translates to:
  /// **'서울 강남구'**
  String get onbLocationOfficeAddress;

  /// No description provided for @onbScheduleTitle.
  ///
  /// In ko, this message translates to:
  /// **'근무시간을 확인하세요'**
  String get onbScheduleTitle;

  /// No description provided for @onbScheduleSub.
  ///
  /// In ko, this message translates to:
  /// **'관리자가 설정한 표준 시간이에요'**
  String get onbScheduleSub;

  /// No description provided for @onbScheduleStandard.
  ///
  /// In ko, this message translates to:
  /// **'표준 근무시간'**
  String get onbScheduleStandard;

  /// No description provided for @onbSchedulePattern.
  ///
  /// In ko, this message translates to:
  /// **'근무 패턴'**
  String get onbSchedulePattern;

  /// No description provided for @onbScheduleLunch.
  ///
  /// In ko, this message translates to:
  /// **'점심 12:00–13:00 · 주 40시간'**
  String get onbScheduleLunch;

  /// No description provided for @onbNotifTitle.
  ///
  /// In ko, this message translates to:
  /// **'알림을 받을까요?'**
  String get onbNotifTitle;

  /// No description provided for @onbNotifSub.
  ///
  /// In ko, this message translates to:
  /// **'중요한 일은 놓치지 않게요'**
  String get onbNotifSub;

  /// No description provided for @onbNotifClock.
  ///
  /// In ko, this message translates to:
  /// **'출퇴근 알림'**
  String get onbNotifClock;

  /// No description provided for @onbNotifClockSub.
  ///
  /// In ko, this message translates to:
  /// **'출근 시간 10분 전'**
  String get onbNotifClockSub;

  /// No description provided for @onbNotifLeave.
  ///
  /// In ko, this message translates to:
  /// **'연차 소멸 안내'**
  String get onbNotifLeave;

  /// No description provided for @onbNotifLeaveSub.
  ///
  /// In ko, this message translates to:
  /// **'소멸 30일 전 / 7일 전'**
  String get onbNotifLeaveSub;

  /// No description provided for @onbNotifOvertime.
  ///
  /// In ko, this message translates to:
  /// **'초과근무 승인 결과'**
  String get onbNotifOvertime;

  /// No description provided for @onbNotifOvertimeSub.
  ///
  /// In ko, this message translates to:
  /// **'관리자 승인 즉시'**
  String get onbNotifOvertimeSub;

  /// No description provided for @onbWidgetTitle.
  ///
  /// In ko, this message translates to:
  /// **'홈 화면에 위젯을 추가할까요?'**
  String get onbWidgetTitle;

  /// No description provided for @onbWidgetSub.
  ///
  /// In ko, this message translates to:
  /// **'앱을 열지 않고도 출근할 수 있어요'**
  String get onbWidgetSub;

  /// No description provided for @onbWidgetAdd.
  ///
  /// In ko, this message translates to:
  /// **'위젯 추가하기'**
  String get onbWidgetAdd;

  /// No description provided for @onbDoneTitle.
  ///
  /// In ko, this message translates to:
  /// **'준비 완료!'**
  String get onbDoneTitle;

  /// No description provided for @onbDoneSub.
  ///
  /// In ko, this message translates to:
  /// **'첫 출근을 응원해요\n아래 가이드를 따라가 보세요'**
  String get onbDoneSub;

  /// No description provided for @onbDoneStep1.
  ///
  /// In ko, this message translates to:
  /// **'본사 도착하면 자동 출근'**
  String get onbDoneStep1;

  /// No description provided for @onbDoneStep1Sub.
  ///
  /// In ko, this message translates to:
  /// **'GPS가 위치를 인식해요'**
  String get onbDoneStep1Sub;

  /// No description provided for @onbDoneStep2.
  ///
  /// In ko, this message translates to:
  /// **'점심 후 휴게 등록'**
  String get onbDoneStep2;

  /// No description provided for @onbDoneStep2Sub.
  ///
  /// In ko, this message translates to:
  /// **'12:00–13:00 자동 차감'**
  String get onbDoneStep2Sub;

  /// No description provided for @onbDoneStep3.
  ///
  /// In ko, this message translates to:
  /// **'퇴근은 직접 탭하기'**
  String get onbDoneStep3;

  /// No description provided for @onbDoneStep3Sub.
  ///
  /// In ko, this message translates to:
  /// **'오늘 근무가 마무리돼요'**
  String get onbDoneStep3Sub;

  /// No description provided for @onbDoneGoHome.
  ///
  /// In ko, this message translates to:
  /// **'홈으로 가기'**
  String get onbDoneGoHome;

  /// No description provided for @onbScheduleOvertimeTitle.
  ///
  /// In ko, this message translates to:
  /// **'초과근무 자동 감지'**
  String get onbScheduleOvertimeTitle;

  /// No description provided for @onbScheduleOvertimeSub.
  ///
  /// In ko, this message translates to:
  /// **'18시 이후 근무 시 승인 요청'**
  String get onbScheduleOvertimeSub;

  /// No description provided for @onbScheduleLeaveTitle.
  ///
  /// In ko, this message translates to:
  /// **'연차 자동 발생'**
  String get onbScheduleLeaveTitle;

  /// No description provided for @onbScheduleLeaveSub.
  ///
  /// In ko, this message translates to:
  /// **'매월 1일 입사일 기준'**
  String get onbScheduleLeaveSub;

  /// No description provided for @onbWidgetSizeSmall.
  ///
  /// In ko, this message translates to:
  /// **'Small'**
  String get onbWidgetSizeSmall;

  /// No description provided for @onbWidgetSizeSmallSub.
  ///
  /// In ko, this message translates to:
  /// **'근무시간만'**
  String get onbWidgetSizeSmallSub;

  /// No description provided for @onbWidgetSizeMedium.
  ///
  /// In ko, this message translates to:
  /// **'Medium'**
  String get onbWidgetSizeMedium;

  /// No description provided for @onbWidgetSizeMediumSub.
  ///
  /// In ko, this message translates to:
  /// **'근무 + 팀'**
  String get onbWidgetSizeMediumSub;

  /// No description provided for @onbWidgetSizeLarge.
  ///
  /// In ko, this message translates to:
  /// **'Large'**
  String get onbWidgetSizeLarge;

  /// No description provided for @onbWidgetSizeLargeSub.
  ///
  /// In ko, this message translates to:
  /// **'풀 대시보드'**
  String get onbWidgetSizeLargeSub;

  /// No description provided for @onbWidgetDemoToday.
  ///
  /// In ko, this message translates to:
  /// **'오늘 근무'**
  String get onbWidgetDemoToday;

  /// No description provided for @onbWidgetDemoOfficeTime.
  ///
  /// In ko, this message translates to:
  /// **'본사 · 09:02'**
  String get onbWidgetDemoOfficeTime;

  /// No description provided for @onbWidgetDemoClockOut.
  ///
  /// In ko, this message translates to:
  /// **'퇴근하기'**
  String get onbWidgetDemoClockOut;

  /// No description provided for @tweaksTitle.
  ///
  /// In ko, this message translates to:
  /// **'테마 설정'**
  String get tweaksTitle;

  /// No description provided for @tweaksTheme.
  ///
  /// In ko, this message translates to:
  /// **'테마'**
  String get tweaksTheme;

  /// No description provided for @tweaksThemeLight.
  ///
  /// In ko, this message translates to:
  /// **'라이트'**
  String get tweaksThemeLight;

  /// No description provided for @tweaksThemeDark.
  ///
  /// In ko, this message translates to:
  /// **'다크'**
  String get tweaksThemeDark;

  /// No description provided for @tweaksBrand.
  ///
  /// In ko, this message translates to:
  /// **'브랜드 컬러'**
  String get tweaksBrand;

  /// No description provided for @tweaksFontSize.
  ///
  /// In ko, this message translates to:
  /// **'글자 크기'**
  String get tweaksFontSize;

  /// No description provided for @tweaksFontSm.
  ///
  /// In ko, this message translates to:
  /// **'작게'**
  String get tweaksFontSm;

  /// No description provided for @tweaksFontMd.
  ///
  /// In ko, this message translates to:
  /// **'보통'**
  String get tweaksFontMd;

  /// No description provided for @tweaksFontLg.
  ///
  /// In ko, this message translates to:
  /// **'크게'**
  String get tweaksFontLg;

  /// No description provided for @tweaksLanguage.
  ///
  /// In ko, this message translates to:
  /// **'언어'**
  String get tweaksLanguage;

  /// No description provided for @tweaksReset.
  ///
  /// In ko, this message translates to:
  /// **'기본값으로'**
  String get tweaksReset;

  /// No description provided for @pushSection.
  ///
  /// In ko, this message translates to:
  /// **'푸시 알림'**
  String get pushSection;

  /// No description provided for @pushEnable.
  ///
  /// In ko, this message translates to:
  /// **'푸시 알림 켜기'**
  String get pushEnable;

  /// No description provided for @pushDisable.
  ///
  /// In ko, this message translates to:
  /// **'푸시 알림 끄기'**
  String get pushDisable;

  /// No description provided for @pushSuccess.
  ///
  /// In ko, this message translates to:
  /// **'푸시 알림이 활성화됐어요'**
  String get pushSuccess;

  /// No description provided for @pushDisabled.
  ///
  /// In ko, this message translates to:
  /// **'푸시 알림을 껐어요'**
  String get pushDisabled;

  /// No description provided for @pushErrorUNSUPPORTED.
  ///
  /// In ko, this message translates to:
  /// **'이 브라우저는 푸시 알림을 지원하지 않아요'**
  String get pushErrorUNSUPPORTED;

  /// No description provided for @pushErrorPERMISSION_DENIED.
  ///
  /// In ko, this message translates to:
  /// **'알림 권한이 거부됐어요'**
  String get pushErrorPERMISSION_DENIED;

  /// No description provided for @pushErrorNO_VAPID_KEY.
  ///
  /// In ko, this message translates to:
  /// **'푸시 서버 설정이 필요해요'**
  String get pushErrorNO_VAPID_KEY;

  /// No description provided for @pushErrorSUBSCRIBE_FAILED.
  ///
  /// In ko, this message translates to:
  /// **'구독에 실패했어요'**
  String get pushErrorSUBSCRIBE_FAILED;

  /// No description provided for @pushErrorREGISTER_FAILED.
  ///
  /// In ko, this message translates to:
  /// **'서비스 워커 등록에 실패했어요'**
  String get pushErrorREGISTER_FAILED;

  /// No description provided for @tripTitle.
  ///
  /// In ko, this message translates to:
  /// **'출장/외근'**
  String get tripTitle;

  /// No description provided for @tripNew.
  ///
  /// In ko, this message translates to:
  /// **'새 신청'**
  String get tripNew;

  /// No description provided for @tripMyRequests.
  ///
  /// In ko, this message translates to:
  /// **'내 신청 내역'**
  String get tripMyRequests;

  /// No description provided for @tripEmpty.
  ///
  /// In ko, this message translates to:
  /// **'신청 내역이 없어요'**
  String get tripEmpty;

  /// No description provided for @tripKind.
  ///
  /// In ko, this message translates to:
  /// **'유형'**
  String get tripKind;

  /// No description provided for @tripKindBusiness.
  ///
  /// In ko, this message translates to:
  /// **'출장'**
  String get tripKindBusiness;

  /// No description provided for @tripKindField.
  ///
  /// In ko, this message translates to:
  /// **'외근'**
  String get tripKindField;

  /// No description provided for @tripStartsOn.
  ///
  /// In ko, this message translates to:
  /// **'시작일'**
  String get tripStartsOn;

  /// No description provided for @tripEndsOn.
  ///
  /// In ko, this message translates to:
  /// **'종료일'**
  String get tripEndsOn;

  /// No description provided for @tripPlace.
  ///
  /// In ko, this message translates to:
  /// **'장소'**
  String get tripPlace;

  /// No description provided for @tripPurpose.
  ///
  /// In ko, this message translates to:
  /// **'목적'**
  String get tripPurpose;

  /// No description provided for @tripSubmit.
  ///
  /// In ko, this message translates to:
  /// **'신청하기'**
  String get tripSubmit;

  /// No description provided for @tripSubmitted.
  ///
  /// In ko, this message translates to:
  /// **'출장 신청이 등록되었어요'**
  String get tripSubmitted;

  /// No description provided for @tripFailed.
  ///
  /// In ko, this message translates to:
  /// **'신청에 실패했어요'**
  String get tripFailed;

  /// No description provided for @tripStatusPending.
  ///
  /// In ko, this message translates to:
  /// **'대기 중'**
  String get tripStatusPending;

  /// No description provided for @tripStatusApproved.
  ///
  /// In ko, this message translates to:
  /// **'승인'**
  String get tripStatusApproved;

  /// No description provided for @tripStatusRejected.
  ///
  /// In ko, this message translates to:
  /// **'반려'**
  String get tripStatusRejected;

  /// No description provided for @tripStatusCancelled.
  ///
  /// In ko, this message translates to:
  /// **'취소됨'**
  String get tripStatusCancelled;

  /// No description provided for @tripErrorsInvalidRange.
  ///
  /// In ko, this message translates to:
  /// **'종료일은 시작일과 같거나 이후여야 해요'**
  String get tripErrorsInvalidRange;

  /// No description provided for @tripErrorsLocationRequired.
  ///
  /// In ko, this message translates to:
  /// **'장소를 입력해 주세요'**
  String get tripErrorsLocationRequired;

  /// No description provided for @noticeTitle.
  ///
  /// In ko, this message translates to:
  /// **'공지사항'**
  String get noticeTitle;

  /// No description provided for @noticePinned.
  ///
  /// In ko, this message translates to:
  /// **'상단 고정'**
  String get noticePinned;

  /// No description provided for @noticeRecent.
  ///
  /// In ko, this message translates to:
  /// **'최근'**
  String get noticeRecent;

  /// No description provided for @noticeEmpty.
  ///
  /// In ko, this message translates to:
  /// **'공지가 없어요'**
  String get noticeEmpty;

  /// No description provided for @noticeShowPinned.
  ///
  /// In ko, this message translates to:
  /// **'상단 고정만 보기'**
  String get noticeShowPinned;

  /// No description provided for @noticeShowAll.
  ///
  /// In ko, this message translates to:
  /// **'전체 보기'**
  String get noticeShowAll;

  /// No description provided for @noticeCatAll.
  ///
  /// In ko, this message translates to:
  /// **'전체'**
  String get noticeCatAll;

  /// No description provided for @noticeCatPolicy.
  ///
  /// In ko, this message translates to:
  /// **'정책'**
  String get noticeCatPolicy;

  /// No description provided for @noticeCatEvent.
  ///
  /// In ko, this message translates to:
  /// **'이벤트'**
  String get noticeCatEvent;

  /// No description provided for @noticeCatIt.
  ///
  /// In ko, this message translates to:
  /// **'IT'**
  String get noticeCatIt;

  /// No description provided for @noticeCatHr.
  ///
  /// In ko, this message translates to:
  /// **'인사'**
  String get noticeCatHr;

  /// No description provided for @noticeCatGeneral.
  ///
  /// In ko, this message translates to:
  /// **'일반'**
  String get noticeCatGeneral;

  /// No description provided for @commonLoading.
  ///
  /// In ko, this message translates to:
  /// **'불러오는 중'**
  String get commonLoading;

  /// No description provided for @commonRetry.
  ///
  /// In ko, this message translates to:
  /// **'다시 시도'**
  String get commonRetry;

  /// No description provided for @commonError.
  ///
  /// In ko, this message translates to:
  /// **'문제가 발생했어요'**
  String get commonError;

  /// No description provided for @commonCancel.
  ///
  /// In ko, this message translates to:
  /// **'취소'**
  String get commonCancel;

  /// No description provided for @commonConfirm.
  ///
  /// In ko, this message translates to:
  /// **'확인'**
  String get commonConfirm;

  /// No description provided for @commonClose.
  ///
  /// In ko, this message translates to:
  /// **'닫기'**
  String get commonClose;

  /// No description provided for @commonSkipToMain.
  ///
  /// In ko, this message translates to:
  /// **'본문으로 건너뛰기'**
  String get commonSkipToMain;

  /// No description provided for @commonPrev.
  ///
  /// In ko, this message translates to:
  /// **'이전'**
  String get commonPrev;

  /// No description provided for @commonNext.
  ///
  /// In ko, this message translates to:
  /// **'다음'**
  String get commonNext;

  /// No description provided for @commonDaysShortSun.
  ///
  /// In ko, this message translates to:
  /// **'일'**
  String get commonDaysShortSun;

  /// No description provided for @commonDaysShortMon.
  ///
  /// In ko, this message translates to:
  /// **'월'**
  String get commonDaysShortMon;

  /// No description provided for @commonDaysShortTue.
  ///
  /// In ko, this message translates to:
  /// **'화'**
  String get commonDaysShortTue;

  /// No description provided for @commonDaysShortWed.
  ///
  /// In ko, this message translates to:
  /// **'수'**
  String get commonDaysShortWed;

  /// No description provided for @commonDaysShortThu.
  ///
  /// In ko, this message translates to:
  /// **'목'**
  String get commonDaysShortThu;

  /// No description provided for @commonDaysShortFri.
  ///
  /// In ko, this message translates to:
  /// **'금'**
  String get commonDaysShortFri;

  /// No description provided for @commonDaysShortSat.
  ///
  /// In ko, this message translates to:
  /// **'토'**
  String get commonDaysShortSat;

  /// No description provided for @commonYearMonth.
  ///
  /// In ko, this message translates to:
  /// **'{year}년 {month}월'**
  String commonYearMonth(Object month, Object year);

  /// No description provided for @commonMonthDay.
  ///
  /// In ko, this message translates to:
  /// **'{month}월 {day}일'**
  String commonMonthDay(Object day, Object month);

  /// No description provided for @commonWeekdayMonthDay.
  ///
  /// In ko, this message translates to:
  /// **'{weekday} · {month}월 {day}일'**
  String commonWeekdayMonthDay(Object day, Object month, Object weekday);

  /// No description provided for @commonLangKo.
  ///
  /// In ko, this message translates to:
  /// **'한국어'**
  String get commonLangKo;

  /// No description provided for @commonLangEn.
  ///
  /// In ko, this message translates to:
  /// **'English'**
  String get commonLangEn;

  /// No description provided for @commonNotfoundTitle.
  ///
  /// In ko, this message translates to:
  /// **'페이지를 찾을 수 없어요'**
  String get commonNotfoundTitle;

  /// No description provided for @commonNotfoundSub.
  ///
  /// In ko, this message translates to:
  /// **'주소를 다시 확인하거나 아래 버튼으로 이동해주세요'**
  String get commonNotfoundSub;

  /// No description provided for @commonNotfoundGoHome.
  ///
  /// In ko, this message translates to:
  /// **'홈으로'**
  String get commonNotfoundGoHome;

  /// No description provided for @commonNotfoundGoLogin.
  ///
  /// In ko, this message translates to:
  /// **'로그인 화면'**
  String get commonNotfoundGoLogin;

  /// No description provided for @webNavDashboard.
  ///
  /// In ko, this message translates to:
  /// **'대시보드'**
  String get webNavDashboard;

  /// No description provided for @webNavInbox.
  ///
  /// In ko, this message translates to:
  /// **'인박스'**
  String get webNavInbox;

  /// No description provided for @webNavTeamLeave.
  ///
  /// In ko, this message translates to:
  /// **'팀 캘린더'**
  String get webNavTeamLeave;

  /// No description provided for @webNavRecords.
  ///
  /// In ko, this message translates to:
  /// **'기록'**
  String get webNavRecords;

  /// No description provided for @webNavAdmin.
  ///
  /// In ko, this message translates to:
  /// **'관리자'**
  String get webNavAdmin;

  /// No description provided for @webPrimaryNav.
  ///
  /// In ko, this message translates to:
  /// **'주요 메뉴'**
  String get webPrimaryNav;

  /// No description provided for @webWorkspace.
  ///
  /// In ko, this message translates to:
  /// **'내 워크스페이스'**
  String get webWorkspace;

  /// No description provided for @webOpenMenu.
  ///
  /// In ko, this message translates to:
  /// **'메뉴 열기'**
  String get webOpenMenu;

  /// No description provided for @webCloseMenu.
  ///
  /// In ko, this message translates to:
  /// **'메뉴 닫기'**
  String get webCloseMenu;

  /// No description provided for @webOpenUser.
  ///
  /// In ko, this message translates to:
  /// **'사용자 메뉴'**
  String get webOpenUser;

  /// No description provided for @webLogout.
  ///
  /// In ko, this message translates to:
  /// **'로그아웃'**
  String get webLogout;

  /// No description provided for @webTodayKpi.
  ///
  /// In ko, this message translates to:
  /// **'오늘의 KPI'**
  String get webTodayKpi;

  /// No description provided for @webClockInAt.
  ///
  /// In ko, this message translates to:
  /// **'출근 시각'**
  String get webClockInAt;

  /// No description provided for @webCumWork.
  ///
  /// In ko, this message translates to:
  /// **'누적 근무'**
  String get webCumWork;

  /// No description provided for @webLeaveRemaining.
  ///
  /// In ko, this message translates to:
  /// **'잔여 연차'**
  String get webLeaveRemaining;

  /// No description provided for @webTeamPreview.
  ///
  /// In ko, this message translates to:
  /// **'팀 현황 미리보기'**
  String get webTeamPreview;

  /// No description provided for @webRecentRecords.
  ///
  /// In ko, this message translates to:
  /// **'최근 기록'**
  String get webRecentRecords;

  /// No description provided for @webPendingInbox.
  ///
  /// In ko, this message translates to:
  /// **'처리 대기'**
  String get webPendingInbox;

  /// No description provided for @webSeeAll.
  ///
  /// In ko, this message translates to:
  /// **'전체 보기'**
  String get webSeeAll;

  /// No description provided for @webSkeletonLoading.
  ///
  /// In ko, this message translates to:
  /// **'불러오는 중'**
  String get webSkeletonLoading;

  /// No description provided for @inboxTitle.
  ///
  /// In ko, this message translates to:
  /// **'인박스'**
  String get inboxTitle;

  /// No description provided for @inboxFilterAll.
  ///
  /// In ko, this message translates to:
  /// **'전체'**
  String get inboxFilterAll;

  /// No description provided for @inboxFilterPending.
  ///
  /// In ko, this message translates to:
  /// **'대기'**
  String get inboxFilterPending;

  /// No description provided for @inboxFilterApproved.
  ///
  /// In ko, this message translates to:
  /// **'승인'**
  String get inboxFilterApproved;

  /// No description provided for @inboxFilterRejected.
  ///
  /// In ko, this message translates to:
  /// **'반려'**
  String get inboxFilterRejected;

  /// No description provided for @inboxFilterToApprove.
  ///
  /// In ko, this message translates to:
  /// **'내가 승인'**
  String get inboxFilterToApprove;

  /// No description provided for @inboxFilterMine.
  ///
  /// In ko, this message translates to:
  /// **'내 요청'**
  String get inboxFilterMine;

  /// No description provided for @inboxFilterCompany.
  ///
  /// In ko, this message translates to:
  /// **'전사'**
  String get inboxFilterCompany;

  /// No description provided for @inboxSelectToView.
  ///
  /// In ko, this message translates to:
  /// **'왼쪽에서 항목을 선택하세요'**
  String get inboxSelectToView;

  /// No description provided for @inboxRequester.
  ///
  /// In ko, this message translates to:
  /// **'요청자'**
  String get inboxRequester;

  /// No description provided for @inboxRequestedAt.
  ///
  /// In ko, this message translates to:
  /// **'요청 시각'**
  String get inboxRequestedAt;

  /// No description provided for @inboxReason.
  ///
  /// In ko, this message translates to:
  /// **'사유'**
  String get inboxReason;

  /// No description provided for @inboxType.
  ///
  /// In ko, this message translates to:
  /// **'카테고리'**
  String get inboxType;

  /// No description provided for @inboxDetail.
  ///
  /// In ko, this message translates to:
  /// **'상세'**
  String get inboxDetail;

  /// No description provided for @inboxApprove.
  ///
  /// In ko, this message translates to:
  /// **'승인'**
  String get inboxApprove;

  /// No description provided for @inboxReject.
  ///
  /// In ko, this message translates to:
  /// **'반려'**
  String get inboxReject;

  /// No description provided for @inboxRejectReasonLabel.
  ///
  /// In ko, this message translates to:
  /// **'반려 사유 (선택)'**
  String get inboxRejectReasonLabel;

  /// No description provided for @inboxRejectReasonPlaceholder.
  ///
  /// In ko, this message translates to:
  /// **'왜 반려하는지 알려주세요'**
  String get inboxRejectReasonPlaceholder;

  /// No description provided for @inboxSubmitReject.
  ///
  /// In ko, this message translates to:
  /// **'반려 보내기'**
  String get inboxSubmitReject;

  /// No description provided for @inboxApprovedToast.
  ///
  /// In ko, this message translates to:
  /// **'승인했어요'**
  String get inboxApprovedToast;

  /// No description provided for @inboxRejectedToast.
  ///
  /// In ko, this message translates to:
  /// **'반려했어요'**
  String get inboxRejectedToast;

  /// No description provided for @inboxDecisionFailed.
  ///
  /// In ko, this message translates to:
  /// **'처리 중 문제가 발생했어요'**
  String get inboxDecisionFailed;

  /// No description provided for @inboxEmptyList.
  ///
  /// In ko, this message translates to:
  /// **'처리할 항목이 없어요'**
  String get inboxEmptyList;

  /// No description provided for @inboxKindLeave.
  ///
  /// In ko, this message translates to:
  /// **'연차'**
  String get inboxKindLeave;

  /// No description provided for @inboxKindOvertime.
  ///
  /// In ko, this message translates to:
  /// **'초과근무'**
  String get inboxKindOvertime;

  /// No description provided for @inboxKindWfh.
  ///
  /// In ko, this message translates to:
  /// **'재택'**
  String get inboxKindWfh;

  /// No description provided for @recordsTitle.
  ///
  /// In ko, this message translates to:
  /// **'근무 기록'**
  String get recordsTitle;

  /// No description provided for @recordsMonthFilter.
  ///
  /// In ko, this message translates to:
  /// **'월'**
  String get recordsMonthFilter;

  /// No description provided for @recordsStatusFilter.
  ///
  /// In ko, this message translates to:
  /// **'상태'**
  String get recordsStatusFilter;

  /// No description provided for @recordsStatusAll.
  ///
  /// In ko, this message translates to:
  /// **'전체'**
  String get recordsStatusAll;

  /// No description provided for @recordsStatusOk.
  ///
  /// In ko, this message translates to:
  /// **'정상'**
  String get recordsStatusOk;

  /// No description provided for @recordsStatusLate.
  ///
  /// In ko, this message translates to:
  /// **'지각'**
  String get recordsStatusLate;

  /// No description provided for @recordsStatusOt.
  ///
  /// In ko, this message translates to:
  /// **'초과'**
  String get recordsStatusOt;

  /// No description provided for @recordsStatusOff.
  ///
  /// In ko, this message translates to:
  /// **'휴일'**
  String get recordsStatusOff;

  /// No description provided for @recordsColumnDate.
  ///
  /// In ko, this message translates to:
  /// **'일자'**
  String get recordsColumnDate;

  /// No description provided for @recordsColumnIn.
  ///
  /// In ko, this message translates to:
  /// **'출근'**
  String get recordsColumnIn;

  /// No description provided for @recordsColumnOut.
  ///
  /// In ko, this message translates to:
  /// **'퇴근'**
  String get recordsColumnOut;

  /// No description provided for @recordsColumnTotal.
  ///
  /// In ko, this message translates to:
  /// **'근무'**
  String get recordsColumnTotal;

  /// No description provided for @recordsColumnLocation.
  ///
  /// In ko, this message translates to:
  /// **'위치'**
  String get recordsColumnLocation;

  /// No description provided for @recordsColumnStatus.
  ///
  /// In ko, this message translates to:
  /// **'상태'**
  String get recordsColumnStatus;

  /// No description provided for @recordsDetailTitle.
  ///
  /// In ko, this message translates to:
  /// **'근무 상세'**
  String get recordsDetailTitle;

  /// No description provided for @recordsDetailClockIn.
  ///
  /// In ko, this message translates to:
  /// **'출근'**
  String get recordsDetailClockIn;

  /// No description provided for @recordsDetailClockOut.
  ///
  /// In ko, this message translates to:
  /// **'퇴근'**
  String get recordsDetailClockOut;

  /// No description provided for @recordsDetailTotal.
  ///
  /// In ko, this message translates to:
  /// **'총 근무'**
  String get recordsDetailTotal;

  /// No description provided for @recordsDetailLate.
  ///
  /// In ko, this message translates to:
  /// **'지각'**
  String get recordsDetailLate;

  /// No description provided for @recordsDetailLocation.
  ///
  /// In ko, this message translates to:
  /// **'위치'**
  String get recordsDetailLocation;

  /// No description provided for @recordsDetailClose.
  ///
  /// In ko, this message translates to:
  /// **'닫기'**
  String get recordsDetailClose;

  /// No description provided for @recordsLoadMore.
  ///
  /// In ko, this message translates to:
  /// **'더 보기'**
  String get recordsLoadMore;

  /// No description provided for @recordsEmpty.
  ///
  /// In ko, this message translates to:
  /// **'기록이 없어요'**
  String get recordsEmpty;

  /// No description provided for @teamLeaveTitle.
  ///
  /// In ko, this message translates to:
  /// **'팀 연차'**
  String get teamLeaveTitle;

  /// No description provided for @teamLeaveMonth.
  ///
  /// In ko, this message translates to:
  /// **'월'**
  String get teamLeaveMonth;

  /// No description provided for @teamLeaveQuarter.
  ///
  /// In ko, this message translates to:
  /// **'분기'**
  String get teamLeaveQuarter;

  /// No description provided for @teamLeaveLeaveLabel.
  ///
  /// In ko, this message translates to:
  /// **'연차'**
  String get teamLeaveLeaveLabel;

  /// No description provided for @teamLeaveWeekendLabel.
  ///
  /// In ko, this message translates to:
  /// **'주말'**
  String get teamLeaveWeekendLabel;

  /// No description provided for @teamLeaveCellOpen.
  ///
  /// In ko, this message translates to:
  /// **'이 날 휴가 중인 팀원'**
  String get teamLeaveCellOpen;

  /// No description provided for @teamLeaveNoOne.
  ///
  /// In ko, this message translates to:
  /// **'휴가 중인 사람이 없어요'**
  String get teamLeaveNoOne;

  /// No description provided for @complianceTitle.
  ///
  /// In ko, this message translates to:
  /// **'주 52시간'**
  String get complianceTitle;

  /// No description provided for @complianceSub.
  ///
  /// In ko, this message translates to:
  /// **'이번 주 누적 근무 시간을 확인하세요'**
  String get complianceSub;

  /// No description provided for @complianceThreshold.
  ///
  /// In ko, this message translates to:
  /// **'한도'**
  String get complianceThreshold;

  /// No description provided for @complianceCurrent.
  ///
  /// In ko, this message translates to:
  /// **'현재'**
  String get complianceCurrent;

  /// No description provided for @complianceRemaining.
  ///
  /// In ko, this message translates to:
  /// **'남은 시간'**
  String get complianceRemaining;

  /// No description provided for @complianceHoursUnit.
  ///
  /// In ko, this message translates to:
  /// **'시간'**
  String get complianceHoursUnit;

  /// No description provided for @complianceStatusOk.
  ///
  /// In ko, this message translates to:
  /// **'정상'**
  String get complianceStatusOk;

  /// No description provided for @complianceStatusWarn.
  ///
  /// In ko, this message translates to:
  /// **'경고'**
  String get complianceStatusWarn;

  /// No description provided for @complianceStatusOver.
  ///
  /// In ko, this message translates to:
  /// **'초과'**
  String get complianceStatusOver;

  /// No description provided for @complianceHistory.
  ///
  /// In ko, this message translates to:
  /// **'최근 이력'**
  String get complianceHistory;

  /// No description provided for @complianceWeekLabel.
  ///
  /// In ko, this message translates to:
  /// **'{week} 주'**
  String complianceWeekLabel(Object week);

  /// No description provided for @complianceBlockTitle.
  ///
  /// In ko, this message translates to:
  /// **'출근이 차단됐어요'**
  String get complianceBlockTitle;

  /// No description provided for @complianceBlockSub.
  ///
  /// In ko, this message translates to:
  /// **'주 52시간 한도를 초과해 출근할 수 없어요. 매니저와 상의해주세요.'**
  String get complianceBlockSub;

  /// No description provided for @complianceBlockClose.
  ///
  /// In ko, this message translates to:
  /// **'닫기'**
  String get complianceBlockClose;

  /// No description provided for @complianceAdminTitle.
  ///
  /// In ko, this message translates to:
  /// **'52시간 컴플라이언스'**
  String get complianceAdminTitle;

  /// No description provided for @complianceAdminSub.
  ///
  /// In ko, this message translates to:
  /// **'회사 전체 주간 누적'**
  String get complianceAdminSub;

  /// No description provided for @complianceColMember.
  ///
  /// In ko, this message translates to:
  /// **'직원'**
  String get complianceColMember;

  /// No description provided for @complianceColDept.
  ///
  /// In ko, this message translates to:
  /// **'부서'**
  String get complianceColDept;

  /// No description provided for @complianceColHours.
  ///
  /// In ko, this message translates to:
  /// **'누적'**
  String get complianceColHours;

  /// No description provided for @complianceColStatus.
  ///
  /// In ko, this message translates to:
  /// **'상태'**
  String get complianceColStatus;

  /// No description provided for @complianceBulkMessage.
  ///
  /// In ko, this message translates to:
  /// **'선택 인원에 알림 보내기'**
  String get complianceBulkMessage;

  /// No description provided for @complianceEmpty.
  ///
  /// In ko, this message translates to:
  /// **'이번 주 데이터가 없어요'**
  String get complianceEmpty;

  /// No description provided for @complianceMatrixTitle.
  ///
  /// In ko, this message translates to:
  /// **'팀 캘린더'**
  String get complianceMatrixTitle;

  /// No description provided for @complianceMatrixMember.
  ///
  /// In ko, this message translates to:
  /// **'직원'**
  String get complianceMatrixMember;

  /// No description provided for @complianceMatrixLegendOffice.
  ///
  /// In ko, this message translates to:
  /// **'본사'**
  String get complianceMatrixLegendOffice;

  /// No description provided for @complianceMatrixLegendWfh.
  ///
  /// In ko, this message translates to:
  /// **'재택'**
  String get complianceMatrixLegendWfh;

  /// No description provided for @complianceMatrixLegendLeave.
  ///
  /// In ko, this message translates to:
  /// **'연차'**
  String get complianceMatrixLegendLeave;

  /// No description provided for @complianceMatrixLegendBreak.
  ///
  /// In ko, this message translates to:
  /// **'휴게'**
  String get complianceMatrixLegendBreak;

  /// No description provided for @complianceMatrixLegendOff.
  ///
  /// In ko, this message translates to:
  /// **'휴무'**
  String get complianceMatrixLegendOff;

  /// No description provided for @leaveApplyTitle.
  ///
  /// In ko, this message translates to:
  /// **'연차 신청'**
  String get leaveApplyTitle;

  /// No description provided for @leaveApplyFrom.
  ///
  /// In ko, this message translates to:
  /// **'시작일'**
  String get leaveApplyFrom;

  /// No description provided for @leaveApplyTo.
  ///
  /// In ko, this message translates to:
  /// **'종료일'**
  String get leaveApplyTo;

  /// No description provided for @leaveApplyReason.
  ///
  /// In ko, this message translates to:
  /// **'사유'**
  String get leaveApplyReason;

  /// No description provided for @leaveApplySubmit.
  ///
  /// In ko, this message translates to:
  /// **'신청하기'**
  String get leaveApplySubmit;

  /// No description provided for @leaveApplySubmitted.
  ///
  /// In ko, this message translates to:
  /// **'신청을 보냈어요'**
  String get leaveApplySubmitted;

  /// No description provided for @leaveApplyFailed.
  ///
  /// In ko, this message translates to:
  /// **'신청에 실패했어요'**
  String get leaveApplyFailed;

  /// No description provided for @leaveApplyInvalidDates.
  ///
  /// In ko, this message translates to:
  /// **'종료일은 시작일 이후여야 해요'**
  String get leaveApplyInvalidDates;

  /// No description provided for @adminNavDashboard.
  ///
  /// In ko, this message translates to:
  /// **'대시보드'**
  String get adminNavDashboard;

  /// No description provided for @adminNavApprovals.
  ///
  /// In ko, this message translates to:
  /// **'승인'**
  String get adminNavApprovals;

  /// No description provided for @adminNavEmployees.
  ///
  /// In ko, this message translates to:
  /// **'직원'**
  String get adminNavEmployees;

  /// No description provided for @adminNavReports.
  ///
  /// In ko, this message translates to:
  /// **'리포트'**
  String get adminNavReports;

  /// No description provided for @adminNavAudit.
  ///
  /// In ko, this message translates to:
  /// **'감사'**
  String get adminNavAudit;

  /// No description provided for @adminNavCodes.
  ///
  /// In ko, this message translates to:
  /// **'코드'**
  String get adminNavCodes;

  /// No description provided for @adminNavSettings.
  ///
  /// In ko, this message translates to:
  /// **'설정'**
  String get adminNavSettings;

  /// No description provided for @adminNavCompliance.
  ///
  /// In ko, this message translates to:
  /// **'52시간'**
  String get adminNavCompliance;

  /// No description provided for @adminNavExpiringLeave.
  ///
  /// In ko, this message translates to:
  /// **'소멸 예정'**
  String get adminNavExpiringLeave;

  /// No description provided for @adminRoleOwner.
  ///
  /// In ko, this message translates to:
  /// **'소유자'**
  String get adminRoleOwner;

  /// No description provided for @adminRoleAdmin.
  ///
  /// In ko, this message translates to:
  /// **'관리자'**
  String get adminRoleAdmin;

  /// No description provided for @adminRoleManager.
  ///
  /// In ko, this message translates to:
  /// **'매니저'**
  String get adminRoleManager;

  /// No description provided for @adminRoleEmployee.
  ///
  /// In ko, this message translates to:
  /// **'직원'**
  String get adminRoleEmployee;

  /// No description provided for @adminDashTitle.
  ///
  /// In ko, this message translates to:
  /// **'대시보드'**
  String get adminDashTitle;

  /// No description provided for @adminDashSub.
  ///
  /// In ko, this message translates to:
  /// **'오늘의 근태 현황'**
  String get adminDashSub;

  /// No description provided for @adminKpiAttendanceRate.
  ///
  /// In ko, this message translates to:
  /// **'출근률'**
  String get adminKpiAttendanceRate;

  /// No description provided for @adminKpiAbsent.
  ///
  /// In ko, this message translates to:
  /// **'미출근'**
  String get adminKpiAbsent;

  /// No description provided for @adminKpiPendingApprovals.
  ///
  /// In ko, this message translates to:
  /// **'승인 대기'**
  String get adminKpiPendingApprovals;

  /// No description provided for @adminKpiOngoingOvertime.
  ///
  /// In ko, this message translates to:
  /// **'진행 중 초과'**
  String get adminKpiOngoingOvertime;

  /// No description provided for @adminQuickActions.
  ///
  /// In ko, this message translates to:
  /// **'빠른 액션'**
  String get adminQuickActions;

  /// No description provided for @adminQaReviewApprovals.
  ///
  /// In ko, this message translates to:
  /// **'승인 검토'**
  String get adminQaReviewApprovals;

  /// No description provided for @adminQaViewEmployees.
  ///
  /// In ko, this message translates to:
  /// **'직원 보기'**
  String get adminQaViewEmployees;

  /// No description provided for @adminQaOpenReports.
  ///
  /// In ko, this message translates to:
  /// **'리포트 열기'**
  String get adminQaOpenReports;

  /// No description provided for @adminQaIssueCode.
  ///
  /// In ko, this message translates to:
  /// **'코드 발급'**
  String get adminQaIssueCode;

  /// No description provided for @adminApprTitle.
  ///
  /// In ko, this message translates to:
  /// **'승인 관리'**
  String get adminApprTitle;

  /// No description provided for @adminApprSub.
  ///
  /// In ko, this message translates to:
  /// **'검토를 기다리는 요청'**
  String get adminApprSub;

  /// No description provided for @adminApprFilterStatus.
  ///
  /// In ko, this message translates to:
  /// **'상태'**
  String get adminApprFilterStatus;

  /// No description provided for @adminApprFilterAll.
  ///
  /// In ko, this message translates to:
  /// **'전체'**
  String get adminApprFilterAll;

  /// No description provided for @adminApprFilterPending.
  ///
  /// In ko, this message translates to:
  /// **'대기'**
  String get adminApprFilterPending;

  /// No description provided for @adminApprFilterApproved.
  ///
  /// In ko, this message translates to:
  /// **'승인'**
  String get adminApprFilterApproved;

  /// No description provided for @adminApprFilterRejected.
  ///
  /// In ko, this message translates to:
  /// **'반려'**
  String get adminApprFilterRejected;

  /// No description provided for @adminApprBulkApprove.
  ///
  /// In ko, this message translates to:
  /// **'일괄 승인'**
  String get adminApprBulkApprove;

  /// No description provided for @adminApprBulkReject.
  ///
  /// In ko, this message translates to:
  /// **'일괄 반려'**
  String get adminApprBulkReject;

  /// No description provided for @adminApprSelectAll.
  ///
  /// In ko, this message translates to:
  /// **'전체 선택'**
  String get adminApprSelectAll;

  /// No description provided for @adminApprSelected.
  ///
  /// In ko, this message translates to:
  /// **'{n}건 선택됨'**
  String adminApprSelected(Object n);

  /// No description provided for @adminApprKindLeave.
  ///
  /// In ko, this message translates to:
  /// **'연차'**
  String get adminApprKindLeave;

  /// No description provided for @adminApprKindOvertime.
  ///
  /// In ko, this message translates to:
  /// **'초과근무'**
  String get adminApprKindOvertime;

  /// No description provided for @adminApprKindTrip.
  ///
  /// In ko, this message translates to:
  /// **'출장'**
  String get adminApprKindTrip;

  /// No description provided for @adminApprKindManualClockIn.
  ///
  /// In ko, this message translates to:
  /// **'수동 출근'**
  String get adminApprKindManualClockIn;

  /// No description provided for @adminApprApprove.
  ///
  /// In ko, this message translates to:
  /// **'승인'**
  String get adminApprApprove;

  /// No description provided for @adminApprReject.
  ///
  /// In ko, this message translates to:
  /// **'반려'**
  String get adminApprReject;

  /// No description provided for @adminApprEmpty.
  ///
  /// In ko, this message translates to:
  /// **'검토할 요청이 없어요'**
  String get adminApprEmpty;

  /// No description provided for @adminApprAlreadyDecided.
  ///
  /// In ko, this message translates to:
  /// **'이미 처리된 항목이에요'**
  String get adminApprAlreadyDecided;

  /// No description provided for @adminApprPartialFail.
  ///
  /// In ko, this message translates to:
  /// **'{succeeded}/{total} 처리됨 · {failed}건 실패'**
  String adminApprPartialFail(Object failed, Object succeeded, Object total);

  /// No description provided for @adminEmpTitle.
  ///
  /// In ko, this message translates to:
  /// **'직원 관리'**
  String get adminEmpTitle;

  /// No description provided for @adminEmpSearchPlaceholder.
  ///
  /// In ko, this message translates to:
  /// **'이름·이메일·팀 검색'**
  String get adminEmpSearchPlaceholder;

  /// No description provided for @adminEmpRoleAll.
  ///
  /// In ko, this message translates to:
  /// **'역할 · 전체'**
  String get adminEmpRoleAll;

  /// No description provided for @adminEmpColEmployee.
  ///
  /// In ko, this message translates to:
  /// **'직원'**
  String get adminEmpColEmployee;

  /// No description provided for @adminEmpColRole.
  ///
  /// In ko, this message translates to:
  /// **'역할'**
  String get adminEmpColRole;

  /// No description provided for @adminEmpColTeam.
  ///
  /// In ko, this message translates to:
  /// **'팀'**
  String get adminEmpColTeam;

  /// No description provided for @adminEmpColPosition.
  ///
  /// In ko, this message translates to:
  /// **'직책'**
  String get adminEmpColPosition;

  /// No description provided for @adminEmpColStatus.
  ///
  /// In ko, this message translates to:
  /// **'상태'**
  String get adminEmpColStatus;

  /// No description provided for @adminEmpColJoined.
  ///
  /// In ko, this message translates to:
  /// **'입사일'**
  String get adminEmpColJoined;

  /// No description provided for @adminEmpStatusActive.
  ///
  /// In ko, this message translates to:
  /// **'활성'**
  String get adminEmpStatusActive;

  /// No description provided for @adminEmpStatusInactive.
  ///
  /// In ko, this message translates to:
  /// **'비활성'**
  String get adminEmpStatusInactive;

  /// No description provided for @adminEmpEmpty.
  ///
  /// In ko, this message translates to:
  /// **'표시할 직원이 없어요'**
  String get adminEmpEmpty;

  /// No description provided for @adminEmpDetailOverview.
  ///
  /// In ko, this message translates to:
  /// **'개요'**
  String get adminEmpDetailOverview;

  /// No description provided for @adminEmpDetailAttendance.
  ///
  /// In ko, this message translates to:
  /// **'출근'**
  String get adminEmpDetailAttendance;

  /// No description provided for @adminEmpDetailLeave.
  ///
  /// In ko, this message translates to:
  /// **'연차'**
  String get adminEmpDetailLeave;

  /// No description provided for @adminEmpDetailPerm.
  ///
  /// In ko, this message translates to:
  /// **'권한'**
  String get adminEmpDetailPerm;

  /// No description provided for @adminEmpFieldRole.
  ///
  /// In ko, this message translates to:
  /// **'역할'**
  String get adminEmpFieldRole;

  /// No description provided for @adminEmpFieldPosition.
  ///
  /// In ko, this message translates to:
  /// **'직책'**
  String get adminEmpFieldPosition;

  /// No description provided for @adminEmpFieldDepartment.
  ///
  /// In ko, this message translates to:
  /// **'부서'**
  String get adminEmpFieldDepartment;

  /// No description provided for @adminEmpFieldActive.
  ///
  /// In ko, this message translates to:
  /// **'활성 상태'**
  String get adminEmpFieldActive;

  /// No description provided for @adminEmpSave.
  ///
  /// In ko, this message translates to:
  /// **'저장'**
  String get adminEmpSave;

  /// No description provided for @adminEmpDeactivate.
  ///
  /// In ko, this message translates to:
  /// **'비활성화'**
  String get adminEmpDeactivate;

  /// No description provided for @adminEmpRoleRequired.
  ///
  /// In ko, this message translates to:
  /// **'역할은 필수예요'**
  String get adminEmpRoleRequired;

  /// No description provided for @adminEmpPositionTooLong.
  ///
  /// In ko, this message translates to:
  /// **'직책은 50자 이내'**
  String get adminEmpPositionTooLong;

  /// No description provided for @adminEmpDepartmentTooLong.
  ///
  /// In ko, this message translates to:
  /// **'부서는 50자 이내'**
  String get adminEmpDepartmentTooLong;

  /// No description provided for @adminEmpSaveSuccess.
  ///
  /// In ko, this message translates to:
  /// **'변경 사항을 저장했어요'**
  String get adminEmpSaveSuccess;

  /// No description provided for @adminEmpSaveFailed.
  ///
  /// In ko, this message translates to:
  /// **'저장에 실패했어요'**
  String get adminEmpSaveFailed;

  /// No description provided for @adminRepTitle.
  ///
  /// In ko, this message translates to:
  /// **'월간 리포트'**
  String get adminRepTitle;

  /// No description provided for @adminRepPickMonth.
  ///
  /// In ko, this message translates to:
  /// **'월 선택'**
  String get adminRepPickMonth;

  /// No description provided for @adminRepExportCsv.
  ///
  /// In ko, this message translates to:
  /// **'CSV 내보내기'**
  String get adminRepExportCsv;

  /// No description provided for @adminRepExportPdf.
  ///
  /// In ko, this message translates to:
  /// **'PDF 내보내기'**
  String get adminRepExportPdf;

  /// No description provided for @adminRepPdfTodo.
  ///
  /// In ko, this message translates to:
  /// **'PDF 내보내기는 준비 중이에요'**
  String get adminRepPdfTodo;

  /// No description provided for @adminRepKpiOnTime.
  ///
  /// In ko, this message translates to:
  /// **'정시 출근율'**
  String get adminRepKpiOnTime;

  /// No description provided for @adminRepKpiAvgWeekly.
  ///
  /// In ko, this message translates to:
  /// **'평균 주 근무'**
  String get adminRepKpiAvgWeekly;

  /// No description provided for @adminRepKpiTotalOvertime.
  ///
  /// In ko, this message translates to:
  /// **'누적 초과근무'**
  String get adminRepKpiTotalOvertime;

  /// No description provided for @adminRepKpiLeaveUsage.
  ///
  /// In ko, this message translates to:
  /// **'연차 사용률'**
  String get adminRepKpiLeaveUsage;

  /// No description provided for @adminRepTeamTable.
  ///
  /// In ko, this message translates to:
  /// **'팀별 성과'**
  String get adminRepTeamTable;

  /// No description provided for @adminRepColTeam.
  ///
  /// In ko, this message translates to:
  /// **'팀'**
  String get adminRepColTeam;

  /// No description provided for @adminRepColAttendance.
  ///
  /// In ko, this message translates to:
  /// **'정시 출근율'**
  String get adminRepColAttendance;

  /// No description provided for @adminRepColAvgWeek.
  ///
  /// In ko, this message translates to:
  /// **'평균 주 근무'**
  String get adminRepColAvgWeek;

  /// No description provided for @adminRepColAvgOvertime.
  ///
  /// In ko, this message translates to:
  /// **'평균 초과'**
  String get adminRepColAvgOvertime;

  /// No description provided for @adminExpiringTitle.
  ///
  /// In ko, this message translates to:
  /// **'소멸 예정 연차'**
  String get adminExpiringTitle;

  /// No description provided for @adminExpiringSub.
  ///
  /// In ko, this message translates to:
  /// **'{days}일 이내 소멸 위험'**
  String adminExpiringSub(Object days);

  /// No description provided for @adminExpiringColEmployee.
  ///
  /// In ko, this message translates to:
  /// **'직원'**
  String get adminExpiringColEmployee;

  /// No description provided for @adminExpiringColRemaining.
  ///
  /// In ko, this message translates to:
  /// **'잔여'**
  String get adminExpiringColRemaining;

  /// No description provided for @adminExpiringColExpiring.
  ///
  /// In ko, this message translates to:
  /// **'소멸 예정'**
  String get adminExpiringColExpiring;

  /// No description provided for @adminExpiringEmpty.
  ///
  /// In ko, this message translates to:
  /// **'소멸 위험이 없어요'**
  String get adminExpiringEmpty;

  /// No description provided for @adminSettingsTitle.
  ///
  /// In ko, this message translates to:
  /// **'회사 설정'**
  String get adminSettingsTitle;

  /// No description provided for @adminSettingsSubOwner.
  ///
  /// In ko, this message translates to:
  /// **'회사 정보, 브랜드, 운영 정책을 관리해요'**
  String get adminSettingsSubOwner;

  /// No description provided for @adminSettingsSubAdmin.
  ///
  /// In ko, this message translates to:
  /// **'회사 설정을 확인할 수 있어요. 변경은 소유주 권한이 필요해요'**
  String get adminSettingsSubAdmin;

  /// No description provided for @adminSettingsSectionCompany.
  ///
  /// In ko, this message translates to:
  /// **'회사 정보'**
  String get adminSettingsSectionCompany;

  /// No description provided for @adminSettingsSectionBrand.
  ///
  /// In ko, this message translates to:
  /// **'브랜드'**
  String get adminSettingsSectionBrand;

  /// No description provided for @adminSettingsSectionPolicy.
  ///
  /// In ko, this message translates to:
  /// **'운영 정책'**
  String get adminSettingsSectionPolicy;

  /// No description provided for @adminSettingsCompanyName.
  ///
  /// In ko, this message translates to:
  /// **'회사명'**
  String get adminSettingsCompanyName;

  /// No description provided for @adminSettingsCompanyCode.
  ///
  /// In ko, this message translates to:
  /// **'회사 코드'**
  String get adminSettingsCompanyCode;

  /// No description provided for @adminSettingsFiscalYear.
  ///
  /// In ko, this message translates to:
  /// **'회계 연도 시작'**
  String get adminSettingsFiscalYear;

  /// No description provided for @adminSettingsLocale.
  ///
  /// In ko, this message translates to:
  /// **'기본 언어'**
  String get adminSettingsLocale;

  /// No description provided for @adminSettingsTimezone.
  ///
  /// In ko, this message translates to:
  /// **'시간대'**
  String get adminSettingsTimezone;

  /// No description provided for @adminSettingsBrandColor.
  ///
  /// In ko, this message translates to:
  /// **'브랜드 색상'**
  String get adminSettingsBrandColor;

  /// No description provided for @adminSettingsLogoUrl.
  ///
  /// In ko, this message translates to:
  /// **'로고 URL'**
  String get adminSettingsLogoUrl;

  /// No description provided for @adminSettingsComplianceBlock.
  ///
  /// In ko, this message translates to:
  /// **'주 52시간 초과 시 출근 차단'**
  String get adminSettingsComplianceBlock;

  /// No description provided for @adminSettingsComplianceBlockDesc.
  ///
  /// In ko, this message translates to:
  /// **'한도 초과 직원의 자동 출근을 차단합니다. 기본은 경고만.'**
  String get adminSettingsComplianceBlockDesc;

  /// No description provided for @adminSettingsLeavePromotion.
  ///
  /// In ko, this message translates to:
  /// **'연차 사용 촉진 자동 알림'**
  String get adminSettingsLeavePromotion;

  /// No description provided for @adminSettingsLeavePromotionDesc.
  ///
  /// In ko, this message translates to:
  /// **'근로기준법 §61 — 만료 6개월/2개월 전 자동 알림.'**
  String get adminSettingsLeavePromotionDesc;

  /// No description provided for @adminSettingsSave.
  ///
  /// In ko, this message translates to:
  /// **'저장'**
  String get adminSettingsSave;

  /// No description provided for @adminSettingsSaving.
  ///
  /// In ko, this message translates to:
  /// **'저장 중...'**
  String get adminSettingsSaving;

  /// No description provided for @adminSettingsSaved.
  ///
  /// In ko, this message translates to:
  /// **'저장됐어요'**
  String get adminSettingsSaved;

  /// No description provided for @adminSettingsReset.
  ///
  /// In ko, this message translates to:
  /// **'변경 취소'**
  String get adminSettingsReset;

  /// No description provided for @adminSettingsOwnerOnlyHint.
  ///
  /// In ko, this message translates to:
  /// **'소유주만 설정을 변경할 수 있어요'**
  String get adminSettingsOwnerOnlyHint;

  /// No description provided for @adminSettingsSectionData.
  ///
  /// In ko, this message translates to:
  /// **'데이터 관리'**
  String get adminSettingsSectionData;

  /// No description provided for @adminSettingsDataExportTitle.
  ///
  /// In ko, this message translates to:
  /// **'데이터 내보내기 요청'**
  String get adminSettingsDataExportTitle;

  /// No description provided for @adminSettingsDataExportDesc.
  ///
  /// In ko, this message translates to:
  /// **'회사 데이터 전체를 내보내려면 이메일로 요청하세요.'**
  String get adminSettingsDataExportDesc;

  /// No description provided for @adminSettingsDataExportBtn.
  ///
  /// In ko, this message translates to:
  /// **'내보내기 요청 이메일 열기'**
  String get adminSettingsDataExportBtn;

  /// No description provided for @adminSettingsDataDeleteTitle.
  ///
  /// In ko, this message translates to:
  /// **'데이터 삭제 요청'**
  String get adminSettingsDataDeleteTitle;

  /// No description provided for @adminSettingsDataDeleteDesc.
  ///
  /// In ko, this message translates to:
  /// **'회사/계정 데이터 삭제는 privacy@molcube.com 으로 요청하세요.'**
  String get adminSettingsDataDeleteDesc;

  /// No description provided for @adminSettingsDataDeleteBtn.
  ///
  /// In ko, this message translates to:
  /// **'삭제 요청 이메일 열기'**
  String get adminSettingsDataDeleteBtn;

  /// No description provided for @adminSettingsSectionHelp.
  ///
  /// In ko, this message translates to:
  /// **'운영 가이드'**
  String get adminSettingsSectionHelp;

  /// No description provided for @adminSettingsHelpDataExportSop.
  ///
  /// In ko, this message translates to:
  /// **'데이터 내보내기 SOP'**
  String get adminSettingsHelpDataExportSop;

  /// No description provided for @adminSettingsHelpDataDeleteSop.
  ///
  /// In ko, this message translates to:
  /// **'데이터 삭제 SOP'**
  String get adminSettingsHelpDataDeleteSop;

  /// No description provided for @adminSettingsHelpEmergencyPw.
  ///
  /// In ko, this message translates to:
  /// **'긴급 비밀번호 초기화 SOP'**
  String get adminSettingsHelpEmergencyPw;

  /// No description provided for @adminSettingsHelpOnboard.
  ///
  /// In ko, this message translates to:
  /// **'신규 회사 온보딩 SOP'**
  String get adminSettingsHelpOnboard;

  /// No description provided for @adminSettingsLoadError.
  ///
  /// In ko, this message translates to:
  /// **'설정을 불러오지 못했어요'**
  String get adminSettingsLoadError;

  /// No description provided for @adminSettingsLoadErrorRetry.
  ///
  /// In ko, this message translates to:
  /// **'다시 시도'**
  String get adminSettingsLoadErrorRetry;

  /// No description provided for @adminNavAriaLabel.
  ///
  /// In ko, this message translates to:
  /// **'관리자 메뉴'**
  String get adminNavAriaLabel;

  /// No description provided for @adminAuditTitle.
  ///
  /// In ko, this message translates to:
  /// **'감사 로그'**
  String get adminAuditTitle;

  /// No description provided for @adminAuditFilterAction.
  ///
  /// In ko, this message translates to:
  /// **'액션'**
  String get adminAuditFilterAction;

  /// No description provided for @adminAuditFilterActor.
  ///
  /// In ko, this message translates to:
  /// **'수행자'**
  String get adminAuditFilterActor;

  /// No description provided for @adminAuditFilterFrom.
  ///
  /// In ko, this message translates to:
  /// **'시작일'**
  String get adminAuditFilterFrom;

  /// No description provided for @adminAuditFilterTo.
  ///
  /// In ko, this message translates to:
  /// **'종료일'**
  String get adminAuditFilterTo;

  /// No description provided for @adminAuditApply.
  ///
  /// In ko, this message translates to:
  /// **'적용'**
  String get adminAuditApply;

  /// No description provided for @adminAuditLoadMore.
  ///
  /// In ko, this message translates to:
  /// **'더 보기'**
  String get adminAuditLoadMore;

  /// No description provided for @adminAuditColAt.
  ///
  /// In ko, this message translates to:
  /// **'시각'**
  String get adminAuditColAt;

  /// No description provided for @adminAuditColActor.
  ///
  /// In ko, this message translates to:
  /// **'수행자'**
  String get adminAuditColActor;

  /// No description provided for @adminAuditColAction.
  ///
  /// In ko, this message translates to:
  /// **'액션'**
  String get adminAuditColAction;

  /// No description provided for @adminAuditColTarget.
  ///
  /// In ko, this message translates to:
  /// **'대상'**
  String get adminAuditColTarget;

  /// No description provided for @adminAuditEmpty.
  ///
  /// In ko, this message translates to:
  /// **'감사 항목이 없어요'**
  String get adminAuditEmpty;

  /// No description provided for @adminCodeTitle.
  ///
  /// In ko, this message translates to:
  /// **'초대 코드'**
  String get adminCodeTitle;

  /// No description provided for @adminCodeIssue.
  ///
  /// In ko, this message translates to:
  /// **'발급'**
  String get adminCodeIssue;

  /// No description provided for @adminCodeRevoke.
  ///
  /// In ko, this message translates to:
  /// **'회수'**
  String get adminCodeRevoke;

  /// No description provided for @adminCodeMaxUses.
  ///
  /// In ko, this message translates to:
  /// **'최대 사용 횟수'**
  String get adminCodeMaxUses;

  /// No description provided for @adminCodeExpiresAt.
  ///
  /// In ko, this message translates to:
  /// **'만료일'**
  String get adminCodeExpiresAt;

  /// No description provided for @adminCodeOptional.
  ///
  /// In ko, this message translates to:
  /// **'선택'**
  String get adminCodeOptional;

  /// No description provided for @adminCodeColCode.
  ///
  /// In ko, this message translates to:
  /// **'코드'**
  String get adminCodeColCode;

  /// No description provided for @adminCodeColUses.
  ///
  /// In ko, this message translates to:
  /// **'사용'**
  String get adminCodeColUses;

  /// No description provided for @adminCodeColExpires.
  ///
  /// In ko, this message translates to:
  /// **'만료'**
  String get adminCodeColExpires;

  /// No description provided for @adminCodeColStatus.
  ///
  /// In ko, this message translates to:
  /// **'상태'**
  String get adminCodeColStatus;

  /// No description provided for @adminCodeStatusActive.
  ///
  /// In ko, this message translates to:
  /// **'활성'**
  String get adminCodeStatusActive;

  /// No description provided for @adminCodeStatusRevoked.
  ///
  /// In ko, this message translates to:
  /// **'회수됨'**
  String get adminCodeStatusRevoked;

  /// No description provided for @adminCodeEmpty.
  ///
  /// In ko, this message translates to:
  /// **'발급된 코드가 없어요'**
  String get adminCodeEmpty;

  /// No description provided for @adminCommonBack.
  ///
  /// In ko, this message translates to:
  /// **'뒤로'**
  String get adminCommonBack;

  /// No description provided for @adminCommonSave.
  ///
  /// In ko, this message translates to:
  /// **'저장'**
  String get adminCommonSave;

  /// No description provided for @adminCommonCancel.
  ///
  /// In ko, this message translates to:
  /// **'취소'**
  String get adminCommonCancel;

  /// No description provided for @adminCommonLoading.
  ///
  /// In ko, this message translates to:
  /// **'불러오는 중'**
  String get adminCommonLoading;

  /// No description provided for @adminCommonError.
  ///
  /// In ko, this message translates to:
  /// **'문제가 발생했어요'**
  String get adminCommonError;

  /// No description provided for @adminForbiddenTitle.
  ///
  /// In ko, this message translates to:
  /// **'접근 권한이 없어요'**
  String get adminForbiddenTitle;

  /// No description provided for @adminForbiddenSub.
  ///
  /// In ko, this message translates to:
  /// **'관리자 페이지는 ADMIN/OWNER만 열 수 있어요'**
  String get adminForbiddenSub;

  /// No description provided for @ownerBillingTitle.
  ///
  /// In ko, this message translates to:
  /// **'결제 / 구독'**
  String get ownerBillingTitle;

  /// No description provided for @ownerBillingSubtitle.
  ///
  /// In ko, this message translates to:
  /// **'현재 플랜과 결제 내역을 확인해요'**
  String get ownerBillingSubtitle;

  /// No description provided for @ownerBillingCurrentPlan.
  ///
  /// In ko, this message translates to:
  /// **'현재 플랜'**
  String get ownerBillingCurrentPlan;

  /// No description provided for @ownerBillingMonth.
  ///
  /// In ko, this message translates to:
  /// **'월'**
  String get ownerBillingMonth;

  /// No description provided for @ownerBillingNoSubscription.
  ///
  /// In ko, this message translates to:
  /// **'활성 구독이 없어요'**
  String get ownerBillingNoSubscription;

  /// No description provided for @ownerBillingPeriodEnd.
  ///
  /// In ko, this message translates to:
  /// **'다음 결제일'**
  String get ownerBillingPeriodEnd;

  /// No description provided for @ownerBillingChangePlan.
  ///
  /// In ko, this message translates to:
  /// **'플랜 변경'**
  String get ownerBillingChangePlan;

  /// No description provided for @ownerBillingChangePlanTooltip.
  ///
  /// In ko, this message translates to:
  /// **'iter14 예정 — Stripe 결제 연동 후 활성화'**
  String get ownerBillingChangePlanTooltip;

  /// No description provided for @ownerBillingStatusTrial.
  ///
  /// In ko, this message translates to:
  /// **'체험판'**
  String get ownerBillingStatusTrial;

  /// No description provided for @ownerBillingStatusActive.
  ///
  /// In ko, this message translates to:
  /// **'이용 중'**
  String get ownerBillingStatusActive;

  /// No description provided for @ownerBillingStatusPastDue.
  ///
  /// In ko, this message translates to:
  /// **'결제 실패'**
  String get ownerBillingStatusPastDue;

  /// No description provided for @ownerBillingStatusCanceled.
  ///
  /// In ko, this message translates to:
  /// **'취소됨'**
  String get ownerBillingStatusCanceled;

  /// No description provided for @ownerBillingInvoiceHistory.
  ///
  /// In ko, this message translates to:
  /// **'결제 내역'**
  String get ownerBillingInvoiceHistory;

  /// No description provided for @ownerBillingNoInvoices.
  ///
  /// In ko, this message translates to:
  /// **'발행된 결제 내역이 없어요'**
  String get ownerBillingNoInvoices;

  /// No description provided for @ownerBillingColIssuedAt.
  ///
  /// In ko, this message translates to:
  /// **'발행일'**
  String get ownerBillingColIssuedAt;

  /// No description provided for @ownerBillingColAmount.
  ///
  /// In ko, this message translates to:
  /// **'금액'**
  String get ownerBillingColAmount;

  /// No description provided for @ownerBillingColStatus.
  ///
  /// In ko, this message translates to:
  /// **'상태'**
  String get ownerBillingColStatus;

  /// No description provided for @ownerBillingColPdf.
  ///
  /// In ko, this message translates to:
  /// **'영수증'**
  String get ownerBillingColPdf;

  /// No description provided for @ownerBillingInvoiceStatusDraft.
  ///
  /// In ko, this message translates to:
  /// **'미확정'**
  String get ownerBillingInvoiceStatusDraft;

  /// No description provided for @ownerBillingInvoiceStatusPaid.
  ///
  /// In ko, this message translates to:
  /// **'결제 완료'**
  String get ownerBillingInvoiceStatusPaid;

  /// No description provided for @ownerBillingInvoiceStatusVoid.
  ///
  /// In ko, this message translates to:
  /// **'무효'**
  String get ownerBillingInvoiceStatusVoid;

  /// No description provided for @ownerBillingDownloadPdf.
  ///
  /// In ko, this message translates to:
  /// **'PDF'**
  String get ownerBillingDownloadPdf;

  /// No description provided for @ownerBillingNavBilling.
  ///
  /// In ko, this message translates to:
  /// **'결제'**
  String get ownerBillingNavBilling;

  /// No description provided for @mobileBack.
  ///
  /// In ko, this message translates to:
  /// **'뒤로'**
  String get mobileBack;

  /// No description provided for @mobileLeaveApplyKind.
  ///
  /// In ko, this message translates to:
  /// **'유형'**
  String get mobileLeaveApplyKind;

  /// No description provided for @mobileLeaveApplyKindFull.
  ///
  /// In ko, this message translates to:
  /// **'연차'**
  String get mobileLeaveApplyKindFull;

  /// No description provided for @mobileLeaveApplyKindAmHalf.
  ///
  /// In ko, this message translates to:
  /// **'오전 반차'**
  String get mobileLeaveApplyKindAmHalf;

  /// No description provided for @mobileLeaveApplyKindPmHalf.
  ///
  /// In ko, this message translates to:
  /// **'오후 반차'**
  String get mobileLeaveApplyKindPmHalf;

  /// No description provided for @mobileLeaveApplyDaysUsedOne.
  ///
  /// In ko, this message translates to:
  /// **'{n}일 사용'**
  String mobileLeaveApplyDaysUsedOne(Object n);

  /// No description provided for @mobileLeaveApplyAfterBalance.
  ///
  /// In ko, this message translates to:
  /// **'신청 후 잔여'**
  String get mobileLeaveApplyAfterBalance;

  /// No description provided for @mobileLeaveApplyOverBalance.
  ///
  /// In ko, this message translates to:
  /// **'잔여 연차를 초과해요'**
  String get mobileLeaveApplyOverBalance;

  /// No description provided for @mobileLeaveApplySubmit.
  ///
  /// In ko, this message translates to:
  /// **'신청하기'**
  String get mobileLeaveApplySubmit;

  /// No description provided for @mobileLeaveApplySuccessTitle.
  ///
  /// In ko, this message translates to:
  /// **'신청이 접수됐어요'**
  String get mobileLeaveApplySuccessTitle;

  /// No description provided for @mobileLeaveApplySuccessSub.
  ///
  /// In ko, this message translates to:
  /// **'승인자가 확인하는 대로 알려드려요'**
  String get mobileLeaveApplySuccessSub;

  /// No description provided for @mobileLeaveApplyPeriod.
  ///
  /// In ko, this message translates to:
  /// **'기간'**
  String get mobileLeaveApplyPeriod;

  /// No description provided for @mobileLeaveApplyType.
  ///
  /// In ko, this message translates to:
  /// **'유형'**
  String get mobileLeaveApplyType;

  /// No description provided for @mobileLeaveApplyPrimary.
  ///
  /// In ko, this message translates to:
  /// **'확인'**
  String get mobileLeaveApplyPrimary;

  /// No description provided for @mobileLeaveApplySecondary.
  ///
  /// In ko, this message translates to:
  /// **'신청 내역 보기'**
  String get mobileLeaveApplySecondary;

  /// No description provided for @mobileLeaveApplyExpiryTitle.
  ///
  /// In ko, this message translates to:
  /// **'연차가 곧 소멸돼요'**
  String get mobileLeaveApplyExpiryTitle;

  /// No description provided for @mobileLeaveApplyExpirySub.
  ///
  /// In ko, this message translates to:
  /// **'{days}일이 7일 이내에 사라져요'**
  String mobileLeaveApplyExpirySub(Object days);

  /// No description provided for @mobileLeaveApplyExpiryCta.
  ///
  /// In ko, this message translates to:
  /// **'지금 신청하기'**
  String get mobileLeaveApplyExpiryCta;

  /// No description provided for @mobileLeaveApplyExpiryDismiss.
  ///
  /// In ko, this message translates to:
  /// **'나중에'**
  String get mobileLeaveApplyExpiryDismiss;

  /// No description provided for @mobileLeaveApplyReasonPlaceholder.
  ///
  /// In ko, this message translates to:
  /// **'사유 (선택)'**
  String get mobileLeaveApplyReasonPlaceholder;

  /// No description provided for @mobileOvertimeTitle.
  ///
  /// In ko, this message translates to:
  /// **'초과근무'**
  String get mobileOvertimeTitle;

  /// No description provided for @mobileOvertimeTabRequest.
  ///
  /// In ko, this message translates to:
  /// **'신청'**
  String get mobileOvertimeTabRequest;

  /// No description provided for @mobileOvertimeTabSettings.
  ///
  /// In ko, this message translates to:
  /// **'자동설정'**
  String get mobileOvertimeTabSettings;

  /// No description provided for @mobileOvertimeTabHistory.
  ///
  /// In ko, this message translates to:
  /// **'이력'**
  String get mobileOvertimeTabHistory;

  /// No description provided for @mobileOvertimeWorkDate.
  ///
  /// In ko, this message translates to:
  /// **'근무일'**
  String get mobileOvertimeWorkDate;

  /// No description provided for @mobileOvertimeMinutes.
  ///
  /// In ko, this message translates to:
  /// **'시간 (분)'**
  String get mobileOvertimeMinutes;

  /// No description provided for @mobileOvertimeMinutesHint.
  ///
  /// In ko, this message translates to:
  /// **'예: 90 = 1시간 30분'**
  String get mobileOvertimeMinutesHint;

  /// No description provided for @mobileOvertimeReason.
  ///
  /// In ko, this message translates to:
  /// **'사유'**
  String get mobileOvertimeReason;

  /// No description provided for @mobileOvertimeReasonPlaceholder.
  ///
  /// In ko, this message translates to:
  /// **'스프린트 마감, 디자인 QA 등'**
  String get mobileOvertimeReasonPlaceholder;

  /// No description provided for @mobileOvertimeSubmit.
  ///
  /// In ko, this message translates to:
  /// **'신청하기'**
  String get mobileOvertimeSubmit;

  /// No description provided for @mobileOvertimeSubmitted.
  ///
  /// In ko, this message translates to:
  /// **'초과근무 요청을 보냈어요'**
  String get mobileOvertimeSubmitted;

  /// No description provided for @mobileOvertimeFailed.
  ///
  /// In ko, this message translates to:
  /// **'신청에 실패했어요'**
  String get mobileOvertimeFailed;

  /// No description provided for @mobileOvertimeAutoThreshold.
  ///
  /// In ko, this message translates to:
  /// **'자동 신청 기준 (분)'**
  String get mobileOvertimeAutoThreshold;

  /// No description provided for @mobileOvertimeAutoThresholdDesc.
  ///
  /// In ko, this message translates to:
  /// **'정규 퇴근 후 N분 이상이면 자동 신청'**
  String get mobileOvertimeAutoThresholdDesc;

  /// No description provided for @mobileOvertimeAutoEnabled.
  ///
  /// In ko, this message translates to:
  /// **'자동 신청 사용'**
  String get mobileOvertimeAutoEnabled;

  /// No description provided for @mobileOvertimeHistoryEmpty.
  ///
  /// In ko, this message translates to:
  /// **'이력이 없어요'**
  String get mobileOvertimeHistoryEmpty;

  /// No description provided for @mobileOvertimeMinutesRequired.
  ///
  /// In ko, this message translates to:
  /// **'시간을 입력해주세요'**
  String get mobileOvertimeMinutesRequired;

  /// No description provided for @mobileOvertimeMinutesMin.
  ///
  /// In ko, this message translates to:
  /// **'최소 1분 이상이어야 해요'**
  String get mobileOvertimeMinutesMin;

  /// No description provided for @mobileOvertimeMinutesMax.
  ///
  /// In ko, this message translates to:
  /// **'최대 720분(12시간)까지 신청 가능해요'**
  String get mobileOvertimeMinutesMax;

  /// No description provided for @mobileOvertimeReasonRequired.
  ///
  /// In ko, this message translates to:
  /// **'사유를 입력해주세요'**
  String get mobileOvertimeReasonRequired;

  /// No description provided for @mobileOvertimeDateRequired.
  ///
  /// In ko, this message translates to:
  /// **'근무일을 선택해주세요'**
  String get mobileOvertimeDateRequired;

  /// No description provided for @mobileInboxTitle.
  ///
  /// In ko, this message translates to:
  /// **'요청함'**
  String get mobileInboxTitle;

  /// No description provided for @mobileInboxTabToApprove.
  ///
  /// In ko, this message translates to:
  /// **'승인할 것'**
  String get mobileInboxTabToApprove;

  /// No description provided for @mobileInboxTabMine.
  ///
  /// In ko, this message translates to:
  /// **'내 요청'**
  String get mobileInboxTabMine;

  /// No description provided for @mobileInboxTabSystem.
  ///
  /// In ko, this message translates to:
  /// **'알림'**
  String get mobileInboxTabSystem;

  /// No description provided for @mobileInboxEmpty.
  ///
  /// In ko, this message translates to:
  /// **'처리할 항목이 없어요'**
  String get mobileInboxEmpty;

  /// No description provided for @mobileInboxEmptySub.
  ///
  /// In ko, this message translates to:
  /// **'잠시 후 다시 확인해주세요'**
  String get mobileInboxEmptySub;

  /// No description provided for @mobileInboxQuickTitle.
  ///
  /// In ko, this message translates to:
  /// **'빠른 승인'**
  String get mobileInboxQuickTitle;

  /// No description provided for @mobileInboxSwipeHint.
  ///
  /// In ko, this message translates to:
  /// **'왼쪽으로 밀어 거절 · 오른쪽으로 밀어 승인'**
  String get mobileInboxSwipeHint;

  /// No description provided for @mobileInboxRejectLabel.
  ///
  /// In ko, this message translates to:
  /// **'거절'**
  String get mobileInboxRejectLabel;

  /// No description provided for @mobileInboxApproveLabel.
  ///
  /// In ko, this message translates to:
  /// **'승인'**
  String get mobileInboxApproveLabel;

  /// No description provided for @mobileInboxRejectReason.
  ///
  /// In ko, this message translates to:
  /// **'반려 사유 (선택)'**
  String get mobileInboxRejectReason;

  /// No description provided for @mobileInboxRejectReasonPlaceholder.
  ///
  /// In ko, this message translates to:
  /// **'왜 반려하는지 알려주세요'**
  String get mobileInboxRejectReasonPlaceholder;

  /// No description provided for @mobileInboxSendReject.
  ///
  /// In ko, this message translates to:
  /// **'반려 보내기'**
  String get mobileInboxSendReject;

  /// No description provided for @mobileInboxApprovedToast.
  ///
  /// In ko, this message translates to:
  /// **'승인했어요'**
  String get mobileInboxApprovedToast;

  /// No description provided for @mobileInboxRejectedToast.
  ///
  /// In ko, this message translates to:
  /// **'반려했어요'**
  String get mobileInboxRejectedToast;

  /// No description provided for @mobileInboxDecisionFailed.
  ///
  /// In ko, this message translates to:
  /// **'처리 중 문제가 발생했어요'**
  String get mobileInboxDecisionFailed;

  /// No description provided for @mobileInboxKindOvertime.
  ///
  /// In ko, this message translates to:
  /// **'초과근무'**
  String get mobileInboxKindOvertime;

  /// No description provided for @mobileInboxKindLeave.
  ///
  /// In ko, this message translates to:
  /// **'연차'**
  String get mobileInboxKindLeave;

  /// No description provided for @mobileInboxKindWfh.
  ///
  /// In ko, this message translates to:
  /// **'재택'**
  String get mobileInboxKindWfh;

  /// No description provided for @mobileInboxKindOutwork.
  ///
  /// In ko, this message translates to:
  /// **'외근'**
  String get mobileInboxKindOutwork;

  /// No description provided for @mobileInboxKindManualClockIn.
  ///
  /// In ko, this message translates to:
  /// **'수동 출근'**
  String get mobileInboxKindManualClockIn;

  /// No description provided for @mobileInboxKindTrip.
  ///
  /// In ko, this message translates to:
  /// **'출장'**
  String get mobileInboxKindTrip;

  /// No description provided for @mobileNotificationsTitle.
  ///
  /// In ko, this message translates to:
  /// **'알림'**
  String get mobileNotificationsTitle;

  /// No description provided for @mobileNotificationsMarkAll.
  ///
  /// In ko, this message translates to:
  /// **'모두 읽음'**
  String get mobileNotificationsMarkAll;

  /// No description provided for @mobileNotificationsEmptyTitle.
  ///
  /// In ko, this message translates to:
  /// **'모두 확인했어요'**
  String get mobileNotificationsEmptyTitle;

  /// No description provided for @mobileNotificationsEmptySub.
  ///
  /// In ko, this message translates to:
  /// **'새로운 알림이 오면 여기에 표시돼요'**
  String get mobileNotificationsEmptySub;

  /// No description provided for @mobileNotificationsFilterAll.
  ///
  /// In ko, this message translates to:
  /// **'전체'**
  String get mobileNotificationsFilterAll;

  /// No description provided for @mobileNotificationsFilterApprove.
  ///
  /// In ko, this message translates to:
  /// **'승인'**
  String get mobileNotificationsFilterApprove;

  /// No description provided for @mobileNotificationsFilterLeave.
  ///
  /// In ko, this message translates to:
  /// **'연차'**
  String get mobileNotificationsFilterLeave;

  /// No description provided for @mobileNotificationsFilterNotice.
  ///
  /// In ko, this message translates to:
  /// **'공지'**
  String get mobileNotificationsFilterNotice;

  /// No description provided for @mobileNoticeTitle.
  ///
  /// In ko, this message translates to:
  /// **'공지사항'**
  String get mobileNoticeTitle;

  /// No description provided for @mobileNoticePinned.
  ///
  /// In ko, this message translates to:
  /// **'상단 고정'**
  String get mobileNoticePinned;

  /// No description provided for @mobileNoticeRecent.
  ///
  /// In ko, this message translates to:
  /// **'최근'**
  String get mobileNoticeRecent;

  /// No description provided for @mobileNoticeViews.
  ///
  /// In ko, this message translates to:
  /// **'조회 {n}'**
  String mobileNoticeViews(Object n);

  /// No description provided for @mobileNoticeEmpty.
  ///
  /// In ko, this message translates to:
  /// **'공지가 없어요'**
  String get mobileNoticeEmpty;

  /// No description provided for @mobileNoticeRequiredTag.
  ///
  /// In ko, this message translates to:
  /// **'[필수]'**
  String get mobileNoticeRequiredTag;

  /// No description provided for @mobileNoticePinnedTitle.
  ///
  /// In ko, this message translates to:
  /// **'연차 소멸 정책 변경 안내'**
  String get mobileNoticePinnedTitle;

  /// No description provided for @mobileNoticePinnedBody.
  ///
  /// In ko, this message translates to:
  /// **'2026년부터 연차는 발생일 기준 2년 이내 사용해야 합니다. 미사용 시 자동 소멸…'**
  String get mobileNoticePinnedBody;

  /// No description provided for @mobileNoticeDemoWorkshopTag.
  ///
  /// In ko, this message translates to:
  /// **'워크샵'**
  String get mobileNoticeDemoWorkshopTag;

  /// No description provided for @mobileNoticeDemoWorkshopTitle.
  ///
  /// In ko, this message translates to:
  /// **'12월 팀 워크샵 신청 안내'**
  String get mobileNoticeDemoWorkshopTitle;

  /// No description provided for @mobileNoticeDemoWorkshopSub.
  ///
  /// In ko, this message translates to:
  /// **'제주도 2박 3일 · 12/20 출발'**
  String get mobileNoticeDemoWorkshopSub;

  /// No description provided for @mobileNoticeDemoSystemTag.
  ///
  /// In ko, this message translates to:
  /// **'시스템'**
  String get mobileNoticeDemoSystemTag;

  /// No description provided for @mobileNoticeDemoSystemTitle.
  ///
  /// In ko, this message translates to:
  /// **'출퇴근 앱 v2.1 업데이트'**
  String get mobileNoticeDemoSystemTitle;

  /// No description provided for @mobileNoticeDemoSystemSub.
  ///
  /// In ko, this message translates to:
  /// **'위젯 기능 추가 · 성능 개선'**
  String get mobileNoticeDemoSystemSub;

  /// No description provided for @mobileSettingsTitle.
  ///
  /// In ko, this message translates to:
  /// **'설정'**
  String get mobileSettingsTitle;

  /// No description provided for @mobileSettingsProfileSection.
  ///
  /// In ko, this message translates to:
  /// **'내 정보'**
  String get mobileSettingsProfileSection;

  /// No description provided for @mobileSettingsNotificationsSection.
  ///
  /// In ko, this message translates to:
  /// **'알림'**
  String get mobileSettingsNotificationsSection;

  /// No description provided for @mobileSettingsAppearanceSection.
  ///
  /// In ko, this message translates to:
  /// **'테마'**
  String get mobileSettingsAppearanceSection;

  /// No description provided for @mobileSettingsNotifClock.
  ///
  /// In ko, this message translates to:
  /// **'출퇴근 알림'**
  String get mobileSettingsNotifClock;

  /// No description provided for @mobileSettingsNotifLeave.
  ///
  /// In ko, this message translates to:
  /// **'연차 소멸 안내'**
  String get mobileSettingsNotifLeave;

  /// No description provided for @mobileSettingsNotifOvertime.
  ///
  /// In ko, this message translates to:
  /// **'초과근무 결과'**
  String get mobileSettingsNotifOvertime;

  /// No description provided for @mobileSettingsOn.
  ///
  /// In ko, this message translates to:
  /// **'켜짐'**
  String get mobileSettingsOn;

  /// No description provided for @mobileSettingsOff.
  ///
  /// In ko, this message translates to:
  /// **'꺼짐'**
  String get mobileSettingsOff;

  /// No description provided for @mobileCustomizeTitle.
  ///
  /// In ko, this message translates to:
  /// **'화면 꾸미기'**
  String get mobileCustomizeTitle;

  /// No description provided for @mobileCustomizeTheme.
  ///
  /// In ko, this message translates to:
  /// **'테마'**
  String get mobileCustomizeTheme;

  /// No description provided for @mobileCustomizeThemeLight.
  ///
  /// In ko, this message translates to:
  /// **'라이트'**
  String get mobileCustomizeThemeLight;

  /// No description provided for @mobileCustomizeThemeDark.
  ///
  /// In ko, this message translates to:
  /// **'다크'**
  String get mobileCustomizeThemeDark;

  /// No description provided for @mobileCustomizeBrand.
  ///
  /// In ko, this message translates to:
  /// **'브랜드 컬러'**
  String get mobileCustomizeBrand;

  /// No description provided for @mobileCustomizeFontSize.
  ///
  /// In ko, this message translates to:
  /// **'글자 크기'**
  String get mobileCustomizeFontSize;

  /// No description provided for @mobileCustomizeFontSm.
  ///
  /// In ko, this message translates to:
  /// **'작게'**
  String get mobileCustomizeFontSm;

  /// No description provided for @mobileCustomizeFontMd.
  ///
  /// In ko, this message translates to:
  /// **'보통'**
  String get mobileCustomizeFontMd;

  /// No description provided for @mobileCustomizeFontLg.
  ///
  /// In ko, this message translates to:
  /// **'크게'**
  String get mobileCustomizeFontLg;

  /// No description provided for @mobileCustomizeLanguage.
  ///
  /// In ko, this message translates to:
  /// **'언어'**
  String get mobileCustomizeLanguage;

  /// No description provided for @mobileCustomizeReset.
  ///
  /// In ko, this message translates to:
  /// **'기본값으로'**
  String get mobileCustomizeReset;

  /// No description provided for @mobileTripTitle.
  ///
  /// In ko, this message translates to:
  /// **'출장/외근'**
  String get mobileTripTitle;

  /// No description provided for @mobileTripStartsOn.
  ///
  /// In ko, this message translates to:
  /// **'시작일'**
  String get mobileTripStartsOn;

  /// No description provided for @mobileTripEndsOn.
  ///
  /// In ko, this message translates to:
  /// **'종료일'**
  String get mobileTripEndsOn;

  /// No description provided for @mobileTripPlace.
  ///
  /// In ko, this message translates to:
  /// **'장소'**
  String get mobileTripPlace;

  /// No description provided for @mobileTripPurpose.
  ///
  /// In ko, this message translates to:
  /// **'목적'**
  String get mobileTripPurpose;

  /// No description provided for @mobileTripSubmit.
  ///
  /// In ko, this message translates to:
  /// **'등록하기'**
  String get mobileTripSubmit;

  /// No description provided for @mobileTripSubmitted.
  ///
  /// In ko, this message translates to:
  /// **'등록되었어요'**
  String get mobileTripSubmitted;

  /// No description provided for @mobileTripComingSoon.
  ///
  /// In ko, this message translates to:
  /// **'곧 출시될 기능이에요'**
  String get mobileTripComingSoon;

  /// No description provided for @mobileHelpTitle.
  ///
  /// In ko, this message translates to:
  /// **'도움말'**
  String get mobileHelpTitle;

  /// No description provided for @mobileHelpFaqQ1.
  ///
  /// In ko, this message translates to:
  /// **'출근이 안 잡혀요'**
  String get mobileHelpFaqQ1;

  /// No description provided for @mobileHelpFaqA1.
  ///
  /// In ko, this message translates to:
  /// **'위치 권한이 허용됐는지 확인해 주세요. 회사 위치 100m 이내에서만 자동 인식돼요.'**
  String get mobileHelpFaqA1;

  /// No description provided for @mobileHelpFaqQ2.
  ///
  /// In ko, this message translates to:
  /// **'연차가 며칠 남았는지 어떻게 봐요?'**
  String get mobileHelpFaqQ2;

  /// No description provided for @mobileHelpFaqA2.
  ///
  /// In ko, this message translates to:
  /// **'[연차] 탭에서 잔여/사용/소멸을 확인할 수 있어요.'**
  String get mobileHelpFaqA2;

  /// No description provided for @mobileHelpFaqQ3.
  ///
  /// In ko, this message translates to:
  /// **'초과근무는 어떻게 신청해요?'**
  String get mobileHelpFaqQ3;

  /// No description provided for @mobileHelpFaqA3.
  ///
  /// In ko, this message translates to:
  /// **'[홈]에서 정규 퇴근 시간이 지나면 초과근무 요청 카드가 떠요. 또는 [마이>설정>초과근무]에서 직접 신청할 수 있어요.'**
  String get mobileHelpFaqA3;

  /// No description provided for @mobileHelpFaqQ4.
  ///
  /// In ko, this message translates to:
  /// **'푸시 알림이 안 와요'**
  String get mobileHelpFaqQ4;

  /// No description provided for @mobileHelpFaqA4.
  ///
  /// In ko, this message translates to:
  /// **'[마이>알림 설정]에서 알림 받기 토글을 켜고, OS 알림 권한과 백그라운드 새로고침이 활성됐는지 확인해 주세요. 안드로이드는 배터리 최적화에서 앱을 제외해 주세요.'**
  String get mobileHelpFaqA4;

  /// No description provided for @mobileHelpFaqQ5.
  ///
  /// In ko, this message translates to:
  /// **'비밀번호를 잊었어요'**
  String get mobileHelpFaqQ5;

  /// No description provided for @mobileHelpFaqA5.
  ///
  /// In ko, this message translates to:
  /// **'로그인 화면 > [비밀번호를 잊으셨나요?] > 회사 이메일 입력 > 메일의 링크 클릭 > 새 비밀번호 설정.'**
  String get mobileHelpFaqA5;

  /// No description provided for @mobileHelpFaqQ6.
  ///
  /// In ko, this message translates to:
  /// **'회사 코드를 어떻게 받나요?'**
  String get mobileHelpFaqQ6;

  /// No description provided for @mobileHelpFaqA6.
  ///
  /// In ko, this message translates to:
  /// **'회사의 인사 담당자 또는 관리자에게 6자리 회사 코드 (예: ACMEDM) 를 받으세요. 코드는 사이드바에서 관리자만 발급/만료할 수 있어요.'**
  String get mobileHelpFaqA6;

  /// No description provided for @mobileHelpContact.
  ///
  /// In ko, this message translates to:
  /// **'문의하기'**
  String get mobileHelpContact;

  /// No description provided for @mobileHelpManualsTitle.
  ///
  /// In ko, this message translates to:
  /// **'전체 매뉴얼'**
  String get mobileHelpManualsTitle;

  /// No description provided for @mobileHelpManualsSub.
  ///
  /// In ko, this message translates to:
  /// **'역할별 가이드를 확인해 보세요'**
  String get mobileHelpManualsSub;

  /// No description provided for @mobileHelpManualEmployee.
  ///
  /// In ko, this message translates to:
  /// **'직원 가이드'**
  String get mobileHelpManualEmployee;

  /// No description provided for @mobileHelpManualManager.
  ///
  /// In ko, this message translates to:
  /// **'매니저 가이드'**
  String get mobileHelpManualManager;

  /// No description provided for @mobileHelpManualAdmin.
  ///
  /// In ko, this message translates to:
  /// **'관리자 가이드'**
  String get mobileHelpManualAdmin;

  /// No description provided for @mobileHelpManualOwner.
  ///
  /// In ko, this message translates to:
  /// **'소유주 가이드'**
  String get mobileHelpManualOwner;

  /// No description provided for @mobileHelpManualLinkExternal.
  ///
  /// In ko, this message translates to:
  /// **'(웹 가이드 열기)'**
  String get mobileHelpManualLinkExternal;

  /// No description provided for @mobileRecordTitle.
  ///
  /// In ko, this message translates to:
  /// **'근무 상세'**
  String get mobileRecordTitle;

  /// No description provided for @mobileRecordTotalWork.
  ///
  /// In ko, this message translates to:
  /// **'총 근무'**
  String get mobileRecordTotalWork;

  /// No description provided for @mobileRecordTimeline.
  ///
  /// In ko, this message translates to:
  /// **'타임라인'**
  String get mobileRecordTimeline;

  /// No description provided for @mobileRecordMemo.
  ///
  /// In ko, this message translates to:
  /// **'메모'**
  String get mobileRecordMemo;

  /// No description provided for @mobileRecordOvertimeApproved.
  ///
  /// In ko, this message translates to:
  /// **'초과근무 승인됨'**
  String get mobileRecordOvertimeApproved;

  /// No description provided for @mobileRecordLabelIn.
  ///
  /// In ko, this message translates to:
  /// **'출근'**
  String get mobileRecordLabelIn;

  /// No description provided for @mobileRecordLabelOut.
  ///
  /// In ko, this message translates to:
  /// **'퇴근'**
  String get mobileRecordLabelOut;

  /// No description provided for @mobileRecordLabelBreak.
  ///
  /// In ko, this message translates to:
  /// **'휴게'**
  String get mobileRecordLabelBreak;

  /// No description provided for @mobileWeeklyTitle.
  ///
  /// In ko, this message translates to:
  /// **'이번 주 리포트'**
  String get mobileWeeklyTitle;

  /// No description provided for @mobileWeeklyTotal.
  ///
  /// In ko, this message translates to:
  /// **'총 근무'**
  String get mobileWeeklyTotal;

  /// No description provided for @mobileWeeklyAvg.
  ///
  /// In ko, this message translates to:
  /// **'일 평균'**
  String get mobileWeeklyAvg;

  /// No description provided for @mobileWeeklyOvertime.
  ///
  /// In ko, this message translates to:
  /// **'초과'**
  String get mobileWeeklyOvertime;

  /// No description provided for @mobileWeeklyTarget.
  ///
  /// In ko, this message translates to:
  /// **'목표'**
  String get mobileWeeklyTarget;

  /// No description provided for @mobileWeeklyAboveAvg.
  ///
  /// In ko, this message translates to:
  /// **'평균보다 {n}h 많아요'**
  String mobileWeeklyAboveAvg(Object n);

  /// No description provided for @mobileWeeklyBelowAvg.
  ///
  /// In ko, this message translates to:
  /// **'평균보다 {n}h 적어요'**
  String mobileWeeklyBelowAvg(Object n);

  /// No description provided for @mobileLocPickerTitle.
  ///
  /// In ko, this message translates to:
  /// **'근무지를 선택해 주세요'**
  String get mobileLocPickerTitle;

  /// No description provided for @mobileLocPickerSub.
  ///
  /// In ko, this message translates to:
  /// **'자동 감지와 다르다면 직접 바꿀 수 있어요'**
  String get mobileLocPickerSub;

  /// No description provided for @mobileLocPickerOffice.
  ///
  /// In ko, this message translates to:
  /// **'본사'**
  String get mobileLocPickerOffice;

  /// No description provided for @mobileLocPickerHome.
  ///
  /// In ko, this message translates to:
  /// **'재택'**
  String get mobileLocPickerHome;

  /// No description provided for @mobileLocPickerOutside.
  ///
  /// In ko, this message translates to:
  /// **'외근'**
  String get mobileLocPickerOutside;

  /// No description provided for @mobileLocPickerConfirm.
  ///
  /// In ko, this message translates to:
  /// **'확인'**
  String get mobileLocPickerConfirm;

  /// No description provided for @mobileErrorGpsTitle.
  ///
  /// In ko, this message translates to:
  /// **'위치를 확인할 수 없어요'**
  String get mobileErrorGpsTitle;

  /// No description provided for @mobileErrorGpsSub.
  ///
  /// In ko, this message translates to:
  /// **'위치 권한을 허용했는지 확인해 주세요. 수동으로 재택/본사를 선택할 수도 있어요.'**
  String get mobileErrorGpsSub;

  /// No description provided for @mobileErrorGpsRetry.
  ///
  /// In ko, this message translates to:
  /// **'다시 시도'**
  String get mobileErrorGpsRetry;

  /// No description provided for @mobileErrorGpsManual.
  ///
  /// In ko, this message translates to:
  /// **'수동으로 선택'**
  String get mobileErrorGpsManual;

  /// No description provided for @mobileProfileFullTitle.
  ///
  /// In ko, this message translates to:
  /// **'프로필'**
  String get mobileProfileFullTitle;

  /// No description provided for @mobileProfileFullKpiAttendance.
  ///
  /// In ko, this message translates to:
  /// **'출근율'**
  String get mobileProfileFullKpiAttendance;

  /// No description provided for @mobileProfileFullKpiLeaveUsed.
  ///
  /// In ko, this message translates to:
  /// **'연차 사용'**
  String get mobileProfileFullKpiLeaveUsed;

  /// No description provided for @mobileProfileFullKpiAvgWork.
  ///
  /// In ko, this message translates to:
  /// **'일 평균'**
  String get mobileProfileFullKpiAvgWork;

  /// No description provided for @mobileTeamTabsGrid.
  ///
  /// In ko, this message translates to:
  /// **'그리드'**
  String get mobileTeamTabsGrid;

  /// No description provided for @mobileTeamTabsGrouped.
  ///
  /// In ko, this message translates to:
  /// **'팀별'**
  String get mobileTeamTabsGrouped;

  /// No description provided for @mobileTeamTabsTimeline.
  ///
  /// In ko, this message translates to:
  /// **'타임라인'**
  String get mobileTeamTabsTimeline;

  /// No description provided for @mobileTeamDemoWorkingCount.
  ///
  /// In ko, this message translates to:
  /// **'{working}/{total} 근무 중'**
  String mobileTeamDemoWorkingCount(Object total, Object working);

  /// No description provided for @mobileTeamDemoTeamDesign.
  ///
  /// In ko, this message translates to:
  /// **'디자인'**
  String get mobileTeamDemoTeamDesign;

  /// No description provided for @mobileTeamDemoTeamEngineering.
  ///
  /// In ko, this message translates to:
  /// **'엔지니어링'**
  String get mobileTeamDemoTeamEngineering;

  /// No description provided for @mobileTeamDemoTeamProduct.
  ///
  /// In ko, this message translates to:
  /// **'프로덕트'**
  String get mobileTeamDemoTeamProduct;

  /// No description provided for @mobileTeamDemoTeamOperations.
  ///
  /// In ko, this message translates to:
  /// **'오퍼레이션'**
  String get mobileTeamDemoTeamOperations;

  /// No description provided for @mobileTeamDemoMemberJiwoo.
  ///
  /// In ko, this message translates to:
  /// **'지우'**
  String get mobileTeamDemoMemberJiwoo;

  /// No description provided for @mobileTeamDemoMemberMinsoo.
  ///
  /// In ko, this message translates to:
  /// **'민수'**
  String get mobileTeamDemoMemberMinsoo;

  /// No description provided for @mobileTeamDemoMemberYerin.
  ///
  /// In ko, this message translates to:
  /// **'예린'**
  String get mobileTeamDemoMemberYerin;

  /// No description provided for @mobileTeamDemoMemberHyunwoo.
  ///
  /// In ko, this message translates to:
  /// **'현우'**
  String get mobileTeamDemoMemberHyunwoo;

  /// No description provided for @mobileTeamDemoMemberSooa.
  ///
  /// In ko, this message translates to:
  /// **'수아'**
  String get mobileTeamDemoMemberSooa;

  /// No description provided for @mobileTeamDemoMemberDoyoon.
  ///
  /// In ko, this message translates to:
  /// **'도윤'**
  String get mobileTeamDemoMemberDoyoon;
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) => <String>['en', 'ko'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {


  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en': return AppLocalizationsEn();
    case 'ko': return AppLocalizationsKo();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.'
  );
}
