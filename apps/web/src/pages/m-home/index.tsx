import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import {
  Avatar,
  Card,
  Icon,
  KPIStat,
  ListRow,
  PageHeader,
  StatRow,
  useToast,
} from "@shared/ui";
import { clockIn, clockOut, readGeoFix, SlideToClockIn } from "@features/clock-in";
import { BreakButton } from "@features/break";
import { TweaksFab } from "@widgets/tweaks-panel";
import type { ClockInBody, ClockKind } from "@entities/attendance";
import { fetchToday } from "@entities/attendance";
import { fetchBalance } from "@entities/leave";
import { fetchTeamGrid } from "@entities/team";

function buildTodayDateLabel(t: (k: string, opts?: Record<string, unknown>) => string): string {
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

function fmtIso(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function fmtMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function HomePage() {
  const { t } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  const [kind] = useState<ClockKind>("OFFICE");
  const [onBreaking, setOnBreaking] = useState(false);

  // F-EMPLOYEE-001: fetch today's attendance on mount to restore clock-in state
  const todayQ = useQuery({
    queryKey: ["attendance", "today"],
    queryFn: fetchToday,
    staleTime: 30_000,
  });

  const todayData = todayQ.data;
  const clockedIn = todayData?.is_clocked_in ?? false;
  const clockInAt = todayData?.clock_in_at ?? null;
  const clockOutAt = todayData?.clock_out_at ?? null;
  const workedMinutes = todayData?.worked_minutes ?? 0;

  const balanceQ = useQuery({
    queryKey: ["leave", "balance"],
    queryFn: () => fetchBalance(),
    staleTime: 60_000,
  });
  const remainingDays =
    balanceQ.data?.remaining !== undefined
      ? String(balanceQ.data.remaining)
      : "—";

  const teamQ = useQuery({
    queryKey: ["team-status", "grid"],
    queryFn: fetchTeamGrid,
    staleTime: 60_000,
  });
  const teamMembers = teamQ.data ?? [];

  // F-EMPLOYEE-002: clock-in mutation — use server response clock_in_at
  const clockInMutation = useMutation({
    mutationFn: async () => {
      let location: ClockInBody["location"];
      try {
        location = await readGeoFix();
      } catch {
        toast.show(t("home.geo_denied"), "danger");
        throw new Error("geo");
      }
      const body: ClockInBody = {
        location,
        kind,
        client_time: new Date().toISOString(),
      };
      return clockIn(body);
    },
    onSuccess: () => {
      // invalidate today query so server-authoritative data is used
      qc.invalidateQueries({ queryKey: ["attendance", "today"] });
      toast.show(t("home.clock_in_success"), "success");
    },
    onError: (err) => {
      if (err instanceof Error && err.message === "geo") return;
      toast.show(t("home.clock_in_failed"), "danger");
    },
  });

  // F-EMPLOYEE-003: clock-out mutation with BE API call
  const clockOutMutation = useMutation({
    mutationFn: clockOut,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance", "today"] });
      toast.show(t("home.clock_out_success"), "success");
    },
    onError: () => toast.show(t("home.clock_out_failed"), "danger"),
  });

  const greeting = clockedIn ? t("home.good_evening") : t("home.good_morning");
  const dateLabel = useMemo(() => buildTodayDateLabel(t), [t]);
  const isMutating = clockInMutation.isPending || clockOutMutation.isPending;

  // Derive regular hours label from server data (fall back to dash)
  const regularLabel = "09–18"; // company schedule — would come from settings eventually

  return (
    <>
      <PageHeader date={dateLabel} title={greeting} hasBadge />
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "4px 20px 16px", background: "var(--grey-50)" }}
      >
        {/* Big stat card */}
        <Card
          padding="24px 20px"
          style={{
            background: clockedIn ? "var(--brand)" : "var(--white)",
            color: clockedIn ? "#fff" : undefined,
          }}
        >
          <div
            className="text-[12px] font-semibold"
            style={{ color: clockedIn ? "rgba(255,255,255,0.85)" : "var(--grey-500)" }}
          >
            {t("home.today_work")}
          </div>
          <div
            className="num-tab text-[40px] font-bold leading-tight mt-2"
            style={{ color: clockedIn ? "#fff" : "var(--grey-900)" }}
          >
            {/* F-EMPLOYEE-012: use real worked_minutes from BE */}
            {clockedIn ? fmtMinutes(workedMinutes) : "—"}
          </div>
          <div className="mt-5">
            <StatRow
              variant={clockedIn ? "inverse" : "default"}
              items={[
                { label: t("home.label_clock_in"), value: fmtIso(clockInAt) },
                { label: t("home.label_clock_out"), value: fmtIso(clockOutAt) },
                { label: t("home.label_regular"), value: regularLabel },
              ]}
            />
          </div>
        </Card>

        {/* Location chip */}
        <Card padding={0} style={{ marginTop: 10 }}>
          <ListRow
            divider={false}
            leading={
              <div
                className="flex items-center justify-center"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--r-md)",
                  background: "var(--brand-soft)",
                  color: "var(--brand)",
                }}
              >
                <Icon.building width={20} height={20} />
              </div>
            }
            title={t("home.at_office")}
            subtitle={`${t("home.location_office_name")} · ${t("home.auto_detected")}`}
            trailing={
              <button
                type="button"
                className="text-[13px] font-semibold"
                style={{
                  background: "transparent",
                  color: "var(--grey-700)",
                  border: "none",
                  padding: "6px 10px",
                  borderRadius: "var(--r-sm)",
                  cursor: "pointer",
                }}
              >
                {t("home.change")}
              </button>
            }
          />
        </Card>

        {/* Slide */}
        <div style={{ marginTop: 14 }}>
          <SlideToClockIn
            onCommit={() => {
              if (clockedIn) {
                // F-EMPLOYEE-003: call BE clock-out API
                clockOutMutation.mutate();
              } else {
                clockInMutation.mutate();
              }
            }}
            disabled={isMutating}
            active={clockedIn}
            labelIn={t("home.slide_in")}
            labelOut={t("home.slide_out")}
          />
        </div>

        {/* F-EMPLOYEE-004: break button when clocked in */}
        {clockedIn && (
          <div style={{ marginTop: 10 }}>
            <BreakButton
              onBreaking={onBreaking}
              onBreakStart={() => setOnBreaking(true)}
              onBreakEnd={() => setOnBreaking(false)}
            />
          </div>
        )}

        {/* Quick stats — F-EMPLOYEE-012: real data from BE */}
        <div className="grid grid-cols-3 gap-2 mt-3.5">
          <Card padding={12}>
            {/* weekly stats not yet available from a separate endpoint — show dash until W4c adds it */}
            <KPIStat label={t("home.week_label")} value="—" unit="h" />
          </Card>
          <Card padding={12}>
            <KPIStat label={t("home.leave_balance")} value={remainingDays} unit={t("leave.days_unit")} />
          </Card>
          <Card padding={12}>
            {/* overtime accumulation not yet available — show dash */}
            <KPIStat label={t("home.overtime_label")} value="—" unit="h" />
          </Card>
        </div>

        {/* Team preview — F-EMPLOYEE-012: real team data from BE */}
        <Card padding={14} style={{ marginTop: 10 }} onClick={() => {}}>
          <div className="flex items-center justify-between">
            <div className="text-[14px] font-semibold text-ink-900">
              {t("home.team_status")}
            </div>
            <Icon.chevR width={16} height={16} style={{ color: "var(--grey-400)" }} />
          </div>
          <div className="flex items-center mt-2.5">
            {teamMembers.slice(0, 7).map((p, i) => (
              <div
                key={p.id}
                style={{ marginLeft: i === 0 ? 0 : -8, position: "relative" }}
              >
                <Avatar name={p.name} size={32} />
                <span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: `var(--s-${p.status})`,
                    border: "2px solid var(--white)",
                  }}
                />
              </div>
            ))}
            {teamMembers.length > 7 && (
              <div
                className="flex items-center justify-center text-[11px] font-bold"
                style={{
                  marginLeft: -8,
                  width: 32,
                  height: 32,
                  borderRadius: "var(--r-lg)",
                  background: "var(--grey-100)",
                  color: "var(--grey-600)",
                }}
              >
                +{teamMembers.length - 7}
              </div>
            )}
            {teamMembers.length === 0 && !teamQ.isLoading && (
              <div className="text-[12px]" style={{ color: "var(--grey-500)" }}>
                {t("home.team_empty")}
              </div>
            )}
          </div>
        </Card>
      </div>
      <TweaksFab />
    </>
  );
}
