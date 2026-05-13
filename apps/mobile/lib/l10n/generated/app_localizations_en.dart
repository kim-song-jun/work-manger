import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Work Manager';

  @override
  String get navHome => 'Home';

  @override
  String get navTeam => 'Team';

  @override
  String get navLeave => 'Leave';

  @override
  String get navMy => 'Me';

  @override
  String get authLogin => 'Log in';

  @override
  String get authSignup => 'Sign up';

  @override
  String get authLoginTitle => 'Welcome back\nReady to log in?';

  @override
  String get authLoginSub => 'Use the email address provided by your company.';

  @override
  String get authSignupTitle => 'Start with\nyour work email';

  @override
  String get authSignupSub => 'Use a verified company domain to create your account and confirm the team invite.';

  @override
  String get authEmail => 'Email';

  @override
  String get authWorkEmail => 'Work email';

  @override
  String get authPassword => 'Password';

  @override
  String get authName => 'Name';

  @override
  String get authSubmit => 'Submit';

  @override
  String get authNoAccount => 'No account?';

  @override
  String get authHaveAccount => 'Have an account?';

  @override
  String get authInvalid => 'Invalid email or password.';

  @override
  String get authForgot => 'Forgot your password?';

  @override
  String get authHelp => 'Get help';

  @override
  String get authForgotTitle => 'Reset password';

  @override
  String get authForgotDesc => 'We\'ll send a reset link to your email.';

  @override
  String get authForgotSend => 'Send reset link';

  @override
  String get authForgotDone => 'Check your email.';

  @override
  String get authBackToLogin => 'Back to login';

  @override
  String get authPasswordHint => '8+ chars, letters, numbers, and a symbol';

  @override
  String get homeGoodMorning => 'Good morning';

  @override
  String get homeGoodEvening => 'Good work today';

  @override
  String get homeTodayWork => 'Today';

  @override
  String get homeAtOffice => 'Working from office';

  @override
  String get homeAtWfh => 'Working from home';

  @override
  String get homeAutoDetected => 'Auto-detected';

  @override
  String get homeChange => 'Change';

  @override
  String get homeSlideIn => 'Slide to clock in';

  @override
  String get homeSlideOut => 'Slide to clock out';

  @override
  String get homeWeekLabel => 'This week';

  @override
  String get homeLeaveBalance => 'Leave';

  @override
  String get homeOvertimeLabel => 'Overtime';

  @override
  String get homeTeamStatus => 'Team status';

  @override
  String get homeClockInOffice => 'Clock in (Office)';

  @override
  String get homeClockInWfh => 'Clock in (WFH)';

  @override
  String get homeClockInSuccess => 'Clocked in';

  @override
  String get homeClockInFailed => 'Clock-in failed';

  @override
  String get homeGeoUnsupported => 'Location is unavailable';

  @override
  String get homeGeoDenied => 'Please allow location access';

  @override
  String get homeOpenTweaks => 'Tweaks';

  @override
  String get homeLabelClockIn => 'In';

  @override
  String get homeLabelClockOut => 'Out';

  @override
  String get homeLabelRegular => 'Hours';

  @override
  String get homeLocationOfficeName => 'Gangnam HQ';

  @override
  String get homeFakeMember_1 => 'Jiwoo';

  @override
  String get homeFakeMember_2 => 'Minsoo';

  @override
  String get homeFakeMember_3 => 'Yerin';

  @override
  String get homeFakeMember_4 => 'Hyunwoo';

  @override
  String get homeFakeMember_5 => 'Sooa';

  @override
  String get homeFakeMember_6 => 'Doyoon';

  @override
  String get homeFakeMember_7 => 'Harin';

  @override
  String get homeStatusWorking => 'Working';

  @override
  String get homeProgressLabel => 'of regular';

  @override
  String homeTeamCountOffice(Object n) {
    return '$n office';
  }

  @override
  String homeTeamCountWfh(Object n) {
    return '$n WFH';
  }

  @override
  String homeTeamCountLeave(Object n) {
    return '$n leave';
  }

  @override
  String homeTeamCountBreak(Object n) {
    return '$n break';
  }

  @override
  String get teamTitle => 'Team status';

  @override
  String get teamEmpty => 'No teammates';

  @override
  String get teamLoading => 'Loading';

  @override
  String get leaveTitle => 'Leave';

  @override
  String get leaveBalance => 'Balance';

  @override
  String get leaveUsed => 'Used';

  @override
  String get leaveAccrued => 'Accrued';

  @override
  String get leaveExpiring => 'Expiring';

  @override
  String get leaveApply => 'Request leave';

  @override
  String get leaveNoneYet => 'No leave info yet';

  @override
  String get leaveDaysUnit => 'd';

  @override
  String get leaveTypeAnnual => 'Annual';

  @override
  String get leaveTypeComp => 'Compensation leave';

  @override
  String get leaveTypeSick => 'Sick';

  @override
  String get leaveTypePersonal => 'Personal';

  @override
  String get myTitle => 'Me';

  @override
  String get myProfile => 'Profile';

  @override
  String get mySettings => 'Settings';

  @override
  String get myCustomize => 'Customize';

  @override
  String get myHelp => 'Help';

  @override
  String get myLogout => 'Log out';

  @override
  String get onbNext => 'Next';

  @override
  String get onbBack => 'Back';

  @override
  String get onbSkip => 'Skip';

  @override
  String get onbLater => 'Later';

  @override
  String get onbWelcomeTitle => 'Manage clock-in to leave,\nall in one place.';

  @override
  String get onbWelcomeSub => 'The simplest work tool for your team.';

  @override
  String get onbWelcomeStart => 'Get started';

  @override
  String get onbFeatureLocTitle => 'Location-based clock-in';

  @override
  String get onbFeatureLocSub => 'Office and remote auto-detect';

  @override
  String get onbFeatureLeaveTitle => 'Auto leave accrual';

  @override
  String get onbFeatureLeaveSub => 'Never forget an expiry';

  @override
  String get onbFeatureTeamTitle => 'Team status at a glance';

  @override
  String get onbFeatureTeamSub => 'Easier real-time collaboration';

  @override
  String get onbCodeTitle => 'Enter your company code';

  @override
  String get onbCodeSub => 'The 6-character code from your admin';

  @override
  String get onbCodeHelp => 'Don\'t know the code?';

  @override
  String get onbCodeContactAdmin => 'Ask your admin';

  @override
  String get onbProfileTitle => 'Set up your profile';

  @override
  String get onbProfileSub => 'How teammates will see you';

  @override
  String get onbProfileName => 'Name';

  @override
  String get onbProfileTeam => 'Team';

  @override
  String get onbProfileRole => 'Role';

  @override
  String get onbProfileEmpNo => 'Employee #';

  @override
  String get onbLocationTitle => 'Register a location';

  @override
  String get onbLocationSub => 'Office and home auto-recognized';

  @override
  String onbLocationOffice(Object name) {
    return 'Office — $name';
  }

  @override
  String get onbLocationRadius => '100m radius';

  @override
  String get onbLocationWfh => 'Home location';

  @override
  String get onbLocationWfhSub => 'Use current location as home';

  @override
  String get onbLocationPrivacy => 'Location is only used for clock-in detection. We never track outside work hours.';

  @override
  String get onbLocationOfficeAddress => 'Gangnam-gu, Seoul';

  @override
  String get onbScheduleTitle => 'Check your hours';

  @override
  String get onbScheduleSub => 'Standard hours set by your admin';

  @override
  String get onbScheduleStandard => 'Standard hours';

  @override
  String get onbSchedulePattern => 'Work pattern';

  @override
  String get onbScheduleLunch => 'Lunch 12:00–13:00 · 40h/week';

  @override
  String get onbNotifTitle => 'Get notifications?';

  @override
  String get onbNotifSub => 'Never miss what matters';

  @override
  String get onbNotifClock => 'Clock-in reminders';

  @override
  String get onbNotifClockSub => '10 minutes before start';

  @override
  String get onbNotifLeave => 'Leave expiry alerts';

  @override
  String get onbNotifLeaveSub => '30 / 7 days before';

  @override
  String get onbNotifOvertime => 'Overtime approval';

  @override
  String get onbNotifOvertimeSub => 'Right when admin decides';

  @override
  String get onbWidgetTitle => 'Add a home widget?';

  @override
  String get onbWidgetSub => 'Clock in without opening the app';

  @override
  String get onbWidgetAdd => 'Add widget';

  @override
  String get onbDoneTitle => 'All set!';

  @override
  String get onbDoneSub => 'Cheering on your first day\nFollow the steps below';

  @override
  String get onbDoneStep1 => 'Auto clock-in at office';

  @override
  String get onbDoneStep1Sub => 'GPS detects your location';

  @override
  String get onbDoneStep2 => 'Log lunch break';

  @override
  String get onbDoneStep2Sub => '12:00–13:00 auto-deducted';

  @override
  String get onbDoneStep3 => 'Tap to clock out';

  @override
  String get onbDoneStep3Sub => 'Wraps up your day';

  @override
  String get onbDoneGoHome => 'Go home';

  @override
  String get onbScheduleOvertimeTitle => 'Auto overtime detection';

  @override
  String get onbScheduleOvertimeSub => 'Approval requested past 6 PM';

  @override
  String get onbScheduleLeaveTitle => 'Auto leave accrual';

  @override
  String get onbScheduleLeaveSub => 'Monthly on the 1st, based on hire date';

  @override
  String get onbWidgetSizeSmall => 'Small';

  @override
  String get onbWidgetSizeSmallSub => 'Hours only';

  @override
  String get onbWidgetSizeMedium => 'Medium';

  @override
  String get onbWidgetSizeMediumSub => 'Hours + team';

  @override
  String get onbWidgetSizeLarge => 'Large';

  @override
  String get onbWidgetSizeLargeSub => 'Full dashboard';

  @override
  String get onbWidgetDemoToday => 'Today';

  @override
  String get onbWidgetDemoOfficeTime => 'Office · 09:02';

  @override
  String get onbWidgetDemoClockOut => 'Clock out';

  @override
  String get tweaksTitle => 'Tweaks';

  @override
  String get tweaksTheme => 'Theme';

  @override
  String get tweaksThemeLight => 'Light';

  @override
  String get tweaksThemeDark => 'Dark';

  @override
  String get tweaksBrand => 'Brand color';

  @override
  String get tweaksFontSize => 'Font size';

  @override
  String get tweaksFontSm => 'Small';

  @override
  String get tweaksFontMd => 'Medium';

  @override
  String get tweaksFontLg => 'Large';

  @override
  String get tweaksLanguage => 'Language';

  @override
  String get tweaksReset => 'Reset';

  @override
  String get pushSection => 'Push notifications';

  @override
  String get pushEnable => 'Enable push';

  @override
  String get pushDisable => 'Disable push';

  @override
  String get pushSuccess => 'Push notifications enabled';

  @override
  String get pushDisabled => 'Push notifications disabled';

  @override
  String get pushErrorUNSUPPORTED => 'This browser does not support push notifications';

  @override
  String get pushErrorPERMISSION_DENIED => 'Notification permission denied';

  @override
  String get pushErrorNO_VAPID_KEY => 'Push server is not configured';

  @override
  String get pushErrorSUBSCRIBE_FAILED => 'Subscription failed';

  @override
  String get pushErrorREGISTER_FAILED => 'Service worker registration failed';

  @override
  String get tripTitle => 'Business trip';

  @override
  String get tripNew => 'New request';

  @override
  String get tripMyRequests => 'My requests';

  @override
  String get tripEmpty => 'No trip requests yet';

  @override
  String get tripKind => 'Type';

  @override
  String get tripKindBusiness => 'Business trip';

  @override
  String get tripKindField => 'Field work';

  @override
  String get tripStartsOn => 'From';

  @override
  String get tripEndsOn => 'To';

  @override
  String get tripPlace => 'Place';

  @override
  String get tripPurpose => 'Purpose';

  @override
  String get tripSubmit => 'Submit';

  @override
  String get tripSubmitted => 'Trip request submitted';

  @override
  String get tripFailed => 'Submission failed';

  @override
  String get tripStatusPending => 'Pending';

  @override
  String get tripStatusApproved => 'Approved';

  @override
  String get tripStatusRejected => 'Rejected';

  @override
  String get tripStatusCancelled => 'Cancelled';

  @override
  String get tripErrorsInvalidRange => 'End date must be on or after start date';

  @override
  String get tripErrorsLocationRequired => 'Please enter a location';

  @override
  String get noticeTitle => 'Notices';

  @override
  String get noticePinned => 'Pinned';

  @override
  String get noticeRecent => 'Recent';

  @override
  String get noticeEmpty => 'No notices';

  @override
  String get noticeShowPinned => 'Pinned only';

  @override
  String get noticeShowAll => 'Show all';

  @override
  String get noticeCatAll => 'All';

  @override
  String get noticeCatPolicy => 'Policy';

  @override
  String get noticeCatEvent => 'Event';

  @override
  String get noticeCatIt => 'IT';

  @override
  String get noticeCatHr => 'HR';

  @override
  String get noticeCatGeneral => 'General';

  @override
  String get commonLoading => 'Loading';

  @override
  String get commonRetry => 'Retry';

  @override
  String get commonError => 'Something went wrong';

  @override
  String get commonCancel => 'Cancel';

  @override
  String get commonConfirm => 'Confirm';

  @override
  String get commonClose => 'Close';

  @override
  String get commonSkipToMain => 'Skip to main content';

  @override
  String get commonPrev => 'Previous';

  @override
  String get commonNext => 'Next';

  @override
  String get commonDaysShortSun => 'Sun';

  @override
  String get commonDaysShortMon => 'Mon';

  @override
  String get commonDaysShortTue => 'Tue';

  @override
  String get commonDaysShortWed => 'Wed';

  @override
  String get commonDaysShortThu => 'Thu';

  @override
  String get commonDaysShortFri => 'Fri';

  @override
  String get commonDaysShortSat => 'Sat';

  @override
  String commonYearMonth(Object month, Object year) {
    return '$month/$year';
  }

  @override
  String commonMonthDay(Object day, Object month) {
    return '$month/$day';
  }

  @override
  String commonWeekdayMonthDay(Object day, Object month, Object weekday) {
    return '$weekday · $month/$day';
  }

  @override
  String get commonLangKo => '한국어';

  @override
  String get commonLangEn => 'English';

  @override
  String get commonNotfoundTitle => 'Page not found';

  @override
  String get commonNotfoundSub => 'Check the URL or use one of the buttons below.';

  @override
  String get commonNotfoundGoHome => 'Go home';

  @override
  String get commonNotfoundGoLogin => 'Log in';

  @override
  String get webNavDashboard => 'Dashboard';

  @override
  String get webNavInbox => 'Inbox';

  @override
  String get webNavTeamLeave => 'Team leave';

  @override
  String get webNavRecords => 'Records';

  @override
  String get webNavAdmin => 'Admin';

  @override
  String get webPrimaryNav => 'Primary';

  @override
  String get webWorkspace => 'Workspace';

  @override
  String get webOpenMenu => 'Open menu';

  @override
  String get webCloseMenu => 'Close menu';

  @override
  String get webOpenUser => 'User menu';

  @override
  String get webLogout => 'Log out';

  @override
  String get webTodayKpi => 'Today';

  @override
  String get webClockInAt => 'Clock-in';

  @override
  String get webCumWork => 'Worked';

  @override
  String get webLeaveRemaining => 'Leave left';

  @override
  String get webTeamPreview => 'Team preview';

  @override
  String get webRecentRecords => 'Recent records';

  @override
  String get webPendingInbox => 'Pending';

  @override
  String get webSeeAll => 'See all';

  @override
  String get webSkeletonLoading => 'Loading';

  @override
  String get inboxTitle => 'Inbox';

  @override
  String get inboxFilterAll => 'All';

  @override
  String get inboxFilterPending => 'Pending';

  @override
  String get inboxFilterApproved => 'Approved';

  @override
  String get inboxFilterRejected => 'Rejected';

  @override
  String get inboxFilterToApprove => 'To approve';

  @override
  String get inboxFilterMine => 'Mine';

  @override
  String get inboxFilterCompany => 'Company';

  @override
  String get inboxSelectToView => 'Select an item from the list';

  @override
  String get inboxRequester => 'Requester';

  @override
  String get inboxRequestedAt => 'Requested';

  @override
  String get inboxReason => 'Reason';

  @override
  String get inboxType => 'Type';

  @override
  String get inboxDetail => 'Detail';

  @override
  String get inboxApprove => 'Approve';

  @override
  String get inboxReject => 'Reject';

  @override
  String get inboxRejectReasonLabel => 'Reject reason (optional)';

  @override
  String get inboxRejectReasonPlaceholder => 'Explain briefly';

  @override
  String get inboxSubmitReject => 'Send rejection';

  @override
  String get inboxApprovedToast => 'Approved';

  @override
  String get inboxRejectedToast => 'Rejected';

  @override
  String get inboxDecisionFailed => 'Decision failed';

  @override
  String get inboxEmptyList => 'Nothing to do';

  @override
  String get inboxKindLeave => 'Leave';

  @override
  String get inboxKindOvertime => 'Overtime';

  @override
  String get inboxKindWfh => 'WFH';

  @override
  String get recordsTitle => 'Records';

  @override
  String get recordsMonthFilter => 'Month';

  @override
  String get recordsStatusFilter => 'Status';

  @override
  String get recordsStatusAll => 'All';

  @override
  String get recordsStatusOk => 'OK';

  @override
  String get recordsStatusLate => 'Late';

  @override
  String get recordsStatusOt => 'OT';

  @override
  String get recordsStatusOff => 'Off';

  @override
  String get recordsColumnDate => 'Date';

  @override
  String get recordsColumnIn => 'In';

  @override
  String get recordsColumnOut => 'Out';

  @override
  String get recordsColumnTotal => 'Total';

  @override
  String get recordsColumnLocation => 'Place';

  @override
  String get recordsColumnStatus => 'Status';

  @override
  String get recordsDetailTitle => 'Record detail';

  @override
  String get recordsDetailClockIn => 'Clock-in';

  @override
  String get recordsDetailClockOut => 'Clock-out';

  @override
  String get recordsDetailTotal => 'Total';

  @override
  String get recordsDetailLate => 'Late';

  @override
  String get recordsDetailLocation => 'Place';

  @override
  String get recordsDetailClose => 'Close';

  @override
  String get recordsLoadMore => 'Load more';

  @override
  String get recordsEmpty => 'No records';

  @override
  String get teamLeaveTitle => 'Team leave';

  @override
  String get teamLeaveMonth => 'Month';

  @override
  String get teamLeaveQuarter => 'Quarter';

  @override
  String get teamLeaveLeaveLabel => 'Leave';

  @override
  String get teamLeaveWeekendLabel => 'Weekend';

  @override
  String get teamLeaveCellOpen => 'On leave';

  @override
  String get teamLeaveNoOne => 'No one on leave';

  @override
  String get complianceTitle => 'Weekly 52h';

  @override
  String get complianceSub => 'Track this week\'s accumulated hours';

  @override
  String get complianceThreshold => 'Limit';

  @override
  String get complianceCurrent => 'Current';

  @override
  String get complianceRemaining => 'Remaining';

  @override
  String get complianceHoursUnit => 'h';

  @override
  String get complianceStatusOk => 'OK';

  @override
  String get complianceStatusWarn => 'Warning';

  @override
  String get complianceStatusOver => 'Over';

  @override
  String get complianceHistory => 'Recent';

  @override
  String complianceWeekLabel(Object week) {
    return 'Week of $week';
  }

  @override
  String get complianceBlockTitle => 'Clock-in blocked';

  @override
  String get complianceBlockSub => 'You\'ve reached the 52h weekly limit. Talk to your manager.';

  @override
  String get complianceBlockClose => 'Close';

  @override
  String get complianceAdminTitle => '52h Compliance';

  @override
  String get complianceAdminSub => 'Company-wide weekly totals';

  @override
  String get complianceColMember => 'Employee';

  @override
  String get complianceColDept => 'Team';

  @override
  String get complianceColHours => 'Hours';

  @override
  String get complianceColStatus => 'Status';

  @override
  String get complianceBulkMessage => 'Send notice to selected';

  @override
  String get complianceEmpty => 'No data this week';

  @override
  String get complianceMatrixTitle => 'Team calendar';

  @override
  String get complianceMatrixMember => 'Employee';

  @override
  String get complianceMatrixLegendOffice => 'Office';

  @override
  String get complianceMatrixLegendWfh => 'WFH';

  @override
  String get complianceMatrixLegendLeave => 'Leave';

  @override
  String get complianceMatrixLegendBreak => 'Break';

  @override
  String get complianceMatrixLegendOff => 'Off';

  @override
  String get leaveApplyTitle => 'Request leave';

  @override
  String get leaveApplyFrom => 'From';

  @override
  String get leaveApplyTo => 'To';

  @override
  String get leaveApplyReason => 'Reason';

  @override
  String get leaveApplySubmit => 'Submit';

  @override
  String get leaveApplySubmitted => 'Sent';

  @override
  String get leaveApplyFailed => 'Submission failed';

  @override
  String get leaveApplyInvalidDates => 'End must be on or after start';

  @override
  String get adminNavDashboard => 'Dashboard';

  @override
  String get adminNavApprovals => 'Approvals';

  @override
  String get adminNavEmployees => 'Employees';

  @override
  String get adminNavReports => 'Reports';

  @override
  String get adminNavAudit => 'Audit';

  @override
  String get adminNavCodes => 'Codes';

  @override
  String get adminNavSettings => 'Settings';

  @override
  String get adminNavCompliance => '52h';

  @override
  String get adminNavExpiringLeave => 'Expiring';

  @override
  String get adminRoleOwner => 'Owner';

  @override
  String get adminRoleAdmin => 'Admin';

  @override
  String get adminRoleManager => 'Manager';

  @override
  String get adminRoleEmployee => 'Employee';

  @override
  String get adminDashTitle => 'Dashboard';

  @override
  String get adminDashSub => 'Today\'s attendance';

  @override
  String get adminKpiAttendanceRate => 'Attendance';

  @override
  String get adminKpiAbsent => 'Absent';

  @override
  String get adminKpiPendingApprovals => 'Pending';

  @override
  String get adminKpiOngoingOvertime => 'Overtime now';

  @override
  String get adminQuickActions => 'Quick actions';

  @override
  String get adminQaReviewApprovals => 'Review approvals';

  @override
  String get adminQaViewEmployees => 'Employees';

  @override
  String get adminQaOpenReports => 'Reports';

  @override
  String get adminQaIssueCode => 'Issue code';

  @override
  String get adminApprTitle => 'Approvals';

  @override
  String get adminApprSub => 'Requests waiting for review';

  @override
  String get adminApprFilterStatus => 'Status';

  @override
  String get adminApprFilterAll => 'All';

  @override
  String get adminApprFilterPending => 'Pending';

  @override
  String get adminApprFilterApproved => 'Approved';

  @override
  String get adminApprFilterRejected => 'Rejected';

  @override
  String get adminApprBulkApprove => 'Approve selected';

  @override
  String get adminApprBulkReject => 'Reject selected';

  @override
  String get adminApprSelectAll => 'Select all';

  @override
  String adminApprSelected(Object n) {
    return '$n selected';
  }

  @override
  String get adminApprKindLeave => 'Leave';

  @override
  String get adminApprKindOvertime => 'Overtime';

  @override
  String get adminApprKindTrip => 'Business trip';

  @override
  String get adminApprKindManualClockIn => 'Manual clock-in';

  @override
  String get adminApprApprove => 'Approve';

  @override
  String get adminApprReject => 'Reject';

  @override
  String get adminApprEmpty => 'No requests to review';

  @override
  String get adminApprAlreadyDecided => 'Already processed';

  @override
  String adminApprPartialFail(Object failed, Object succeeded, Object total) {
    return '$succeeded/$total processed · $failed failed';
  }

  @override
  String get adminEmpTitle => 'Employees';

  @override
  String get adminEmpSearchPlaceholder => 'Search by name, email, team';

  @override
  String get adminEmpRoleAll => 'Role · All';

  @override
  String get adminEmpColEmployee => 'Employee';

  @override
  String get adminEmpColRole => 'Role';

  @override
  String get adminEmpColTeam => 'Team';

  @override
  String get adminEmpColPosition => 'Position';

  @override
  String get adminEmpColStatus => 'Status';

  @override
  String get adminEmpColJoined => 'Joined';

  @override
  String get adminEmpStatusActive => 'Active';

  @override
  String get adminEmpStatusInactive => 'Inactive';

  @override
  String get adminEmpEmpty => 'No employees to show';

  @override
  String get adminEmpDetailOverview => 'Overview';

  @override
  String get adminEmpDetailAttendance => 'Attendance';

  @override
  String get adminEmpDetailLeave => 'Leave';

  @override
  String get adminEmpDetailPerm => 'Permissions';

  @override
  String get adminEmpFieldRole => 'Role';

  @override
  String get adminEmpFieldPosition => 'Position';

  @override
  String get adminEmpFieldDepartment => 'Department';

  @override
  String get adminEmpFieldActive => 'Active';

  @override
  String get adminEmpSave => 'Save';

  @override
  String get adminEmpDeactivate => 'Deactivate';

  @override
  String get adminEmpRoleRequired => 'Role is required';

  @override
  String get adminEmpPositionTooLong => 'Position must be 50 chars or fewer';

  @override
  String get adminEmpDepartmentTooLong => 'Department must be 50 chars or fewer';

  @override
  String get adminEmpSaveSuccess => 'Changes saved';

  @override
  String get adminEmpSaveFailed => 'Save failed';

  @override
  String get adminRepTitle => 'Monthly report';

  @override
  String get adminRepPickMonth => 'Pick month';

  @override
  String get adminRepExportCsv => 'Export CSV';

  @override
  String get adminRepExportPdf => 'Export PDF';

  @override
  String get adminRepPdfTodo => 'PDF export is not ready yet';

  @override
  String get adminRepKpiOnTime => 'On-time rate';

  @override
  String get adminRepKpiAvgWeekly => 'Avg weekly hours';

  @override
  String get adminRepKpiTotalOvertime => 'Total overtime';

  @override
  String get adminRepKpiLeaveUsage => 'Leave usage';

  @override
  String get adminRepTeamTable => 'Team performance';

  @override
  String get adminRepColTeam => 'Team';

  @override
  String get adminRepColAttendance => 'On-time rate';

  @override
  String get adminRepColAvgWeek => 'Avg weekly';

  @override
  String get adminRepColAvgOvertime => 'Avg OT';

  @override
  String get adminExpiringTitle => 'Expiring leave';

  @override
  String adminExpiringSub(Object days) {
    return 'Risk within $days days';
  }

  @override
  String get adminExpiringColEmployee => 'Employee';

  @override
  String get adminExpiringColRemaining => 'Remaining';

  @override
  String get adminExpiringColExpiring => 'Expiring';

  @override
  String get adminExpiringEmpty => 'No expiry risk';

  @override
  String get adminSettingsTitle => 'Company settings';

  @override
  String get adminSettingsSubOwner => 'Manage company info, brand, and operating policies';

  @override
  String get adminSettingsSubAdmin => 'Read-only company settings. Owner role required to edit.';

  @override
  String get adminSettingsSectionCompany => 'Company info';

  @override
  String get adminSettingsSectionBrand => 'Brand';

  @override
  String get adminSettingsSectionPolicy => 'Operating policy';

  @override
  String get adminSettingsCompanyName => 'Company name';

  @override
  String get adminSettingsCompanyCode => 'Company code';

  @override
  String get adminSettingsFiscalYear => 'Fiscal year start';

  @override
  String get adminSettingsLocale => 'Default locale';

  @override
  String get adminSettingsTimezone => 'Timezone';

  @override
  String get adminSettingsBrandColor => 'Brand color';

  @override
  String get adminSettingsLogoUrl => 'Logo URL';

  @override
  String get adminSettingsComplianceBlock => 'Block clock-in over 52h/week';

  @override
  String get adminSettingsComplianceBlockDesc => 'Auto-block clock-in for over-limit employees. Default: warn only.';

  @override
  String get adminSettingsLeavePromotion => 'Auto leave promotion alerts';

  @override
  String get adminSettingsLeavePromotionDesc => 'Labor Standards Act §61 — auto reminders 6/2 months before expiry.';

  @override
  String get adminSettingsSave => 'Save';

  @override
  String get adminSettingsSaving => 'Saving...';

  @override
  String get adminSettingsSaved => 'Saved';

  @override
  String get adminSettingsReset => 'Reset';

  @override
  String get adminSettingsOwnerOnlyHint => 'Only the owner can change settings';

  @override
  String get adminSettingsSectionData => 'Data management';

  @override
  String get adminSettingsDataExportTitle => 'Data export request';

  @override
  String get adminSettingsDataExportDesc => 'To export all company data, send a request by email.';

  @override
  String get adminSettingsDataExportBtn => 'Open export request email';

  @override
  String get adminSettingsDataDeleteTitle => 'Data deletion request';

  @override
  String get adminSettingsDataDeleteDesc => 'Request company/account data deletion at privacy@molcube.com.';

  @override
  String get adminSettingsDataDeleteBtn => 'Open deletion request email';

  @override
  String get adminSettingsSectionHelp => 'Operations guide';

  @override
  String get adminSettingsHelpDataExportSop => 'Data export SOP';

  @override
  String get adminSettingsHelpDataDeleteSop => 'Data deletion SOP';

  @override
  String get adminSettingsHelpEmergencyPw => 'Emergency password reset SOP';

  @override
  String get adminSettingsHelpOnboard => 'New company onboarding SOP';

  @override
  String get adminSettingsLoadError => 'Failed to load settings';

  @override
  String get adminSettingsLoadErrorRetry => 'Retry';

  @override
  String get adminNavAriaLabel => 'Admin navigation';

  @override
  String get adminAuditTitle => 'Audit log';

  @override
  String get adminAuditFilterAction => 'Action';

  @override
  String get adminAuditFilterActor => 'Actor';

  @override
  String get adminAuditFilterFrom => 'From';

  @override
  String get adminAuditFilterTo => 'To';

  @override
  String get adminAuditApply => 'Apply';

  @override
  String get adminAuditLoadMore => 'Load more';

  @override
  String get adminAuditColAt => 'Time';

  @override
  String get adminAuditColActor => 'Actor';

  @override
  String get adminAuditColAction => 'Action';

  @override
  String get adminAuditColTarget => 'Target';

  @override
  String get adminAuditEmpty => 'No audit entries';

  @override
  String get adminCodeTitle => 'Invite codes';

  @override
  String get adminCodeIssue => 'Issue';

  @override
  String get adminCodeRevoke => 'Revoke';

  @override
  String get adminCodeMaxUses => 'Max uses';

  @override
  String get adminCodeExpiresAt => 'Expires at';

  @override
  String get adminCodeOptional => 'optional';

  @override
  String get adminCodeColCode => 'Code';

  @override
  String get adminCodeColUses => 'Uses';

  @override
  String get adminCodeColExpires => 'Expires';

  @override
  String get adminCodeColStatus => 'Status';

  @override
  String get adminCodeStatusActive => 'Active';

  @override
  String get adminCodeStatusRevoked => 'Revoked';

  @override
  String get adminCodeEmpty => 'No codes issued yet';

  @override
  String get adminCommonBack => 'Back';

  @override
  String get adminCommonSave => 'Save';

  @override
  String get adminCommonCancel => 'Cancel';

  @override
  String get adminCommonLoading => 'Loading';

  @override
  String get adminCommonError => 'Something went wrong';

  @override
  String get adminForbiddenTitle => 'Forbidden';

  @override
  String get adminForbiddenSub => 'Admin pages are restricted to ADMIN/OWNER roles';

  @override
  String get ownerBillingTitle => 'Billing';

  @override
  String get ownerBillingSubtitle => 'Review your current plan and invoice history';

  @override
  String get ownerBillingCurrentPlan => 'Current plan';

  @override
  String get ownerBillingMonth => 'month';

  @override
  String get ownerBillingNoSubscription => 'No active subscription';

  @override
  String get ownerBillingPeriodEnd => 'Next billing date';

  @override
  String get ownerBillingChangePlan => 'Change plan';

  @override
  String get ownerBillingChangePlanTooltip => 'Coming in iter14 — requires Stripe integration';

  @override
  String get ownerBillingStatusTrial => 'Trial';

  @override
  String get ownerBillingStatusActive => 'Active';

  @override
  String get ownerBillingStatusPastDue => 'Past due';

  @override
  String get ownerBillingStatusCanceled => 'Canceled';

  @override
  String get ownerBillingInvoiceHistory => 'Invoice history';

  @override
  String get ownerBillingNoInvoices => 'No invoices issued yet';

  @override
  String get ownerBillingColIssuedAt => 'Issued';

  @override
  String get ownerBillingColAmount => 'Amount';

  @override
  String get ownerBillingColStatus => 'Status';

  @override
  String get ownerBillingColPdf => 'Receipt';

  @override
  String get ownerBillingInvoiceStatusDraft => 'Draft';

  @override
  String get ownerBillingInvoiceStatusPaid => 'Paid';

  @override
  String get ownerBillingInvoiceStatusVoid => 'Void';

  @override
  String get ownerBillingDownloadPdf => 'PDF';

  @override
  String get ownerBillingNavBilling => 'Billing';

  @override
  String get mobileBack => 'Back';

  @override
  String get mobileLeaveApplyKind => 'Type';

  @override
  String get mobileLeaveApplyKindFull => 'Full day';

  @override
  String get mobileLeaveApplyKindAmHalf => 'AM half';

  @override
  String get mobileLeaveApplyKindPmHalf => 'PM half';

  @override
  String mobileLeaveApplyDaysUsedOne(Object n) {
    return '$n day used';
  }

  @override
  String get mobileLeaveApplyAfterBalance => 'Remaining after';

  @override
  String get mobileLeaveApplyOverBalance => 'Exceeds your balance';

  @override
  String get mobileLeaveApplySubmit => 'Submit';

  @override
  String get mobileLeaveApplySuccessTitle => 'Submitted';

  @override
  String get mobileLeaveApplySuccessSub => 'We\'ll let you know once it\'s reviewed';

  @override
  String get mobileLeaveApplyPeriod => 'Period';

  @override
  String get mobileLeaveApplyType => 'Type';

  @override
  String get mobileLeaveApplyPrimary => 'OK';

  @override
  String get mobileLeaveApplySecondary => 'View requests';

  @override
  String get mobileLeaveApplyExpiryTitle => 'Leave expiring soon';

  @override
  String mobileLeaveApplyExpirySub(Object days) {
    return '$days days expire within a week';
  }

  @override
  String get mobileLeaveApplyExpiryCta => 'Apply now';

  @override
  String get mobileLeaveApplyExpiryDismiss => 'Later';

  @override
  String get mobileLeaveApplyReasonPlaceholder => 'Reason (optional)';

  @override
  String get mobileOvertimeTitle => 'Overtime';

  @override
  String get mobileOvertimeTabRequest => 'Request';

  @override
  String get mobileOvertimeTabSettings => 'Auto';

  @override
  String get mobileOvertimeTabHistory => 'History';

  @override
  String get mobileOvertimeWorkDate => 'Work date';

  @override
  String get mobileOvertimeMinutes => 'Minutes';

  @override
  String get mobileOvertimeMinutesHint => 'e.g. 90 = 1h 30m';

  @override
  String get mobileOvertimeReason => 'Reason';

  @override
  String get mobileOvertimeReasonPlaceholder => 'Sprint deadline, design QA…';

  @override
  String get mobileOvertimeSubmit => 'Submit';

  @override
  String get mobileOvertimeSubmitted => 'Overtime request sent';

  @override
  String get mobileOvertimeFailed => 'Submission failed';

  @override
  String get mobileOvertimeAutoThreshold => 'Auto-request threshold (min)';

  @override
  String get mobileOvertimeAutoThresholdDesc => 'Auto-request if overrun exceeds N minutes';

  @override
  String get mobileOvertimeAutoEnabled => 'Auto-request';

  @override
  String get mobileOvertimeHistoryEmpty => 'No history';

  @override
  String get mobileOvertimeMinutesRequired => 'Enter minutes';

  @override
  String get mobileOvertimeMinutesMin => 'Must be at least 1 minute';

  @override
  String get mobileOvertimeMinutesMax => 'Up to 720 minutes (12h)';

  @override
  String get mobileOvertimeReasonRequired => 'Reason required';

  @override
  String get mobileOvertimeDateRequired => 'Pick a date';

  @override
  String get mobileInboxTitle => 'Inbox';

  @override
  String get mobileInboxTabToApprove => 'To approve';

  @override
  String get mobileInboxTabMine => 'Mine';

  @override
  String get mobileInboxTabSystem => 'System';

  @override
  String get mobileInboxEmpty => 'Nothing to do';

  @override
  String get mobileInboxEmptySub => 'Check back in a bit';

  @override
  String get mobileInboxQuickTitle => 'Quick approve';

  @override
  String get mobileInboxSwipeHint => 'Swipe left to reject · right to approve';

  @override
  String get mobileInboxRejectLabel => 'Reject';

  @override
  String get mobileInboxApproveLabel => 'Approve';

  @override
  String get mobileInboxRejectReason => 'Reject reason (optional)';

  @override
  String get mobileInboxRejectReasonPlaceholder => 'Explain briefly';

  @override
  String get mobileInboxSendReject => 'Send rejection';

  @override
  String get mobileInboxApprovedToast => 'Approved';

  @override
  String get mobileInboxRejectedToast => 'Rejected';

  @override
  String get mobileInboxDecisionFailed => 'Decision failed';

  @override
  String get mobileInboxKindOvertime => 'Overtime';

  @override
  String get mobileInboxKindLeave => 'Leave';

  @override
  String get mobileInboxKindWfh => 'WFH';

  @override
  String get mobileInboxKindOutwork => 'Outside';

  @override
  String get mobileInboxKindManualClockIn => 'Manual clock-in';

  @override
  String get mobileInboxKindTrip => 'Trip';

  @override
  String get mobileNotificationsTitle => 'Notifications';

  @override
  String get mobileNotificationsMarkAll => 'Mark all';

  @override
  String get mobileNotificationsEmptyTitle => 'All caught up';

  @override
  String get mobileNotificationsEmptySub => 'New notifications will appear here';

  @override
  String get mobileNotificationsFilterAll => 'All';

  @override
  String get mobileNotificationsFilterApprove => 'Approvals';

  @override
  String get mobileNotificationsFilterLeave => 'Leave';

  @override
  String get mobileNotificationsFilterNotice => 'Notice';

  @override
  String get mobileNoticeTitle => 'Notices';

  @override
  String get mobileNoticePinned => 'Pinned';

  @override
  String get mobileNoticeRecent => 'Recent';

  @override
  String mobileNoticeViews(Object n) {
    return '$n views';
  }

  @override
  String get mobileNoticeEmpty => 'No notices';

  @override
  String get mobileNoticeRequiredTag => '[Required]';

  @override
  String get mobileNoticePinnedTitle => 'Leave expiry policy update';

  @override
  String get mobileNoticePinnedBody => 'Starting 2026, leave must be used within 2 years of accrual. Unused days expire automatically…';

  @override
  String get mobileNoticeDemoWorkshopTag => 'Workshop';

  @override
  String get mobileNoticeDemoWorkshopTitle => 'December team workshop signup';

  @override
  String get mobileNoticeDemoWorkshopSub => 'Jeju 2 nights 3 days · departs 12/20';

  @override
  String get mobileNoticeDemoSystemTag => 'System';

  @override
  String get mobileNoticeDemoSystemTitle => 'Attendance app v2.1 update';

  @override
  String get mobileNoticeDemoSystemSub => 'Widget added · perf improvements';

  @override
  String get mobileSettingsTitle => 'Settings';

  @override
  String get mobileSettingsProfileSection => 'Profile';

  @override
  String get mobileSettingsNotificationsSection => 'Notifications';

  @override
  String get mobileSettingsAppearanceSection => 'Appearance';

  @override
  String get mobileSettingsNotifClock => 'Clock-in alerts';

  @override
  String get mobileSettingsNotifLeave => 'Leave expiry alerts';

  @override
  String get mobileSettingsNotifOvertime => 'Overtime decisions';

  @override
  String get mobileSettingsOn => 'On';

  @override
  String get mobileSettingsOff => 'Off';

  @override
  String get mobileCustomizeTitle => 'Customize';

  @override
  String get mobileCustomizeTheme => 'Theme';

  @override
  String get mobileCustomizeThemeLight => 'Light';

  @override
  String get mobileCustomizeThemeDark => 'Dark';

  @override
  String get mobileCustomizeBrand => 'Brand color';

  @override
  String get mobileCustomizeFontSize => 'Font size';

  @override
  String get mobileCustomizeFontSm => 'Small';

  @override
  String get mobileCustomizeFontMd => 'Medium';

  @override
  String get mobileCustomizeFontLg => 'Large';

  @override
  String get mobileCustomizeLanguage => 'Language';

  @override
  String get mobileCustomizeReset => 'Reset';

  @override
  String get mobileTripTitle => 'Business trip';

  @override
  String get mobileTripStartsOn => 'From';

  @override
  String get mobileTripEndsOn => 'To';

  @override
  String get mobileTripPlace => 'Place';

  @override
  String get mobileTripPurpose => 'Purpose';

  @override
  String get mobileTripSubmit => 'Register';

  @override
  String get mobileTripSubmitted => 'Registered';

  @override
  String get mobileTripComingSoon => 'Coming soon';

  @override
  String get mobileHelpTitle => 'Help';

  @override
  String get mobileHelpFaqQ1 => 'Clock-in not detected?';

  @override
  String get mobileHelpFaqA1 => 'Check location permissions. Auto-detect works within 100m of your office.';

  @override
  String get mobileHelpFaqQ2 => 'How do I see remaining leave?';

  @override
  String get mobileHelpFaqA2 => 'Open the [Leave] tab to see balance, used, and expiring days.';

  @override
  String get mobileHelpFaqQ3 => 'How do I request overtime?';

  @override
  String get mobileHelpFaqA3 => 'Once your normal end time passes you\'ll see a card on Home, or go to [Me > Settings > Overtime].';

  @override
  String get mobileHelpFaqQ4 => 'Push notifications aren\'t arriving';

  @override
  String get mobileHelpFaqA4 => 'Toggle [Me > Notifications] on, allow OS notifications, and enable background refresh. On Android, exclude the app from battery optimization.';

  @override
  String get mobileHelpFaqQ5 => 'I forgot my password';

  @override
  String get mobileHelpFaqA5 => 'Login screen > [Forgot password?] > enter your work email > click the link in the email > set a new password.';

  @override
  String get mobileHelpFaqQ6 => 'How do I get a company code?';

  @override
  String get mobileHelpFaqA6 => 'Ask your HR or admin for a 6-letter company code (e.g. ACMEDM). Codes are issued/expired by admins from the sidebar.';

  @override
  String get mobileHelpContact => 'Contact us';

  @override
  String get mobileHelpManualsTitle => 'Full manuals';

  @override
  String get mobileHelpManualsSub => 'Role-based guides';

  @override
  String get mobileHelpManualEmployee => 'Employee guide';

  @override
  String get mobileHelpManualManager => 'Manager guide';

  @override
  String get mobileHelpManualAdmin => 'Admin guide';

  @override
  String get mobileHelpManualOwner => 'Owner guide';

  @override
  String get mobileHelpManualLinkExternal => '(open web guide)';

  @override
  String get mobileRecordTitle => 'Record';

  @override
  String get mobileRecordTotalWork => 'Total work';

  @override
  String get mobileRecordTimeline => 'Timeline';

  @override
  String get mobileRecordMemo => 'Memo';

  @override
  String get mobileRecordOvertimeApproved => 'Overtime approved';

  @override
  String get mobileRecordLabelIn => 'In';

  @override
  String get mobileRecordLabelOut => 'Out';

  @override
  String get mobileRecordLabelBreak => 'Break';

  @override
  String get mobileWeeklyTitle => 'Weekly report';

  @override
  String get mobileWeeklyTotal => 'Total';

  @override
  String get mobileWeeklyAvg => 'Daily avg';

  @override
  String get mobileWeeklyOvertime => 'Overtime';

  @override
  String get mobileWeeklyTarget => 'Target';

  @override
  String mobileWeeklyAboveAvg(Object n) {
    return '${n}h above avg';
  }

  @override
  String mobileWeeklyBelowAvg(Object n) {
    return '${n}h below avg';
  }

  @override
  String get mobileLocPickerTitle => 'Choose your location';

  @override
  String get mobileLocPickerSub => 'Override auto-detection if needed';

  @override
  String get mobileLocPickerOffice => 'Office';

  @override
  String get mobileLocPickerHome => 'WFH';

  @override
  String get mobileLocPickerOutside => 'Outside';

  @override
  String get mobileLocPickerConfirm => 'Confirm';

  @override
  String get mobileErrorGpsTitle => 'Can\'t detect location';

  @override
  String get mobileErrorGpsSub => 'Check location permissions. You can also pick WFH/Office manually.';

  @override
  String get mobileErrorGpsRetry => 'Try again';

  @override
  String get mobileErrorGpsManual => 'Pick manually';

  @override
  String get mobileProfileFullTitle => 'Profile';

  @override
  String get mobileProfileFullKpiAttendance => 'Attendance';

  @override
  String get mobileProfileFullKpiLeaveUsed => 'Leave used';

  @override
  String get mobileProfileFullKpiAvgWork => 'Daily avg';

  @override
  String get mobileTeamTabsGrid => 'Grid';

  @override
  String get mobileTeamTabsGrouped => 'Teams';

  @override
  String get mobileTeamTabsTimeline => 'Timeline';

  @override
  String mobileTeamDemoWorkingCount(Object total, Object working) {
    return '$working/$total working';
  }

  @override
  String get mobileTeamDemoTeamDesign => 'Design';

  @override
  String get mobileTeamDemoTeamEngineering => 'Engineering';

  @override
  String get mobileTeamDemoTeamProduct => 'Product';

  @override
  String get mobileTeamDemoTeamOperations => 'Operations';

  @override
  String get mobileTeamDemoMemberJiwoo => 'Jiwoo';

  @override
  String get mobileTeamDemoMemberMinsoo => 'Minsoo';

  @override
  String get mobileTeamDemoMemberYerin => 'Yerin';

  @override
  String get mobileTeamDemoMemberHyunwoo => 'Hyunwoo';

  @override
  String get mobileTeamDemoMemberSooa => 'Sooa';

  @override
  String get mobileTeamDemoMemberDoyoon => 'Doyoon';
}
