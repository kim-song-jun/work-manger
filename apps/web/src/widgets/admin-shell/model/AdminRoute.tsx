import type { ReactNode } from "react";
import { RequireAdmin } from "@app/routeGuards";

/**
 * Route guard for /admin/*. Reads role from useAuthStore me.memberships[0].
 * Redirects non-admin to /m/home; redirects unauthenticated to /login.
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  return <RequireAdmin>{children}</RequireAdmin>;
}
