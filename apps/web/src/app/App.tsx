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

import { WelcomePage } from "@pages/onboarding-welcome";
import { CompanyCodePage } from "@pages/onboarding-company-code";
import { ProfilePage } from "@pages/onboarding-profile";
import { LocationPage } from "@pages/onboarding-location";
import { SchedulePage } from "@pages/onboarding-schedule";
import { NotificationsPage } from "@pages/onboarding-notifications";
import { WidgetPage } from "@pages/onboarding-widget";
import { DonePage } from "@pages/onboarding-done";

export function App() {
  return (
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

      <Route path="/m" element={<MobileShell />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<HomePage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="leave" element={<LeavePage />} />
        <Route path="my" element={<MyPage />} />
      </Route>

      <Route path="/__health" element={<HealthPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
