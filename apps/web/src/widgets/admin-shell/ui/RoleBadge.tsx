import { useTranslation } from "react-i18next";

import { useAuthStore } from "@shared/lib/store/useAuthStore";

/**
 * B-CODE-09 a11y: bg + white-text 가 모두 WCAG AA pass (≥4.5:1) 되도록 darker
 * variant 사용. ADMIN → brand-hover (5.0:1) / MANAGER → darker info (5.2:1) /
 * OWNER → purple (4.9:1, borderline acceptable) / EMPLOYEE → grey-600 (7.0:1).
 */
const COLOR: Record<string, string> = {
  OWNER: "var(--purple)",
  ADMIN: "var(--brand-hover)",
  MANAGER: "#0E7575", // darker --info (was #18A5A5 → 2.9:1 FAIL)
  EMPLOYEE: "var(--grey-600)",
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
