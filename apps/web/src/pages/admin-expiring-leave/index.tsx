import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Card, Skeleton } from "@shared/ui";
import { fetchExpiringLeave } from "@entities/leave";

const EXPIRING_DAYS = 30;

export function AdminExpiringLeavePage() {
  const { t } = useTranslation();
  const q = useQuery({
    queryKey: ["admin-leave-expiring"],
    queryFn: () => fetchExpiringLeave(),
    staleTime: 60_000,
  });

  const rows = q.data ?? [];
  const loading = q.isLoading;

  return (
    <div>
      <h1 className="text-[24px] font-bold m-0 mb-1">{t("admin.expiring_title")}</h1>
      <div className="text-[13px] mb-3" style={{ color: "var(--grey-600)" }}>
        {t("admin.expiring_sub", { days: EXPIRING_DAYS })}
      </div>
      {loading ? (
        <Card padding={18}>
          <Skeleton height={20} />
        </Card>
      ) : rows.length === 0 ? (
        <Card padding={20}>
          <div className="text-center text-[14px]" style={{ color: "var(--grey-600)" }}>
            {t("admin.expiring_empty")}
          </div>
        </Card>
      ) : (
        <Card padding={0} variant="flat">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead style={{ background: "var(--grey-50)" }}>
              <tr style={{ textAlign: "left", color: "var(--grey-600)", fontWeight: 600 }}>
                <th style={{ padding: "12px 16px" }}>{t("admin.expiring_col_employee")}</th>
                <th style={{ padding: "12px 16px" }}>{t("admin.emp_col_team")}</th>
                <th style={{ padding: "12px 16px" }}>{t("admin.expiring_col_remaining")}</th>
                <th style={{ padding: "12px 16px" }}>{t("admin.expiring_col_expiring")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.membershipId} style={{ borderTop: "1px solid var(--grey-100)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 700 }}>{r.name}</td>
                  <td style={{ padding: "12px 16px" }}>{r.department ?? "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {r.remaining} {t("leave.days_unit")}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--warn)", fontWeight: 700 }}>
                    {r.expiring} {t("leave.days_unit")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
