import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Avatar, Card, Skeleton, StatusDot } from "@shared/ui";
import { fetchTeamGrouped } from "@entities/team";
import type { TeamGroup } from "@entities/team";

function buildFallback(t: (k: string) => string): TeamGroup[] {
  return [
    {
      team: t("mobile.team_demo.team_design"),
      members: [
        { id: "1", name: t("mobile.team_demo.member_jiwoo"), status: "office" },
        { id: "2", name: t("mobile.team_demo.member_sooa"), status: "leave" },
      ],
    },
    {
      team: t("mobile.team_demo.team_engineering"),
      members: [
        { id: "3", name: t("mobile.team_demo.member_yerin"), status: "wfh" },
        { id: "4", name: t("mobile.team_demo.member_minsoo"), status: "office" },
      ],
    },
  ];
}

export function GroupedSlice() {
  const { t } = useTranslation();
  const q = useQuery({
    queryKey: ["team-status", "grouped"],
    queryFn: fetchTeamGrouped,
  });
  if (q.isLoading) return <Skeleton height={120} />;
  const fallback = buildFallback(t);
  const groups: TeamGroup[] = (q.data?.length ? q.data : fallback) as TeamGroup[];
  return (
    <div className="flex flex-col gap-2">
      {groups.map((g) => {
        const working = g.members.filter(
          (m) => m.status === "office" || m.status === "wfh",
        ).length;
        return (
          <Card key={g.team} padding={14}>
            <div className="flex items-center justify-between">
              <div className="text-[14px] font-semibold" style={{ color: "var(--grey-900)" }}>
                {g.team}
              </div>
              <div className="text-[12px]" style={{ color: "var(--grey-500)" }}>
                {t("mobile.team_demo.working_count", {
                  working,
                  total: g.members.length,
                })}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {g.members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-1.5"
                  style={{
                    padding: "4px 10px 4px 4px",
                    background: "var(--grey-100)",
                    borderRadius: 999,
                  }}
                >
                  <div className="relative">
                    <Avatar name={m.name} size={22} />
                    <span className="absolute" style={{ bottom: -2, right: -2 }}>
                      <StatusDot status={m.status} size={8} ring />
                    </span>
                  </div>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--grey-700)" }}>
                    {m.name}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
