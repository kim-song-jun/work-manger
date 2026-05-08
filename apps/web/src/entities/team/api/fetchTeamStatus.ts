/**
 * F-MANAGER-13: Team status fetch functions with correct BE envelope mapping.
 *
 * BE returns nested envelope:
 *   status/grid    → { data: { date: string; items: TeamMember[] } }
 *   status/grouped → { data: { date: string; groups: TeamGroup[] } }
 *   status/timeline→ { data: { date: string; events: TeamTimelineRow[] | TeamTimeline } }
 *
 * FE previously used api<Envelope<TeamMember[]>>() which assumed r.data IS the array —
 * but r.data is actually the { date, items } object.  Fixed here by extracting the
 * inner array from the correct key.
 */
import { api, HttpError } from "@shared/api";

import type { TeamMember, TeamGroup, TeamTimeline, TeamTimelineRow } from "../model/types";

type GridEnvelope = { data: { date: string; items: TeamMember[] } };
type GroupedEnvelope = { data: { date: string; groups: TeamGroup[] } };
type TimelineEnvelope = {
  data: { date: string; events?: TeamTimelineRow[]; rows?: TeamTimelineRow[]; now_minute?: number };
};

export async function fetchTeamGrid(): Promise<TeamMember[]> {
  try {
    const r = await api<GridEnvelope>("/v1/team/status/grid");
    return r.data?.items ?? [];
  } catch (e) {
    if (e instanceof HttpError && (e.status === 404 || e.status === 401)) {
      return [];
    }
    throw e;
  }
}

export async function fetchTeamGrouped(): Promise<TeamGroup[]> {
  try {
    const r = await api<GroupedEnvelope>("/v1/team/status/grouped");
    return r.data?.groups ?? [];
  } catch (e) {
    if (e instanceof HttpError && (e.status === 404 || e.status === 401)) {
      return [];
    }
    throw e;
  }
}

export async function fetchTeamTimeline(): Promise<TeamTimeline> {
  const fallback: TeamTimeline = { rows: [], now_minute: 540 };
  try {
    const r = await api<TimelineEnvelope>("/v1/team/status/timeline");
    const d = r.data;
    if (!d) return fallback;
    // BE may return rows directly (legacy) or via `events` key
    const rows: TeamTimelineRow[] = d.rows ?? d.events ?? [];
    const now_minute = d.now_minute ?? 540;
    return { rows, now_minute };
  } catch (e) {
    if (e instanceof HttpError && (e.status === 404 || e.status === 401)) {
      return fallback;
    }
    throw e;
  }
}
