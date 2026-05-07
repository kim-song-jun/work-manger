import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@shared/lib/store/useAuthStore";

function RouteLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        color: "var(--grey-600)",
        background: "var(--grey-50)",
      }}
    >
      Loading
    </div>
  );
}

export function RequireMember({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const me = useAuthStore((s) => s.me);

  if (!accessToken) return <Navigate to="/login" replace />;
  if (!me) return <RouteLoading />;
  if (!me.memberships?.length) return <Navigate to="/onboarding/welcome" replace />;
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const me = useAuthStore((s) => s.me);

  if (!accessToken) return <Navigate to="/login" replace />;
  if (!me) return <RouteLoading />;
  const role = me.memberships?.[0]?.role;
  if (role !== "ADMIN" && role !== "OWNER") {
    return <Navigate to="/m/home" replace />;
  }
  return <>{children}</>;
}
