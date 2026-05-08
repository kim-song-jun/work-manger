import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuthStore } from "@shared/lib/store/useAuthStore";

import { AdminNav } from "./AdminNav";
import { RoleBadge } from "./RoleBadge";

/** Desktop admin shell — sidebar nav + header with role badge. */
export function AdminShell() {
  const { t } = useTranslation();
  const me = useAuthStore((s) => s.me);
  const orgName = me?.memberships?.[0]?.company?.name ?? "Workspace";
  return (
    <div
      className="min-h-screen w-full flex"
      style={{ background: "var(--grey-100)", color: "var(--grey-900)" }}
    >
      <aside
        style={{
          width: 220,
          borderRight: "1px solid var(--grey-200)",
          background: "var(--white)",
          padding: "18px 14px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px 6px" }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "var(--r-sm)",
              background: "var(--grey-900)",
              color: "var(--white)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            W
          </div>
          <div>
            <div className="text-[14px] font-bold">{t("app.title")}</div>
            <div className="text-[10px]" style={{ color: "var(--grey-500)" }}>
              {t("admin.nav_dashboard")}
            </div>
          </div>
        </div>
        <div
          style={{
            padding: "10px 8px",
            borderRadius: "var(--r-sm)",
            background: "var(--grey-50)",
            marginTop: 12,
            fontSize: 12,
          }}
        >
          <div style={{ color: "var(--grey-500)" }}>Org</div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{orgName}</div>
        </div>
        <AdminNav />
      </aside>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 10,
            padding: "12px 28px",
            background: "var(--white)",
            borderBottom: "1px solid var(--grey-200)",
          }}
        >
          <RoleBadge />
        </header>
        <main id="main" style={{ flex: 1, overflow: "auto", padding: 28, minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
