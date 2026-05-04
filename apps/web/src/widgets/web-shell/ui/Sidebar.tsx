import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, Icon } from "@shared/ui";
import type { IconName } from "@shared/ui";
import type { Breakpoint } from "../model/useViewport";
import { useMe } from "@entities/user";

type Item = { to: string; label: string; icon: IconName; badge?: string };

type Props = {
  bp: Breakpoint;
  onNavigate?: () => void;
};

function isAdminRole(role?: string): boolean {
  return role === "ADMIN" || role === "OWNER";
}

export function Sidebar({ bp, onNavigate }: Props) {
  const { t } = useTranslation();
  const loc = useLocation();
  const me = useMe();
  const role = me.data?.memberships?.[0]?.role;
  const orgName = me.data?.memberships?.[0]?.org_name ?? "Workspace";
  const railMode = bp === "md";

  const items: Item[] = [
    { to: "/web", label: t("web.nav_dashboard"), icon: "home" },
    { to: "/web/inbox", label: t("web.nav_inbox"), icon: "inbox" },
    { to: "/web/team-leave", label: t("web.nav_team_leave"), icon: "calendar" },
    { to: "/web/records", label: t("web.nav_records"), icon: "clock" },
  ];

  return (
    <aside
      data-testid="web-sidebar"
      style={{
        width: railMode ? 56 : 248,
        background: "var(--white)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        borderRight: "1px solid var(--grey-100)",
        height: "100%",
      }}
    >
      <div
        style={{
          padding: railMode ? "16px 8px" : "20px 20px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: railMode ? "center" : undefined,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--r-sm)",
            background: "var(--brand)",
            color: "var(--white)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 15,
            flexShrink: 0,
          }}
          aria-hidden
        >
          {orgName.charAt(0).toUpperCase()}
        </div>
        {!railMode && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="text-[14px] font-bold" style={{ color: "var(--grey-900)" }}>
              {orgName}
            </div>
            <div className="text-[12px]" style={{ color: "var(--grey-500)" }}>
              {t("web.workspace")}
            </div>
          </div>
        )}
      </div>

      <nav
        style={{ padding: railMode ? "8px 4px" : "8px 12px" }}
        aria-label={t("web.primary_nav")}
      >
        {items.map((it) => {
          const active =
            loc.pathname === it.to ||
            (it.to !== "/web" && loc.pathname.startsWith(it.to));
          const IC = Icon[it.icon];
          return (
            <Link
              key={it.to}
              to={it.to}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              style={{
                display: "flex",
                alignItems: "center",
                gap: railMode ? 0 : 12,
                padding: railMode ? "10px 0" : "10px 12px",
                borderRadius: 10,
                marginBottom: 2,
                background: active ? "var(--brand-soft)" : "transparent",
                color: active ? "var(--brand)" : "var(--grey-700)",
                fontSize: 14,
                fontWeight: active ? 700 : 500,
                textDecoration: "none",
                justifyContent: railMode ? "center" : "flex-start",
              }}
              title={railMode ? it.label : undefined}
            >
              <IC width={18} height={18} />
              {!railMode && <span style={{ flex: 1 }}>{it.label}</span>}
            </Link>
          );
        })}

        {isAdminRole(role) && !railMode && (
          <div
            style={{
              marginTop: 16,
              fontSize: 11,
              fontWeight: 700,
              color: "var(--grey-500)",
              padding: "0 12px 6px",
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            {t("web.nav_admin")}
          </div>
        )}
      </nav>

      <div
        style={{
          marginTop: "auto",
          padding: railMode ? 8 : "12px 16px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: railMode ? "center" : undefined,
        }}
      >
        <Avatar name={me.data?.name ?? me.data?.email ?? "?"} size={32} />
        {!railMode && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="text-[13px] font-semibold" style={{ color: "var(--grey-900)" }}>
              {me.data?.name ?? me.data?.email ?? "—"}
            </div>
            <div className="text-[12px]" style={{ color: "var(--grey-500)" }}>
              {role ?? ""}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
