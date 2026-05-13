import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Card, Icon, KPIStat, Skeleton } from "@shared/ui";
import { fetchAdminDashboard } from "@entities/admin-dashboard";

import "./styles.css";

function buildDateLabel(t: (k: string, opts?: Record<string, unknown>) => string): string {
  const d = new Date();
  const dayKeys = [
    "common.days_short_sun",
    "common.days_short_mon",
    "common.days_short_tue",
    "common.days_short_wed",
    "common.days_short_thu",
    "common.days_short_fri",
    "common.days_short_sat",
  ];
  return t("common.weekday_month_day", {
    weekday: t(dayKeys[d.getDay()]),
    month: d.getMonth() + 1,
    day: d.getDate(),
  });
}

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const q = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchAdminDashboard,
  });

  const dateLabel = buildDateLabel(t);
  const pendingCount = q.data?.pending_approvals ?? 0;
  const absentCount = q.data?.absent_count ?? 0;
  const ongoingOt = q.data?.ongoing_overtime ?? 0;
  const attendanceRate = q.data?.attendance_rate ?? 0;
  // Polish: 임계 시각화. 5 이상 pending or absent → urgent pulse.
  const pendingUrgent = pendingCount >= 5;
  const absentUrgent = absentCount >= 3;

  return (
    <div className="wm-admin-dash">
      <header className="wm-admin-dash-header">
        <div>
          <h1 className="wm-admin-dash-title">{t("admin.dash_title")}</h1>
          <div className="wm-admin-dash-sub">
            <span>{dateLabel}</span>
            <span className="wm-admin-dash-divider" aria-hidden="true">·</span>
            <span>{t("admin.dash_sub")}</span>
          </div>
        </div>
      </header>

      {/* Hero KPI row — attendance_rate 가 headline. 6/12 col, 나머지 2/12씩. */}
      <section className="wm-admin-dash-kpi-grid wm-admin-dash-anim" data-loading={q.isLoading ? "true" : "false"}>
        {q.isLoading ? (
          <>
            <Card padding={20} className="wm-admin-dash-hero">
              <Skeleton height={14} width="40%" />
              <div className="mt-3">
                <Skeleton height={44} width="50%" />
              </div>
            </Card>
            {[0, 1, 2].map((i) => (
              <Card key={i} padding={16}>
                <Skeleton height={12} width="60%" />
                <div className="mt-2">
                  <Skeleton height={26} width="40%" />
                </div>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card padding={20} className="wm-admin-dash-hero">
              <div className="wm-admin-dash-hero-label">{t("admin.kpi_attendance_rate")}</div>
              <div className="wm-admin-dash-hero-value num-tab">
                {attendanceRate}
                <span className="wm-admin-dash-hero-unit">%</span>
              </div>
              <div
                className="wm-admin-dash-hero-bar"
                style={{ width: `${Math.min(100, attendanceRate)}%` }}
                role="progressbar"
                aria-valuenow={attendanceRate}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </Card>

            <Card padding={16} className="wm-admin-dash-kpi" data-urgent={absentUrgent ? "true" : "false"}>
              <div className="wm-admin-dash-kpi-header">
                <span>{t("admin.kpi_absent")}</span>
                {absentUrgent && <span className="wm-admin-dash-pulse" aria-hidden="true" />}
              </div>
              <KPIStat
                label=""
                value={absentCount}
                color={absentUrgent ? "var(--danger)" : undefined}
              />
            </Card>

            <Card padding={16} className="wm-admin-dash-kpi" data-urgent={pendingUrgent ? "true" : "false"}>
              <div className="wm-admin-dash-kpi-header">
                <span>{t("admin.kpi_pending_approvals")}</span>
                {pendingUrgent && <span className="wm-admin-dash-pulse" aria-hidden="true" />}
              </div>
              <KPIStat
                label=""
                value={pendingCount}
                color={pendingUrgent ? "var(--warn)" : undefined}
              />
            </Card>

            <Card padding={16} className="wm-admin-dash-kpi">
              <div className="wm-admin-dash-kpi-header">
                <span>{t("admin.kpi_ongoing_overtime")}</span>
              </div>
              <KPIStat label="" value={ongoingOt} />
            </Card>
          </>
        )}
      </section>

      <h2 className="wm-admin-dash-section-title">{t("admin.quick_actions")}</h2>
      <div className="wm-admin-dash-quick-grid">
        {[
          {
            to: "/admin/approvals",
            label: t("admin.qa_review_approvals"),
            icon: Icon.bell,
            urgent: pendingUrgent,
          },
          {
            to: "/admin/employees",
            label: t("admin.qa_view_employees"),
            icon: Icon.user,
            urgent: false,
          },
          {
            to: "/admin/reports",
            label: t("admin.qa_open_reports"),
            icon: Icon.chart,
            urgent: false,
          },
          {
            to: "/admin/codes",
            label: t("admin.qa_issue_code"),
            icon: Icon.lock,
            urgent: false,
          },
        ].map((it) => {
          const IconEl = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className="wm-admin-dash-quick"
              data-urgent={it.urgent ? "true" : "false"}
            >
              <div className="wm-admin-dash-quick-icon">
                {IconEl ? <IconEl width={20} height={20} /> : null}
              </div>
              <span className="wm-admin-dash-quick-label">{it.label}</span>
              <Icon.chevR width={16} height={16} className="wm-admin-dash-quick-arrow" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
