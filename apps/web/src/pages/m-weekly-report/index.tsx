import { useTranslation } from "react-i18next";
import { Card, KPIStat } from "@shared/ui";
import { SubHeader } from "@widgets/sub-header";

const DAY_KEYS = [
  "common.days_short_mon",
  "common.days_short_tue",
  "common.days_short_wed",
  "common.days_short_thu",
  "common.days_short_fri",
  "common.days_short_sat",
  "common.days_short_sun",
];
const HOURS = [7.8, 9.1, 8.5, 9.4, 8.7, 0, 0];   // demo data

export function WeeklyReportPage() {
  const { t } = useTranslation();
  const DAYS = DAY_KEYS.map((k) => t(k));
  const total = HOURS.reduce((a, b) => a + b, 0);
  const workdays = HOURS.filter((h) => h > 0).length;
  const avg = workdays > 0 ? total / workdays : 0;
  const max = Math.max(...HOURS, 8);
  return (
    <>
      <SubHeader title={t("mobile.weekly.title")} />
      <div
        className="flex-1 overflow-y-auto"
        style={{ background: "var(--grey-50)", padding: "12px 20px 24px" }}
      >
        <div className="grid grid-cols-3 gap-2">
          <Card padding={14}>
            <KPIStat label={t("mobile.weekly.total")} value={total.toFixed(1)} unit="h" />
          </Card>
          <Card padding={14}>
            <KPIStat label={t("mobile.weekly.avg")} value={avg.toFixed(1)} unit="h" />
          </Card>
          <Card padding={14}>
            <KPIStat label={t("mobile.weekly.overtime")} value="2.4" unit="h" />
          </Card>
        </div>
        <Card padding={16} style={{ marginTop: 12 }}>
          <div className="text-[13px] font-semibold mb-3" style={{ color: "var(--grey-700)" }}>
            {t("mobile.weekly.title")}
          </div>
          <div className="flex items-end gap-2" style={{ height: 140 }}>
            {DAYS.map((d, i) => {
              const h = HOURS[i];
              const pct = max > 0 ? (h / max) * 100 : 0;
              return (
                <div key={d} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    style={{
                      width: "100%",
                      height: `${pct}%`,
                      background: h > 0 ? "var(--brand)" : "var(--grey-200)",
                      borderRadius: "var(--r-sm, 6px) var(--r-sm, 6px) 0 0",
                      minHeight: 4,
                    }}
                  />
                  <div className="text-[11px]" style={{ color: "var(--grey-500)" }}>
                    {d}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}
