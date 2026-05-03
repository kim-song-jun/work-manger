import { api, HttpError } from "@shared/api";
import type { TeamMember } from "../model/types";

type Envelope<T> = { data: T };

export async function fetchTeam(): Promise<TeamMember[] | null> {
  try {
    const r = await api<Envelope<TeamMember[]>>("/v1/team/status");
    return r.data;
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }
}
