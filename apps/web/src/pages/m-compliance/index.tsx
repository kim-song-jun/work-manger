/**
 * /m/compliance — mobile screen showing this week's 52h status.
 *
 * - Color-coded progress bar (success / warn / danger) per status (OK/WARN/OVER).
 * - Lists current vs threshold and remaining hours.
 */
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Card, KPIStat, PageHeader, Skeleton } from "@shared/ui";
import { fetchMyCompliance } from "@entities/compliance";
import type { ComplianceStatus } from "@entities/compliance";

function statusColor(status: ComplianceStatus | undefined): string {
  if (status === "OVER") return "var(--danger)";
  if (status === "WARN") return "var(--warn)";
  return "var(--success)";
}

function statusLabel(status: ComplianceStatus | undefined, t: (k: string) => string) {
  if (status === "OVER") return t("compliance.status_over");
  if (status === "WARN") return t("compliance.status_warn");
  return t("compliance.status_ok");
}

export function ComplianceMobilePage() {
  const { t } = useTranslation();
  const q = useQuery({
    queryKey: ["compliance-me"],
    queryFn: () => fetchMyCompliance(),
  });

  const data = q.data;
  const hours = data ? Number(data.hours) : 0;
  const threshold = data ? Number(data.threshold_hours) : 52;
  const ratio = Math.min(1, threshold > 0 ? hours / threshold : 0);
  const color = statusColor(data?.status);

  return (
    <>
      <PageHeader title={t("compliance.title")} />
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "8px 20px 24px" }}
        data-testid="m-compliance"
      >
        {q.isLoading && (
          <Card padding={18}>
            <Skeleton height={14} width="60%" />
            <div className="mt-2">
              <Skeleton height={28} width="40%" />
            </div>
            <div className="mt-3">
              <Skeleton height={10} width="100%" />
            </div>
          </Card>
        )}

        {!q.isLoading && data && (
          <Card padding={18} data-testid="compliance-card">
            <div
              className="text-[13px]"
              style={{ color: "var(--grey-600)" }}
            >
              {t("compliance.sub")}
            </div>
            <div
              data-testid="compliance-status-pill"
              data-status={data.status}
              style={{
                display: "inline-block",
                marginTop: 8,
                padding: "4px 10px",
                borderRadius: "var(--r-pill)",
                background: color,
                color: "var(--white)",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {statusLabel(data.status, t)}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 12,
              }}
            >
              <KPIStat
                label={t("compliance.current")}
                value={Number(data.hours)}
                unit={t("compliance.hours_unit")}
                size="lg"
              />
              <KPIStat
                label={t("compliance.remaining")}
                value={Number(data.remaining_hours)}
                unit={t("compliance.hours_unit")}
                color={color}
              />
            </div>

            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={threshold}
              aria-valuenow={hours}
              data-testid="compliance-progress"
              style={{
                marginTop: 12,
                height: 10,
                borderRadius: "var(--r-pill)",
                background: "var(--grey-100)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${ratio * 100}%`,
                  height: "100%",
                  background: color,
                  transition: "width 200ms ease",
                }}
              />
            </div>
            <div
              className="text-[12px] mt-2"
              style={{ color: "var(--grey-500)" }}
            >
              {t("compliance.threshold")}: {threshold}
              {t("compliance.hours_unit")} · {t("compliance.week_label", { week: data.week_start })}
            </div>
          </Card>
        )}

        {!q.isLoading && !data && (
          <Card padding={18}>
            <div style={{ color: "var(--grey-600)" }}>{t("compliance.empty")}</div>
          </Card>
        )}
      </div>
    </>
  );
}
