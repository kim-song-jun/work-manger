import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, KPIStat, Skeleton } from "@shared/ui";
import { fetchAdminDashboard } from "@entities/admin-dashboard";

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const q = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchAdminDashboard,
  });

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h1 className="text-[24px] font-bold m-0">{t("admin.dash_title")}</h1>
        <div className="text-[13px] mt-1" style={{ color: "var(--grey-600)" }}>
          {t("admin.dash_sub")}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginTop: 12,
        }}
      >
        {q.isLoading
          ? [0, 1, 2, 3].map((i) => (
              <Card key={i} padding={18}>
                <Skeleton height={14} width="50%" />
                <div className="mt-2">
                  <Skeleton height={28} width="60%" />
                </div>
              </Card>
            ))
          : (
            <>
              <Card padding={18}>
                <KPIStat
                  label={t("admin.kpi_attendance_rate")}
                  value={q.data?.attendance_rate ?? 0}
                  unit="%"
                  size="lg"
                />
              </Card>
              <Card padding={18}>
                <KPIStat
                  label={t("admin.kpi_absent")}
                  value={q.data?.absent_count ?? 0}
                  color="var(--danger)"
                />
              </Card>
              <Card padding={18}>
                <KPIStat
                  label={t("admin.kpi_pending_approvals")}
                  value={q.data?.pending_approvals ?? 0}
                  color="var(--warn)"
                />
              </Card>
              <Card padding={18}>
                <KPIStat
                  label={t("admin.kpi_ongoing_overtime")}
                  value={q.data?.ongoing_overtime ?? 0}
                />
              </Card>
            </>
          )}
      </div>

      <h2 className="text-[15px] font-bold mt-7 mb-3">
        {t("admin.quick_actions")}
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        {[
          { to: "/admin/approvals", label: t("admin.qa_review_approvals") },
          { to: "/admin/employees", label: t("admin.qa_view_employees") },
          { to: "/admin/reports", label: t("admin.qa_open_reports") },
          { to: "/admin/codes", label: t("admin.qa_issue_code") },
        ].map((it) => (
          <Link
            key={it.to}
            to={it.to}
            style={{
              display: "block",
              padding: 18,
              background: "var(--white)",
              borderRadius: "var(--r-md)",
              boxShadow: "var(--shadow-1)",
              textDecoration: "none",
              color: "var(--grey-900)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {it.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
