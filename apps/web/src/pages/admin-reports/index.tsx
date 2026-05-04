import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button, Card, KPIStat, Skeleton, useToast } from "@shared/ui";
import {
  fetchMonthlyReport,
  type AdminMonthlyReport,
} from "@entities/admin-report";

function defaultMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function toCsv(report: AdminMonthlyReport): string {
  const head = "team,attendance_rate,avg_weekly_hours,avg_overtime_hours";
  const rows = (report.teams ?? []).map((r) =>
    [r.team, r.attendance_rate, r.avg_weekly_hours, r.avg_overtime_hours].join(","),
  );
  return [head, ...rows].join("\n");
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminReportsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [ym, setYm] = useState<string>(defaultMonth());

  const q = useQuery({
    queryKey: ["admin-monthly-report", ym],
    queryFn: () => fetchMonthlyReport(ym),
  });

  const report = useMemo(() => q.data, [q.data]);

  return (
    <div>
      <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-[24px] font-bold m-0">{t("admin.rep_title")}</h1>
        <div className="flex items-end gap-2">
          <div>
            <label className="block text-[13px] text-ink-700 mb-1.5">
              {t("admin.rep_pick_month")}
            </label>
            <input
              type="month"
              aria-label={t("admin.rep_pick_month")}
              value={ym}
              onChange={(e) => setYm(e.target.value)}
              className="h-12 rounded-md bg-ink-100 px-3 text-[15px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="md"
            disabled={!report}
            onClick={() => report && downloadCsv(`report-${ym}.csv`, toCsv(report))}
          >
            {t("admin.rep_export_csv")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => toast.show(t("admin.rep_pdf_todo"))}
          >
            {t("admin.rep_export_pdf")}
          </Button>
        </div>
      </div>

      {q.isLoading ? (
        <Card padding={18}>
          <Skeleton height={20} />
        </Card>
      ) : !report ? (
        <Card padding={20}>
          <div className="text-center text-[14px]" style={{ color: "var(--grey-600)" }}>
            {t("admin.common_loading")}
          </div>
        </Card>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <Card padding={18}>
              <KPIStat label={t("admin.rep_kpi_on_time")} value={report.on_time_rate} unit="%" size="lg" />
            </Card>
            <Card padding={18}>
              <KPIStat label={t("admin.rep_kpi_avg_weekly")} value={report.avg_weekly_hours} unit="h" />
            </Card>
            <Card padding={18}>
              <KPIStat label={t("admin.rep_kpi_total_overtime")} value={report.total_overtime_hours} unit="h" />
            </Card>
            <Card padding={18}>
              <KPIStat label={t("admin.rep_kpi_leave_usage")} value={report.leave_usage_rate} unit="%" />
            </Card>
          </div>

          <Card padding={0} variant="flat" className="mt-4">
            <div style={{ padding: 18, borderBottom: "1px solid var(--grey-200)" }}>
              <b className="text-[15px]">{t("admin.rep_team_table")}</b>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead style={{ background: "var(--grey-50)" }}>
                <tr style={{ textAlign: "left", color: "var(--grey-600)", fontWeight: 600 }}>
                  <th style={{ padding: "12px 16px" }}>{t("admin.rep_col_team")}</th>
                  <th style={{ padding: "12px 16px" }}>{t("admin.rep_col_attendance")}</th>
                  <th style={{ padding: "12px 16px" }}>{t("admin.rep_col_avg_week")}</th>
                  <th style={{ padding: "12px 16px" }}>{t("admin.rep_col_avg_overtime")}</th>
                </tr>
              </thead>
              <tbody>
                {(report.teams ?? []).map((row) => (
                  <tr key={row.team} style={{ borderTop: "1px solid var(--grey-100)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 700 }}>{row.team}</td>
                    <td style={{ padding: "12px 16px" }}>{row.attendance_rate}%</td>
                    <td style={{ padding: "12px 16px" }}>{row.avg_weekly_hours}h</td>
                    <td style={{ padding: "12px 16px" }}>{row.avg_overtime_hours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
