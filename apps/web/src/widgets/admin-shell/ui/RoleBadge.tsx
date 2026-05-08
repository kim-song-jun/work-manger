import { useTranslation } from "react-i18next";

import { useAuthStore } from "@shared/lib/store/useAuthStore";

const COLOR: Record<string, string> = {
  OWNER: "var(--purple)",
  ADMIN: "var(--brand)",
  MANAGER: "var(--info)",
  EMPLOYEE: "var(--grey-500)",
};

export function RoleBadge() {
  const { t } = useTranslation();
  const me = useAuthStore((s) => s.me);
  const role = me?.memberships?.[0]?.role ?? "EMPLOYEE";
  const label = t(`admin.role_${role.toLowerCase()}` as const);
  return (
    <span
      data-testid="admin-role-badge"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: "var(--r-pill)",
        fontSize: 12,
        fontWeight: 700,
        color: "#fff",
        background: COLOR[role] ?? "var(--grey-500)",
      }}
    >
      {label}
    </span>
  );
}
