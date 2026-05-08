/**
 * /web/records — own attendance records, cursor-paginated, filterable.
 *
 * Filter by month + status. Clicking a row opens a side drawer with full
 * detail (clock-in/out, total minutes, late flag, location).
 */
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { Button, Card, Sheet, Skeleton } from "@shared/ui";
import { fetchRecord, fetchRecords } from "@entities/attendance";
import type { AttendanceRecord, AttendanceStatus } from "@entities/attendance";

const STATUSES: { value: "ALL" | Exclude<AttendanceStatus, "LIVE">; key: string }[] = [
  { value: "ALL", key: "records.status_all" },
  { value: "OK", key: "records.status_ok" },
  { value: "LATE", key: "records.status_late" },
  { value: "OT", key: "records.status_ot" },
  { value: "OFF", key: "records.status_off" },
];

function thisMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function fmtMinutes(min: number | null): string {
  if (min == null) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

export function WebRecordsPage() {
  const { t } = useTranslation();
  const [month, setMonth] = useState<string>(thisMonth());
  const [status, setStatus] = useState<(typeof STATUSES)[number]["value"]>("ALL");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useInfiniteQuery({
    queryKey: ["records", { month, status }],
    queryFn: ({ pageParam }) =>
      fetchRecords({ month, status, cursor: pageParam ?? null, limit: 20 }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const detail = useQuery({
    queryKey: ["records", "detail", openId],
    queryFn: () => (openId ? fetchRecord(openId) : Promise.resolve(null)),
    enabled: !!openId,
  });

  const rows = useMemo<AttendanceRecord[]>(
    () => (list.data?.pages ?? []).flatMap((p) => p.items),
    [list.data],
  );

  return (
    <div data-testid="web-records" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h1 className="text-[22px] font-bold">{t("records.title")}</h1>
        <div style={{ flex: 1 }} />
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span className="text-[12px]" style={{ color: "var(--grey-500)" }}>
            {t("records.month_filter")}
          </span>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            aria-label={t("records.month_filter")}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid var(--grey-200)",
              fontSize: 13,
            }}
          />
        </label>
        <div style={{ display: "flex", gap: 4 }}>
          {STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatus(s.value)}
              aria-pressed={status === s.value}
              style={{
                padding: "6px 10px",
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 999,
                border: "1px solid var(--grey-200)",
                background: status === s.value ? "var(--brand)" : "var(--white)",
                color: status === s.value ? "var(--white)" : "var(--grey-700)",
                cursor: "pointer",
              }}
            >
              {t(s.key as never)}
            </button>
          ))}
        </div>
      </div>

      <Card padding={0}>
        {list.isLoading ? (
          <div style={{ padding: 20 }}>
            <Skeleton width="100%" height={120} />
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--grey-500)" }}>
            {t("records.empty")}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--grey-50)" }}>
                {[
                  t("records.column_date"),
                  t("records.column_in"),
                  t("records.column_out"),
                  t("records.column_total"),
                  t("records.column_location"),
                  t("records.column_status"),
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 16px",
                      fontSize: 12,
                      color: "var(--grey-500)",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setOpenId(r.id)}
                  data-testid={`record-row-${r.id}`}
                  style={{
                    borderTop: "1px solid var(--grey-100)",
                    cursor: "pointer",
                  }}
                >
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>{r.work_date}</td>
                  <td className="num-tab" style={{ padding: "12px 16px", fontSize: 13 }}>
                    {fmtTime(r.clock_in_at)}
                  </td>
                  <td className="num-tab" style={{ padding: "12px 16px", fontSize: 13 }}>
                    {fmtTime(r.clock_out_at)}
                  </td>
                  <td className="num-tab" style={{ padding: "12px 16px", fontSize: 13 }}>
                    {fmtMinutes(r.total_minutes)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--grey-500)" }}>
                    {r.location_label ?? "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12 }}>
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {list.hasNextPage && (
          <div style={{ padding: 16, display: "flex", justifyContent: "center" }}>
            <Button
              variant="secondary"
              onClick={() => list.fetchNextPage()}
              disabled={list.isFetchingNextPage}
            >
              {t("records.load_more")}
            </Button>
          </div>
        )}
      </Card>

      <Sheet
        open={!!openId}
        onClose={() => setOpenId(null)}
        title={t("records.detail_title")}
      >
        {detail.isLoading || !detail.data ? (
          <Skeleton width="100%" height={120} />
        ) : (
          <DetailBody r={detail.data} />
        )}
        <div style={{ marginTop: 12 }}>
          <Button variant="secondary" fullWidth onClick={() => setOpenId(null)}>
            {t("records.detail_close")}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function DetailBody({ r }: { r: AttendanceRecord }) {
  const { t } = useTranslation();
  const rows: [string, string][] = [
    [t("records.detail_clock_in"), fmtTime(r.clock_in_at)],
    [t("records.detail_clock_out"), fmtTime(r.clock_out_at)],
    [t("records.detail_total"), fmtMinutes(r.total_minutes)],
    [t("records.detail_late"), r.is_late ? "✓" : "—"],
    [t("records.detail_location"), r.location_label ?? "—"],
  ];
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {rows.map(([k, v]) => (
        <li
          key={k}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom: "1px solid var(--grey-100)",
            fontSize: 14,
          }}
        >
          <span style={{ color: "var(--grey-500)" }}>{k}</span>
          <span style={{ fontWeight: 700, color: "var(--grey-900)" }}>{v}</span>
        </li>
      ))}
    </ul>
  );
}

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const map: Record<AttendanceStatus, { c: string; bg: string; key: string }> = {
    LIVE: { c: "var(--success)", bg: "var(--success-soft)", key: "records.status_ok" },
    OK: { c: "var(--grey-700)", bg: "var(--grey-100)", key: "records.status_ok" },
    LATE: { c: "var(--danger)", bg: "var(--danger-soft)", key: "records.status_late" },
    OT: { c: "var(--warn)", bg: "var(--warn-soft)", key: "records.status_ot" },
    OFF: { c: "var(--grey-400)", bg: "var(--grey-100)", key: "records.status_off" },
  };
  const m = map[status];
  const { t } = useTranslation();
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color: m.c,
        background: m.bg,
      }}
    >
      {t(m.key as never)}
    </span>
  );
}
