import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@shared/ui";
import type { ReactNode } from "react";

type Item = {
  to: string;
  icon: ReactNode;
  label: string;
};

export function AdminNav() {
  const { t } = useTranslation();
  const items: Item[] = [
    { to: "/admin", icon: <Icon.chart width={17} height={17} />, label: t("admin.nav_dashboard") },
    { to: "/admin/approvals", icon: <Icon.inbox width={17} height={17} />, label: t("admin.nav_approvals") },
    { to: "/admin/employees", icon: <Icon.team width={17} height={17} />, label: t("admin.nav_employees") },
    { to: "/admin/expiring-leave", icon: <Icon.bell width={17} height={17} />, label: t("admin.nav_expiring_leave") },
    { to: "/admin/reports", icon: <Icon.calendar width={17} height={17} />, label: t("admin.nav_reports") },
    { to: "/admin/audit", icon: <Icon.clock width={17} height={17} />, label: t("admin.nav_audit") },
    { to: "/admin/codes", icon: <Icon.lock width={17} height={17} />, label: t("admin.nav_codes") },
    { to: "/admin/settings", icon: <Icon.settings width={17} height={17} />, label: t("admin.nav_settings") },
  ];
  return (
    <nav className="mt-2" aria-label={t("admin.nav_dashboard")}>
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.to === "/admin"}
          className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          style={({ isActive }) => ({
            gap: 10,
            padding: 10,
            borderRadius: "var(--r-sm)",
            marginBottom: 2,
            background: isActive ? "var(--grey-900)" : "transparent",
            color: isActive ? "#fff" : "var(--grey-700)",
            fontSize: 13,
            fontWeight: isActive ? 700 : 500,
            textDecoration: "none",
          })}
        >
          {it.icon}
          <span className="flex-1">{it.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
