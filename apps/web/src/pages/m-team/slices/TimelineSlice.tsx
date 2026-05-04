import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Avatar, Card, Skeleton } from "@shared/ui";
import { fetchTeamTimeline } from "@entities/team";
import type { TeamTimeline, TeamTimelineKind } from "@entities/team";

function buildFallback(t: (k: string) => string): TeamTimeline {
  return {
    now_minute: 924, // 15:24
    rows: [
      {
        member: {
          id: "1",
          name: t("mobile.team_demo.member_jiwoo"),
          status: "office",
          team: t("mobile.team_demo.team_design"),
        },
        blocks: [
          { start_minute: 510, end_minute: 720, kind: "office" },
          { start_minute: 720, end_minute: 780, kind: "break" },
          { start_minute: 780, end_minute: 1080, kind: "office" },
        ],
      },
      {
        member: {
          id: "2",
          name: t("mobile.team_demo.member_minsoo"),
          status: "wfh",
        },
        blocks: [{ start_minute: 540, end_minute: 1080, kind: "wfh" }],
      },
    ],
  };
}

const KIND_BG: Record<TeamTimelineKind, string> = {
  office: "var(--s-office, #00B894)",
  wfh: "var(--s-wfh, #3182F6)",
  break: "var(--s-break, #FFB300)",
  leave: "var(--s-leave, #FF7373)",
};

export function TimelineSlice() {
  const { t } = useTranslation();
  const q = useQuery({
    queryKey: ["team-status", "timeline"],
    queryFn: fetchTeamTimeline,
  });
  if (q.isLoading) return <Skeleton height={120} />;
  const data = q.data ?? buildFallback(t);
  if (!data.rows.length) return <Card padding={20}>—</Card>;
  const totalMin = 1440;
  return (
    <Card padding={14}>
      <div style={{ position: "relative", paddingLeft: 64 }}>
        <div
          style={{
            position: "relative",
            height: 16,
            fontSize: 10,
            color: "var(--grey-500)",
          }}
        >
          {[6, 9, 12, 15, 18, 21].map((h) => (
            <span
              key={h}
              style={{
                position: "absolute",
                left: `${((h * 60) / totalMin) * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              {h}
            </span>
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: `${(data.now_minute / totalMin) * 100}%`,
              top: -2,
              bottom: 0,
              width: 2,
              background: "var(--brand)",
              zIndex: 2,
            }}
          />
          {data.rows.map((row) => (
            <div
              key={row.member.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
                height: 24,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: -64,
                  width: 60,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Avatar name={row.member.name} size={20} />
                <span className="text-[11px] font-semibold" style={{ color: "var(--grey-700)" }}>
                  {row.member.name}
                </span>
              </div>
              <div
                style={{
                  flex: 1,
                  height: 16,
                  background: "var(--grey-100)",
                  borderRadius: 4,
                  position: "relative",
                }}
              >
                {row.blocks.map((b, j) => (
                  <div
                    key={j}
                    style={{
                      position: "absolute",
                      left: `${(b.start_minute / totalMin) * 100}%`,
                      width: `${((b.end_minute - b.start_minute) / totalMin) * 100}%`,
                      top: 0,
                      bottom: 0,
                      background: KIND_BG[b.kind],
                      borderRadius: 3,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
