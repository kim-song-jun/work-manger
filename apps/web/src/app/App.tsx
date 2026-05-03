import { Route, Routes, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { HealthPage } from "@/pages/HealthPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";

import { MobileShell } from "@/layouts/MobileShell";
import { HomePage } from "@/pages/m/HomePage";
import { TeamPage } from "@/pages/m/TeamPage";
import { LeavePage } from "@/pages/m/LeavePage";
import { MyPage } from "@/pages/m/MyPage";

import { WelcomePage } from "@/pages/onboarding/WelcomePage";
import { CompanyCodePage } from "@/pages/onboarding/CompanyCodePage";
import { ProfilePage } from "@/pages/onboarding/ProfilePage";
import { LocationPage } from "@/pages/onboarding/LocationPage";
import { SchedulePage } from "@/pages/onboarding/SchedulePage";
import { NotificationsPage } from "@/pages/onboarding/NotificationsPage";
import { WidgetPage } from "@/pages/onboarding/WidgetPage";
import { DonePage } from "@/pages/onboarding/DonePage";

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
