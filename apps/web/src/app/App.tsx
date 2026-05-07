import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes, Navigate } from "react-router-dom";
import { LoginPage } from "@pages/login";
import { SignupPage } from "@pages/signup";
import { HealthPage } from "@pages/health";
import { ForgotPasswordPage } from "@pages/forgot";

import { MobileShell } from "@widgets/mobile-shell";
import { HomePage } from "@pages/m-home";
import { TeamPage } from "@pages/m-team";
import { LeavePage } from "@pages/m-leave";
import { MyPage } from "@pages/m-my";
import { OvertimePage } from "@pages/m-overtime";
import { LeaveApplyPage } from "@pages/m-leave-apply";
import { LeaveSuccessPage } from "@pages/m-leave-success";
import { LeaveExpiryAlertPage } from "@pages/m-leave-expiry";
import { InboxPage as MobInboxPage } from "@pages/m-inbox";
import { InboxQuickPage } from "@pages/m-inbox-quick";
import { RecordDetailPage } from "@pages/m-record-detail";
import { ApprovalDetailPage } from "@pages/m-approval-detail";
import { WeeklyReportPage } from "@pages/m-weekly-report";
import { NotificationsPage as MobNotificationsPage } from "@pages/m-notifications";
import { NoticePage } from "@pages/m-notice";
import { SettingsPage } from "@pages/m-settings";
import { ProfileFullPage } from "@pages/m-profile-full";
import { CustomizePage } from "@pages/m-customize";
import { TripPage } from "@pages/m-trip";
import { HelpPage } from "@pages/m-help";
import { EmptyNotificationsPage } from "@pages/m-empty-noti";
import { LocPickerPage } from "@pages/m-loc-picker";
import { ErrorGpsPage } from "@pages/m-error-gps";

import { WelcomePage } from "@pages/onboarding-welcome";
import { CompanyCodePage } from "@pages/onboarding-company-code";
import { ProfilePage } from "@pages/onboarding-profile";
import { LocationPage } from "@pages/onboarding-location";
import { SchedulePage } from "@pages/onboarding-schedule";
import { NotificationsPage } from "@pages/onboarding-notifications";
import { WidgetPage } from "@pages/onboarding-widget";
import { DonePage } from "@pages/onboarding-done";

import { WebShell } from "@widgets/web-shell";
import { WebDashboardPage } from "@pages/web-dashboard";
import { WebInboxPage } from "@pages/web-inbox";
import { WebRecordsPage } from "@pages/web-records";
import { WebTeamLeavePage } from "@pages/web-team-leave";

import { AdminShell, AdminRoute } from "@widgets/admin-shell";
import { AdminDashboardPage } from "@pages/admin-dashboard";
import { AdminApprovalsPage } from "@pages/admin-approvals";
import { AdminEmployeesPage } from "@pages/admin-employees";
import { AdminEmployeeDetailPage } from "@pages/admin-employee-detail";
import { AdminReportsPage } from "@pages/admin-reports";
import { AdminExpiringLeavePage } from "@pages/admin-expiring-leave";
import { AdminAuditPage } from "@pages/admin-audit";
import { AdminCodesPage } from "@pages/admin-codes";
import { AdminCompliancePage } from "@pages/admin-compliance";
import { ComplianceMobilePage } from "@pages/m-compliance";
import { ComplianceBlockPage } from "@pages/m-compliance-block";
import { NotFoundPage } from "@pages/not-found";
import { WebTeamCalendarPage } from "@pages/web-team-calendar";
import { RequireMember } from "./routeGuards";

export function App() {
  const { i18n, t } = useTranslation();

  // Keep <html lang> in sync with the active locale so screen readers and
  // search engines pick the correct pronunciation/index. Subscribes to
  // `languageChanged` so runtime switches via the tweaks panel propagate.
  useEffect(() => {
    function sync(): void {
      if (typeof document !== "undefined") {
        document.documentElement.lang = i18n.language || "ko";
      }
    }
    sync();
    i18n.on("languageChanged", sync);
    return () => {
      i18n.off("languageChanged", sync);
    };
  }, [i18n]);

  return (
    <>
      {/* Skip-to-main link: hidden until focused. WCAG 2.1 2.4.1. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only"
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          padding: "8px 12px",
          minWidth: 40,
          minHeight: 40,
          background: "var(--grey-900)",
          color: "var(--white)",
          borderRadius: "var(--r-sm)",
          fontWeight: 600,
        }}
      >
        {t("common.skip_to_main")}
      </a>
      <Routes>
      <Route path="/" element={<Navigate to="/m/home" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot" element={<ForgotPasswordPage />} />

      <Route path="/onboarding">
        <Route index element={<Navigate to="welcome" replace />} />
        <Route path="welcome" element={<WelcomePage />} />
        <Route path="company-code" element={<CompanyCodePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="location" element={<LocationPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="widget" element={<WidgetPage />} />
        <Route path="done" element={<DonePage />} />
      </Route>

      <Route path="/m" element={<RequireMember><MobileShell /></RequireMember>}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<HomePage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="leave" element={<LeavePage />} />
        <Route path="leave/apply" element={<LeaveApplyPage />} />
        <Route path="leave/success" element={<LeaveSuccessPage />} />
        <Route path="leave/expiry" element={<LeaveExpiryAlertPage />} />
        <Route path="my" element={<MyPage />} />
        <Route path="overtime" element={<OvertimePage />} />
        <Route path="inbox" element={<MobInboxPage />} />
        <Route path="inbox/quick" element={<InboxQuickPage />} />
        <Route path="inbox/:id" element={<ApprovalDetailPage />} />
        <Route path="record/:id" element={<RecordDetailPage />} />
        <Route path="report/weekly" element={<WeeklyReportPage />} />
        <Route path="notifications" element={<MobNotificationsPage />} />
        <Route path="notifications/empty" element={<EmptyNotificationsPage />} />
        <Route path="notice" element={<NoticePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfileFullPage />} />
        <Route path="customize" element={<CustomizePage />} />
        <Route path="trip" element={<TripPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="loc-picker" element={<LocPickerPage />} />
        <Route path="error-gps" element={<ErrorGpsPage />} />
        <Route path="compliance" element={<ComplianceMobilePage />} />
        <Route path="compliance/block" element={<ComplianceBlockPage />} />
      </Route>

      <Route path="/web" element={<RequireMember><WebShell /></RequireMember>}>
        <Route index element={<WebDashboardPage />} />
        <Route path="inbox" element={<WebInboxPage />} />
        <Route path="records" element={<WebRecordsPage />} />
        <Route path="team-leave" element={<WebTeamLeavePage />} />
        <Route path="team-calendar" element={<WebTeamCalendarPage />} />
      </Route>

      <Route path="/dashboard" element={<Navigate to="/web" replace />} />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminShell />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="approvals" element={<AdminApprovalsPage />} />
        <Route path="employees" element={<AdminEmployeesPage />} />
        <Route path="employees/:id" element={<AdminEmployeeDetailPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="expiring-leave" element={<AdminExpiringLeavePage />} />
        <Route path="audit" element={<AdminAuditPage />} />
        <Route path="codes" element={<AdminCodesPage />} />
        <Route path="compliance" element={<AdminCompliancePage />} />
      </Route>

      <Route path="/__health" element={<HealthPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </>
  );
}
