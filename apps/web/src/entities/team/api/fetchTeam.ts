import { api, HttpError } from "@shared/api";

import type { TeamMember } from "../model/types";

type Envelope<T> = { data: T };
type BackendTeamMember = TeamMember & {
  membership_id?: string;
  department?: string | null;
};
type BackendTeamStatus = {
  items?: BackendTeamMember[];
};

function normalizeTeam(data: TeamMember[] | BackendTeamStatus): TeamMember[] {
  const rows: BackendTeamMember[] = Array.isArray(data) ? data : data.items ?? [];
  return rows.map((row) => ({
    id: row.id ?? row.membership_id ?? row.name,
    name: row.name,
    status: row.status,
    team: row.team ?? row.department ?? undefined,
  }));
}

export async function fetchTeam(): Promise<TeamMember[] | null> {
  try {
    const r = await api<Envelope<TeamMember[] | BackendTeamStatus>>("/v1/team/status");
    return normalizeTeam(r.data);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }
}
