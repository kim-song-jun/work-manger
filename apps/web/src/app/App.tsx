import { Route, Routes, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { HealthPage } from "@/pages/HealthPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/__health" element={<HealthPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
