import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/m/home", replace: true }) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/signup", element: _jsx(SignupPage, {}) }), _jsx(Route, { path: "/forgot", element: _jsx(ForgotPasswordPage, {}) }), _jsxs(Route, { path: "/onboarding", children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "welcome", replace: true }) }), _jsx(Route, { path: "welcome", element: _jsx(WelcomePage, {}) }), _jsx(Route, { path: "company-code", element: _jsx(CompanyCodePage, {}) }), _jsx(Route, { path: "profile", element: _jsx(ProfilePage, {}) }), _jsx(Route, { path: "location", element: _jsx(LocationPage, {}) }), _jsx(Route, { path: "schedule", element: _jsx(SchedulePage, {}) }), _jsx(Route, { path: "notifications", element: _jsx(NotificationsPage, {}) }), _jsx(Route, { path: "widget", element: _jsx(WidgetPage, {}) }), _jsx(Route, { path: "done", element: _jsx(DonePage, {}) })] }), _jsxs(Route, { path: "/m", element: _jsx(MobileShell, {}), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "home", replace: true }) }), _jsx(Route, { path: "home", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "team", element: _jsx(TeamPage, {}) }), _jsx(Route, { path: "leave", element: _jsx(LeavePage, {}) }), _jsx(Route, { path: "my", element: _jsx(MyPage, {}) })] }), _jsx(Route, { path: "/__health", element: _jsx(HealthPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/login", replace: true }) })] }));
}
