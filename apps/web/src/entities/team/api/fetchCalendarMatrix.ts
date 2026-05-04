import { api, HttpError } from "@shared/api";
import type { CalendarMatrix } from "../model/calendarMatrix";

type Envelope<T> = { data: T };

export type FetchCalendarMatrixOpts = {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  group_by?: "team" | "all";
};

const EMPTY: CalendarMatrix = { from: "", to: "", rows: [] };

/** GET /v1/team/calendar/matrix — dense per-day status matrix. */
export async function fetchCalendarMatrix(
  opts: FetchCalendarMatrixOpts,
): Promise<CalendarMatrix> {
  const params = new URLSearchParams({ from: opts.from, to: opts.to });
  if (opts.group_by) params.set("group_by", opts.group_by);
  try {
    const r = await api<Envelope<CalendarMatrix>>(
      `/v1/team/calendar/matrix?${params.toString()}`,
    );
    return r.data ?? EMPTY;
  } catch (e) {
    if (e instanceof HttpError && (e.status === 404 || e.status === 401)) {
      return { ...EMPTY, from: opts.from, to: opts.to };
    }
    throw e;
  }
}
