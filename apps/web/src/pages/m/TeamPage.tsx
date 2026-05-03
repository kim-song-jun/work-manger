import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Avatar, Card, PageHeader, Skeleton, StatusDot } from "@/components";
import type { StatusKind } from "@/components";
import { api, HttpError } from "@/lib/api";

type TeamMember = {
  id: string;
  name: string;
  status: StatusKind;
  team?: string;
};

type Envelope<T> = { data: T };

async function fetchTeam(): Promise<TeamMember[] | null> {
  try {
    const r = await api<Envelope<TeamMember[]>>("/v1/team/status");
    return r.data;
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }
}

const FALLBACK: TeamMember[] = [
  { id: "1", name: "지우", status: "office", team: "디자인" },
  { id: "2", name: "민수", status: "office", team: "엔지니어링" },
  { id: "3", name: "예린", status: "wfh", team: "엔지니어링" },
  { id: "4", name: "현우", status: "office", team: "프로덕트" },
  { id: "5", name: "수아", status: "leave", team: "프로덕트" },
  { id: "6", name: "도윤", status: "off", team: "오퍼레이션" },
];

export function TeamPage() {
  const { t } = useTranslation();
  const q = useQuery({ queryKey: ["team-status"], queryFn: fetchTeam });
  const members = q.data ?? FALLBACK;

  return (
    <>
      <PageHeader title={t("team.title")} />
      <div className="flex-1 overflow-y-auto" style={{ padding: "8px 20px 24px" }}>
        {q.isLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Card key={i} padding={12}>
                <div className="flex flex-col items-center gap-2">
                  <Skeleton width={48} height={48} radius={24} />
                  <Skeleton width="80%" height={12} />
                  <Skeleton width="60%" height={10} />
                </div>
              </Card>
            ))}
          </div>
        ) : (
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
                    style={{
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {m.name}
                  </div>
                  {m.team && (
                    <div className="text-[11px] text-ink-500">{m.team}</div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
