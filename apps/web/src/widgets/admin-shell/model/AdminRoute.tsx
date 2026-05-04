import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@shared/lib/store/useAuthStore";

/**
 * Route guard for /admin/*. Reads role from useAuthStore me.memberships[0].
 * Redirects non-admin to /m/home; redirects unauthenticated to /login.
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const me = useAuthStore((s) => s.me);
  const isAuthed = useAuthStore((s) => s.isAuthenticated());
  if (!isAuthed) return <Navigate to="/login" replace />;
  const role = me?.memberships?.[0]?.role;
  if (role !== "ADMIN" && role !== "OWNER") {
    return <Navigate to="/m/home" replace />;
  }
  return <>{children}</>;
}
