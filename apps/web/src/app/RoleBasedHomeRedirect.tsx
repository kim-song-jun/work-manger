/**
 * RoleBasedHomeRedirect — F-LIVE-008
 *
 * Reads the user's role from auth store and redirects:
 *   - ADMIN / OWNER  → /admin
 *   - EMPLOYEE / MANAGER → /m/home
 *   - loading (token present, me not yet bootstrapped) → spinner
 *   - unauthenticated → /login
 */
import { Navigate } from "react-router-dom";

import { useAuthStore } from "@shared/lib/store/useAuthStore";

function RouteLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        color: "var(--grey-600)",
        background: "var(--grey-50)",
      }}
    />
  );
}

export function RoleBasedHomeRedirect() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const me = useAuthStore((s) => s.me);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Token present but me not yet bootstrapped — wait
  if (!me) {
    return <RouteLoading />;
  }

  const role = me.memberships?.[0]?.role;

  if (role === "ADMIN" || role === "OWNER") {
    return <Navigate to="/admin" replace />;
  }

  // EMPLOYEE, MANAGER, or any unknown role → mobile home
  return <Navigate to="/m/home" replace />;
}
