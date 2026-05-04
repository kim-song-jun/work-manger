import { api, HttpError } from "@shared/api";
import type { TeamMember, TeamGroup, TeamTimeline } from "../model/types";

type Envelope<T> = { data: T };

async function safe<T>(path: string, fallback: T): Promise<T> {
  try {
    const r = await api<Envelope<T>>(path);
    return r.data ?? fallback;
  } catch (e) {
    if (e instanceof HttpError && (e.status === 404 || e.status === 401)) {
      return fallback;
    }
    throw e;
  }
}

export function fetchTeamGrid(): Promise<TeamMember[]> {
  return safe("/v1/team/status/grid", []);
}

export function fetchTeamGrouped(): Promise<TeamGroup[]> {
  return safe("/v1/team/status/grouped", []);
}

export function fetchTeamTimeline(): Promise<TeamTimeline> {
  return safe("/v1/team/status/timeline", { rows: [], now_minute: 540 });
}
