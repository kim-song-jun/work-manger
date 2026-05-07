/**
 * /web — desktop dashboard
 *
 * Hero KPIs (today / accumulated / leave) + team preview + recent records +
 * pending inbox. The app-level provider owns realtime subscriptions.
 */
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Card, Skeleton, StatusDot } from "@shared/ui";
import { fetchToday, fetchRecords } from "@entities/attendance";
import type { AttendanceRecord, AttendanceToday } from "@entities/attendance";
import { fetchBalance } from "@entities/leave";
import type { LeaveBalance } from "@entities/leave";
import { fetchTeam } from "@entities/team";
import type { TeamMember } from "@entities/team";
import { fetchInbox } from "@entities/inbox";
import type { InboxList } from "@entities/inbox";
import { formatTime, formatMinutes, formatDateLabel } from "./format";

export function WebDashboardPage() {
  const { t } = useTranslation();

  const today = useQuery<AttendanceToday | null>({
    queryKey: ["attendance", "today"],
    queryFn: fetchToday,
    staleTime: 30_000,
  });
  const balance = useQuery<LeaveBalance | null>({
    queryKey: ["leave", "balance"],
    queryFn: () => fetchBalance(),
    staleTime: 60_000,
  });
  const team = useQuery<TeamMember[] | null>({
    queryKey: ["team", "preview"],
    queryFn: fetchTeam,
    staleTime: 30_000,
  });
  const records = useQuery({
    queryKey: ["records", "recent"],
    queryFn: () => fetchRecords({ limit: 7 }),
    staleTime: 30_000,
  });
  const inbox = useQuery<InboxList>({
    queryKey: ["inbox", { scope: "me", status: "PENDING" }],
    queryFn: () => fetchInbox({ status: "PENDING", limit: 5 }),
    staleTime: 15_000,
  });

  const loading = today.isLoading || balance.isLoading;

  return (
    <div
      data-testid="web-dashboard"
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      {/* KPI hero */}
      <section aria-label={t("web.today_kpi")}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          <KpiCard
            label={t("web.clock_in_at")}
            value={
              loading ? null : today.data?.clock_in_at ? formatTime(today.data.clock_in_at) : "—"
            }
          />
          <KpiCard
            label={t("web.cum_work")}
            value={loading ? null : formatMinutes(today.data?.worked_minutes ?? 0)}
          />
          <KpiCard
            label={t("web.leave_remaining")}
            value={
              loading
                ? null
                : balance.data
                  ? `${balance.data.remaining}${t("leave.days_unit")}`
                  : "—"
            }
          />
        </div>
      </section>

      {/* Team preview */}
      <Card padding={20}>
        <SectionHead title={t("web.team_preview")} />
        {team.isLoading ? (
          <Skeleton width="100%" height={56} />
        ) : (team.data ?? []).length === 0 ? (
          <div className="text-[14px]" style={{ color: "var(--grey-500)" }}>
            {t("team.empty")}
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {(team.data ?? []).slice(0, 8).map((m) => (
              <div
                key={m.id}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
                data-testid="team-member"
              >
                <Avatar name={m.name} size={32} />
                <div>
                  <div className="text-[13px] font-semibold">{m.name}</div>
                  <div
                    className="text-[12px]"
                    style={{ color: "var(--grey-500)", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <StatusDot status={m.status} />
                    {m.team ?? ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent records + pending inbox */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 20,
        }}
      >
        <Card padding={0}>
          <div style={{ padding: 20 }}>
            <SectionHead title={t("web.recent_records")} />
          </div>
          <RecentTable rows={records.data?.items ?? []} loading={records.isLoading} />
        </Card>

        <Card padding={20}>
          <SectionHead title={t("web.pending_inbox")} />
          {inbox.isLoading ? (
            <Skeleton width="100%" height={64} />
          ) : (inbox.data?.items ?? []).length === 0 ? (
            <div style={{ color: "var(--grey-500)", fontSize: 14 }}>
              {t("inbox.empty_list")}
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {(inbox.data?.items ?? []).slice(0, 5).map((it) => (
                <li
                  key={it.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid var(--grey-100)",
                  }}
                >
                  <Avatar
                    name={it.requester?.name ?? it.requester_name ?? "?"}
                    size={32}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-[13px] font-semibold">
                      {it.title ?? it.target_type ?? ""}
                    </div>
                    <div className="text-[12px]" style={{ color: "var(--grey-500)" }}>
                      {it.requester?.name ?? it.requester_name ?? ""}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function SectionHead({ title }: { title: string }) {
  return (
    <div
      style={{
        fontSize: 16,
        fontWeight: 700,
        color: "var(--grey-900)",
        marginBottom: 12,
      }}
    >
      {title}
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string | null }) {
  return (
    <Card padding={20}>
      <div className="text-[13px]" style={{ color: "var(--grey-500)", fontWeight: 600 }}>
        {label}
      </div>
      <div
        className="num-tab"
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: "var(--grey-900)",
          marginTop: 8,
          minHeight: 40,
        }}
      >
        {value ?? <Skeleton width={120} height={32} />}
      </div>
    </Card>
  );
}

function RecentTable({ rows, loading }: { rows: AttendanceRecord[]; loading: boolean }) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <Skeleton width="100%" height={120} />
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div style={{ padding: 20, color: "var(--grey-500)", fontSize: 14 }}>
        {t("records.empty")}
      </div>
    );
  }
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "var(--grey-50)" }}>
          {[t("records.column_date"), t("records.column_in"), t("records.column_out"), t("records.column_total")].map((h) => (
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
        {rows.slice(0, 7).map((r) => (
          <tr key={r.id} style={{ borderTop: "1px solid var(--grey-100)" }}>
            <td style={{ padding: "12px 16px", fontSize: 13 }}>{formatDateLabel(r.work_date)}</td>
            <td className="num-tab" style={{ padding: "12px 16px", fontSize: 13 }}>
              {r.clock_in_at ? formatTime(r.clock_in_at) : "—"}
            </td>
            <td className="num-tab" style={{ padding: "12px 16px", fontSize: 13 }}>
              {r.clock_out_at ? formatTime(r.clock_out_at) : "—"}
            </td>
            <td className="num-tab" style={{ padding: "12px 16px", fontSize: 13 }}>
              {r.total_minutes != null ? formatMinutes(r.total_minutes) : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
