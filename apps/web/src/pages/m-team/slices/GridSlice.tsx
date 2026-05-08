import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Avatar, Card, Skeleton, StatusDot } from "@shared/ui";
import { fetchTeamGrid } from "@entities/team";
import type { TeamMember } from "@entities/team";

function buildFallback(t: (k: string) => string): TeamMember[] {
  return [
    { id: "1", name: t("mobile.team_demo.member_jiwoo"), status: "office", team: t("mobile.team_demo.team_design") },
    { id: "2", name: t("mobile.team_demo.member_minsoo"), status: "office", team: t("mobile.team_demo.team_engineering") },
    { id: "3", name: t("mobile.team_demo.member_yerin"), status: "wfh", team: t("mobile.team_demo.team_engineering") },
    { id: "4", name: t("mobile.team_demo.member_hyunwoo"), status: "office", team: t("mobile.team_demo.team_product") },
    { id: "5", name: t("mobile.team_demo.member_sooa"), status: "leave", team: t("mobile.team_demo.team_product") },
    { id: "6", name: t("mobile.team_demo.member_doyoon"), status: "off", team: t("mobile.team_demo.team_operations") },
  ];
}

export function GridSlice() {
  const { t } = useTranslation();
  const q = useQuery({ queryKey: ["team-status", "grid"], queryFn: fetchTeamGrid });
  const members: TeamMember[] = (q.data?.length ? q.data : buildFallback(t)) as TeamMember[];
  if (q.isLoading)
    return (
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Card key={i} padding={12}>
            <div className="flex flex-col items-center gap-2">
              <Skeleton width={48} height={48} radius={24} />
              <Skeleton width="80%" height={12} />
            </div>
          </Card>
        ))}
      </div>
    );
  return (
    <div className="grid grid-cols-3 gap-2">
      {members.map((m) => (
        <Card key={m.id} padding={12}>
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <Avatar name={m.name} size={48} />
              <span className="absolute" style={{ bottom: 0, right: 0 }}>
                <StatusDot status={m.status} size={12} ring />
              </span>
            </div>
            <div
              className="text-[13px] font-semibold text-ink-900"
              style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {m.name}
            </div>
            {m.team && <div className="text-[11px] text-ink-500">{m.team}</div>}
          </div>
        </Card>
      ))}
    </div>
  );
}
