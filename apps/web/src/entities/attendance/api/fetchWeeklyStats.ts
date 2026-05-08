import { api, HttpError } from "@shared/api";

import type { WeeklyStats } from "../model/types";

type Envelope<T> = { data: T };

/**
 * F-EMPLOYEE-012: fetch the current ISO-week aggregate for the
 * authenticated user. Returns ``null`` on 401 so the home page can
 * gracefully render the dash placeholder for signed-out cached states.
 */
export async function fetchWeeklyStats(): Promise<WeeklyStats | null> {
  try {
    const r = await api<Envelope<WeeklyStats>>("/v1/attendance/stats/weekly");
    return r.data;
  } catch (e) {
    if (e instanceof HttpError && (e.status === 404 || e.status === 401)) {
      return null;
    }
    throw e;
  }
}
