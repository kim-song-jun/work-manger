import { Navigate } from "react-router-dom";

import { LoginForm } from "@features/auth";
import { useMe } from "@entities/user";

export function LoginPage() {
  // F-LIVE-003: redirect away from login if already authenticated
  const me = useMe();
  if (me.data) {
    // Already authenticated — send to role-appropriate home
    const role = me.data.memberships?.[0]?.role;
    const dest = role === "ADMIN" || role === "OWNER" ? "/admin/dashboard" : "/m/home";
    return <Navigate to={dest} replace />;
  }
  return <LoginForm />;
}
