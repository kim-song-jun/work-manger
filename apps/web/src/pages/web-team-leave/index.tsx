/**
 * /web/team-leave — month grid showing whose leave overlaps each day.
 *
 * Header switcher toggles 월(month) / 분기(quarter). Cells are color-coded
 * by absence count; click a cell → side sheet with the names list.
 */
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { Card, Sheet, Skeleton } from "@shared/ui";
import { fetchTeamCalendar } from "@entities/leave";
import type { TeamLeaveDay } from "@entities/leave";

type Mode = "month" | "quarter";

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function fmt(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function buildRange(mode: Mode, anchor: Date): { from: Date; to: Date; cells: Date[] } {
  if (mode === "month") {
    const y = anchor.getFullYear();
    const m = anchor.getMonth();
    const from = new Date(y, m, 1);
    const to = new Date(y, m + 1, 0);
    const cells: Date[] = [];
    for (let i = 1; i <= to.getDate(); i += 1) cells.push(new Date(y, m, i));
    return { from, to, cells };
  }
  // quarter
  const q = Math.floor(anchor.getMonth() / 3);
  const from = new Date(anchor.getFullYear(), q * 3, 1);
  const to = new Date(anchor.getFullYear(), q * 3 + 3, 0);
  const cells: Date[] = [];
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    cells.push(new Date(d));
  }
  return { from, to, cells };
}

export function WebTeamLeavePage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>("month");
  const [anchor] = useState<Date>(new Date());
  const [openDate, setOpenDate] = useState<string | null>(null);

  const range = useMemo(() => buildRange(mode, anchor), [mode, anchor]);

  const cal = useQuery({
    queryKey: ["leave", "team-calendar", { from: fmt(range.from), to: fmt(range.to) }],
    queryFn: () =>
      fetchTeamCalendar({ from: fmt(range.from), to: fmt(range.to) }),
    staleTime: 60_000,
  });

  const byDate = useMemo(() => {
    const m = new Map<string, TeamLeaveDay>();
    for (const d of cal.data?.days ?? []) m.set(d.date, d);
    return m;
  }, [cal.data]);

  const todayKey = fmt(new Date());

  return (
    <div data-testid="web-team-leave" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 className="text-[22px] font-bold">{t("team_leave.title")}</h1>
        <div style={{ flex: 1 }} />
        <div role="tablist" style={{ display: "inline-flex", gap: 4, padding: 4, borderRadius: 10, background: "var(--grey-100)" }}>
          {([
            ["month", t("team_leave.month")],
            ["quarter", t("team_leave.quarter")],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={mode === k}
              onClick={() => setMode(k)}
              style={{
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 8,
                background: mode === k ? "var(--white)" : "transparent",
                color: mode === k ? "var(--grey-900)" : "var(--grey-600)",
                border: "none",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Card padding={20}>
        {cal.isLoading ? (
          <Skeleton width="100%" height={200} />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(range.cells.length, 31)}, minmax(20px, 1fr))`,
              gap: 4,
            }}
          >
            {range.cells.map((d) => {
              const key = fmt(d);
              const day = byDate.get(key);
              const cnt = day?.members.length ?? 0;
              const dow = d.getDay();
              const weekend = dow === 0 || dow === 6;
              const bg = cnt === 0
                ? weekend ? "var(--warn-soft)" : "var(--grey-100)"
                : cnt === 1 ? "var(--brand-soft)"
                : cnt === 2 ? "var(--brand)"
                : "var(--brand-hover)";
              const fg = cnt >= 2 ? "var(--white)" : "var(--grey-900)";
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setOpenDate(key)}
                  data-testid={`leave-cell-${key}`}
                  aria-label={`${key} · ${cnt}`}
                  style={{
                    height: 40,
                    background: bg,
                    color: fg,
                    border: key === todayKey ? "2px solid var(--grey-900)" : "1px solid transparent",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        )}
      </Card>

      <Sheet open={!!openDate} onClose={() => setOpenDate(null)} title={t("team_leave.cell_open")}>
        <div className="text-[13px]" style={{ color: "var(--grey-500)", marginBottom: 8 }}>{openDate}</div>
        {(() => {
          const d = openDate ? byDate.get(openDate) : null;
          if (!d || d.members.length === 0) {
            return <div className="text-[14px]" style={{ color: "var(--grey-500)" }}>{t("team_leave.no_one")}</div>;
          }
          return (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {d.members.map((m) => (
                <li key={m.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--grey-100)" }}>
                  {m.name}
                </li>
              ))}
            </ul>
          );
        })()}
      </Sheet>
    </div>
  );
}
