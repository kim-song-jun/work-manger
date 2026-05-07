/**
 * /web/team-calendar — matrix view: members × days, color-coded by status.
 *
 * Windowed via slicing only (no extra deps). When members exceed PAGE rows,
 * we render PAGE rows starting at offset and expose prev/next controls.
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, Skeleton } from "@shared/ui";
import { fetchCalendarMatrix } from "@entities/team";
import type { CalendarMatrixStatus } from "@entities/team";

const PAGE = 30;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function fmt(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function colorOf(status: CalendarMatrixStatus): string {
  switch (status) {
    case "office":
      return "var(--s-office)";
    case "wfh":
      return "var(--s-wfh)";
    case "leave":
      return "var(--s-leave)";
    case "break":
      return "var(--s-break)";
    default:
      return "var(--s-off)";
  }
}

export function WebTeamCalendarPage() {
  const { t } = useTranslation();
  const [offset, setOffset] = useState(0);

  const range = useMemo(() => {
    const today = new Date();
    const from = new Date(today);
    from.setDate(today.getDate() - 6);
    return { from: fmt(from), to: fmt(today) };
  }, []);

  const q = useQuery({
    queryKey: ["team-matrix", range],
    queryFn: () => fetchCalendarMatrix({ from: range.from, to: range.to }),
    staleTime: 60_000,
  });

  const rows = q.data?.rows ?? [];
  const visible = rows.slice(offset, offset + PAGE);
  const days = visible[0]?.days ?? [];

  return (
    <div data-testid="web-team-calendar" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 className="text-[22px] font-bold m-0">{t("compliance.matrix_title")}</h1>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
          <Legend label={t("compliance.matrix_legend_office")} color="var(--s-office)" />
          <Legend label={t("compliance.matrix_legend_wfh")} color="var(--s-wfh)" />
          <Legend label={t("compliance.matrix_legend_leave")} color="var(--s-leave)" />
          <Legend label={t("compliance.matrix_legend_break")} color="var(--s-break)" />
          <Legend label={t("compliance.matrix_legend_off")} color="var(--s-off)" />
        </div>
      </div>

      {q.isLoading ? (
        <Card padding={18}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <Skeleton height={20} width="100%" />
            </div>
          ))}
        </Card>
      ) : (
        <Card padding={0}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--grey-50)" }}>
                  <th style={{ ...thStyle, position: "sticky", left: 0, background: "var(--grey-50)" }}>
                    {t("compliance.matrix_member")}
                  </th>
                  {days.map((d) => (
                    <th key={d.date} style={thStyle}>
                      {d.date.slice(5)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 && (
                  <tr>
                    <td
                      colSpan={days.length + 1}
                      style={{ padding: 18, textAlign: "center", color: "var(--grey-500)" }}
                    >
                      {t("compliance.empty")}
                    </td>
                  </tr>
                )}
                {visible.map((row) => (
                  <tr key={row.membership_id} style={{ borderTop: "1px solid var(--grey-100)" }}>
                    <td style={{ ...tdStyle, position: "sticky", left: 0, background: "var(--white)" }}>
                      <div style={{ fontWeight: 600 }}>{row.name}</div>
                      <div style={{ fontSize: 11, color: "var(--grey-500)" }}>
                        {row.department ?? "-"}
                      </div>
                    </td>
                    {row.days.map((d) => (
                      <td key={d.date} style={{ ...tdStyle, padding: 6 }}>
                        <span
                          data-testid={`cell-${row.membership_id}-${d.date}`}
                          data-status={d.status}
                          aria-label={d.status}
                          title={d.status}
                          style={{
                            display: "inline-block",
                            width: 18,
                            height: 18,
                            borderRadius: 6,
                            background: colorOf(d.status),
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > PAGE && (
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", padding: 12 }}>
              <button
                type="button"
                onClick={() => setOffset((o) => Math.max(0, o - PAGE))}
                disabled={offset === 0}
                style={{ minHeight: 32, padding: "6px 10px" }}
              >
                {t("common.prev")}
              </button>
              <button
                type="button"
                onClick={() => setOffset((o) => Math.min(rows.length - PAGE, o + PAGE))}
                disabled={offset + PAGE >= rows.length}
                style={{ minHeight: 32, padding: "6px 10px" }}
              >
                {t("common.next")}
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function Legend({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--grey-700)" }}>
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: 10,
          height: 10,
          borderRadius: 3,
          background: color,
        }}
      />
      {label}
    </span>
  );
}

const thStyle = {
  padding: "8px 10px",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--grey-600)",
  textAlign: "left" as const,
};
const tdStyle = {
  padding: "8px 10px",
  fontSize: 13,
  color: "var(--grey-900)",
};
