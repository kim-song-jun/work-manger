import { useQuery, useQueries } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Card, Skeleton } from "@shared/ui";
import { fetchEmployees } from "@entities/employee";
import { fetchBalance, type LeaveBalance } from "@entities/leave";

const EXPIRING_DAYS = 30;
const MAX_FANOUT = 50;

type EmpBalance = { id: string; name: string; team?: string | null; balance: LeaveBalance | null };

async function fetchBalanceFor(employeeId: string): Promise<LeaveBalance | null> {
  return fetchBalance({ employeeId });
}

export function AdminExpiringLeavePage() {
  const { t } = useTranslation();
  const employeesQ = useQuery({
    queryKey: ["admin-employees", "all"],
    queryFn: () => fetchEmployees({}),
  });

  const employees = (employeesQ.data ?? []).slice(0, MAX_FANOUT);

  const balances = useQueries({
    queries: employees.map((e) => ({
      queryKey: ["leave-balance-for", e.id],
      queryFn: () => fetchBalanceFor(e.id),
      enabled: !!e.id,
      staleTime: 60_000,
    })),
  });

  const rows: EmpBalance[] = employees.map((e, i) => ({
    id: e.id,
    name: e.name,
    team: e.team,
    balance: balances[i]?.data ?? null,
  }));

  const expiring = rows
    .filter((r) => (r.balance?.expiring ?? 0) > 0)
    .sort((a, b) => (b.balance?.expiring ?? 0) - (a.balance?.expiring ?? 0));

  const loading = employeesQ.isLoading || balances.some((b) => b.isLoading);

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
      ) : expiring.length === 0 ? (
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
              {expiring.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid var(--grey-100)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 700 }}>{r.name}</td>
                  <td style={{ padding: "12px 16px" }}>{r.team ?? "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {r.balance?.remaining ?? 0} {t("leave.days_unit")}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--warn)", fontWeight: 700 }}>
                    {r.balance?.expiring ?? 0} {t("leave.days_unit")}
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
