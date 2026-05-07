import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, Card, Skeleton, TextField } from "@shared/ui";
import {
  fetchEmployees,
  type Employee,
  type EmployeeRole,
} from "@entities/employee";

const ROLE_OPTIONS: ("ALL" | EmployeeRole)[] = [
  "ALL",
  "EMPLOYEE",
  "MANAGER",
  "ADMIN",
  "OWNER",
];

export function AdminEmployeesPage() {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"ALL" | EmployeeRole>("ALL");

  const query = useQuery({
    queryKey: ["admin-employees", q, role],
    queryFn: () => fetchEmployees({ q, role }),
  });

  const rows: Employee[] = useMemo(() => query.data ?? [], [query.data]);

  return (
    <div>
      <h1 className="text-[24px] font-bold m-0 mb-4">{t("admin.emp_title")}</h1>

      <div className="flex items-end gap-3 mb-4" style={{ maxWidth: 720 }}>
        <div style={{ flex: 1 }}>
          <TextField
            label={t("admin.emp_search_placeholder")}
            placeholder={t("admin.emp_search_placeholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-ink-700 mb-1.5">
            {t("admin.emp_col_role")}
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "ALL" | EmployeeRole)}
            className="block h-12 rounded-md bg-ink-100 px-3 text-[15px] text-ink-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r === "ALL"
                  ? t("admin.emp_role_all")
                  : t(`admin.role_${r.toLowerCase()}` as const)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {query.isLoading ? (
        <Card padding={18}>
          <Skeleton height={20} />
        </Card>
      ) : rows.length === 0 ? (
        <Card padding={20}>
          <div className="text-center text-[14px]" style={{ color: "var(--grey-600)" }}>
            {t("admin.emp_empty")}
          </div>
        </Card>
      ) : (
        <Card padding={0} variant="flat">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead style={{ background: "var(--grey-50)" }}>
              <tr style={{ textAlign: "left", color: "var(--grey-600)", fontWeight: 600 }}>
                <th style={{ padding: "12px 16px" }}>{t("admin.emp_col_employee")}</th>
                <th style={{ padding: "12px 16px" }}>{t("admin.emp_col_role")}</th>
                <th style={{ padding: "12px 16px" }}>{t("admin.emp_col_team")}</th>
                <th style={{ padding: "12px 16px" }}>{t("admin.emp_col_position")}</th>
                <th style={{ padding: "12px 16px" }}>{t("admin.emp_col_status")}</th>
                <th style={{ padding: "12px 16px" }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((emp) => (
                <tr key={emp.id} style={{ borderTop: "1px solid var(--grey-100)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <Link
                      to={`/admin/employees/${emp.id}`}
                      style={{ display: "flex", gap: 10, alignItems: "center", color: "inherit", textDecoration: "none" }}
                    >
                      <Avatar name={emp.name} size={32} />
                      <div>
                        <div className="font-bold">{emp.name}</div>
                        <div className="text-[12px]" style={{ color: "var(--grey-500)" }}>
                          {emp.email}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {t(`admin.role_${emp.role.toLowerCase()}` as const)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>{emp.team ?? "—"}</td>
                  <td style={{ padding: "12px 16px" }}>{emp.position ?? "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "var(--r-pill)",
                        fontSize: 12,
                        fontWeight: 700,
                        background:
                          emp.active === false ? "var(--grey-200)" : "var(--success-soft)",
                        color:
                          emp.active === false ? "var(--grey-600)" : "var(--success)",
                      }}
                    >
                      {emp.active === false
                        ? t("admin.emp_status_inactive")
                        : t("admin.emp_status_active")}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <Link
                      to={`/admin/employees/${emp.id}`}
                      aria-label={`${emp.name} ${t("admin.emp_detail_overview")}`}
                      style={{
                        color: "var(--brand)",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 32,
                        height: 32,
                        textDecoration: "none",
                      }}
                    >
                      →
                    </Link>
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
