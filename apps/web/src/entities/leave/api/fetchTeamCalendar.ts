import { api, HttpError } from "@shared/api";

import type { TeamLeaveCalendar } from "../model/types";

type Envelope<T> = { data: T };

export type TeamCalendarQuery = { from: string; to: string };

export async function fetchTeamCalendar(
  q: TeamCalendarQuery,
): Promise<TeamLeaveCalendar | null> {
  const u = new URLSearchParams({ from: q.from, to: q.to });
  try {
    const r = await api<Envelope<TeamLeaveCalendar>>(
      `/v1/leave/team-calendar?${u.toString()}`,
    );
    return r.data;
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      // Backend not ready yet — render empty grid.
      return { from: q.from, to: q.to, days: [] };
    }
    throw e;
  }
}
