/**
 * /admin/compliance — ADMIN-only board: company-wide weekly hours table.
 *
 * Sort: hours desc (server-side). This page is read-only until a real
 * messaging endpoint exists.
 */
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, Skeleton } from "@shared/ui";
import { fetchCompanyCompliance } from "@entities/compliance";
import type {
  CompanyComplianceMember,
  ComplianceStatus,
} from "@entities/compliance";

function colorFor(status: ComplianceStatus): string {
  if (status === "OVER") return "var(--danger)";
  if (status === "WARN") return "var(--warn)";
  return "var(--success)";
}

function statusLabel(status: ComplianceStatus, t: (k: string) => string): string {
  if (status === "OVER") return t("compliance.status_over");
  if (status === "WARN") return t("compliance.status_warn");
  return t("compliance.status_ok");
}

export function AdminCompliancePage() {
  const { t } = useTranslation();

  const q = useQuery({
    queryKey: ["admin-compliance"],
    queryFn: () => fetchCompanyCompliance(),
  });

  const members: CompanyComplianceMember[] = q.data?.members ?? [];

  return (
    <div data-testid="admin-compliance">
      <div style={{ marginBottom: 18 }}>
        <h1 className="text-[24px] font-bold m-0">{t("compliance.admin_title")}</h1>
        <div className="text-[13px] mt-1" style={{ color: "var(--grey-600)" }}>
          {t("compliance.admin_sub")}
          {q.data?.week_start ? ` · ${q.data.week_start}` : ""}
        </div>
      </div>

      {q.isLoading ? (
        <Card padding={18}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <Skeleton height={20} width="100%" />
            </div>
          ))}
        </Card>
      ) : (
        <Card padding={0}>
          <table
            data-testid="compliance-table"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr style={{ background: "var(--grey-50)" }}>
                <th style={th}>{t("compliance.col_member")}</th>
                <th style={th}>{t("compliance.col_dept")}</th>
                <th style={{ ...th, textAlign: "right" }}>{t("compliance.col_hours")}</th>
                <th style={{ ...th, textAlign: "center" }}>{t("compliance.col_status")}</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{ padding: 18, textAlign: "center", color: "var(--grey-500)" }}
                  >
                    {t("compliance.empty")}
                  </td>
                </tr>
              )}
              {members.map((m) => (
                <tr key={m.membership_id} style={{ borderTop: "1px solid var(--grey-100)" }}>
                  <td style={td}>{m.name}</td>
                  <td style={td}>{m.department ?? "-"}</td>
                  <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {m.hours} / {m.threshold_hours}
                  </td>
                  <td style={{ ...td, textAlign: "center" }}>
                    <span
                      data-testid={`status-${m.membership_id}`}
                      data-status={m.status}
                      style={{
                        padding: "2px 8px",
                        borderRadius: "var(--r-pill)",
                        background: colorFor(m.status),
                        color: "var(--white)",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {statusLabel(m.status, t)}
                    </span>
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

const th = {
  padding: "10px 12px",
  fontSize: 12,
  textAlign: "left" as const,
  color: "var(--grey-600)",
  fontWeight: 600,
};
const td = { padding: "10px 12px", fontSize: 14, color: "var(--grey-900)" };
