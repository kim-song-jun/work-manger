import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, StatRow, Skeleton } from "@shared/ui";
import { SubHeader } from "@widgets/sub-header";
import { fetchRecord } from "@entities/attendance";

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function RecordDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams<{ id: string }>();
  const q = useQuery({
    queryKey: ["attendance", "record", id],
    queryFn: () => fetchRecord(id),
    enabled: !!id,
  });
  const r = q.data;

  return (
    <>
      <SubHeader title={t("mobile.record.title")} />
      <div
        className="flex-1 overflow-y-auto"
        style={{ background: "var(--grey-50)", padding: "12px 20px 24px" }}
      >
        {q.isLoading && <Skeleton height={120} />}
        {r && (
          <>
            <Card padding={20}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-semibold" style={{ color: "var(--grey-700)" }}>
                  {t("mobile.record.total_work")}
                </span>
                <span
                  className="text-[12px] font-bold"
                  style={{
                    background: "var(--success-soft, #E6F7EE)",
                    color: "var(--success, #00B894)",
                    padding: "3px 8px",
                    borderRadius: "var(--r-xs, 6px)",
                  }}
                >
                  {r.status}
                </span>
              </div>
              <div
                className="text-[32px] font-bold num-tab"
                style={{ color: "var(--grey-900)" }}
              >
                {r.total_minutes != null
                  ? `${Math.floor(r.total_minutes / 60)}h ${r.total_minutes % 60}m`
                  : "—"}
              </div>
              <div className="mt-3">
                <StatRow
                  items={[
                    { label: t("mobile.record.label_in"), value: fmtTime(r.clock_in_at) },
                    { label: t("mobile.record.label_out"), value: fmtTime(r.clock_out_at) },
                    { label: t("mobile.record.label_break"), value: "—" },
                  ]}
                />
              </div>
            </Card>
            <Card padding={14} style={{ marginTop: 12 }}>
              <div className="text-[12px] font-bold mb-1" style={{ color: "var(--grey-500)" }}>
                {t("mobile.record.timeline")}
              </div>
              <div className="text-[13px]" style={{ color: "var(--grey-700)" }}>
                {r.location_label ?? "—"}
              </div>
            </Card>
          </>
        )}
        {!q.isLoading && !r && (
          <Card padding={20}>
            <div className="text-center text-[14px]" style={{ color: "var(--grey-600)" }}>
              {t("records.empty")}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
