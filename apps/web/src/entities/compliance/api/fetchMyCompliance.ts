import { api, HttpError } from "@shared/api";

import type { MyComplianceWeek } from "../model/types";

type Envelope<T> = { data: T };

/** GET /v1/compliance/me?week=YYYY-MM-DD — current user's weekly status. */
export async function fetchMyCompliance(
  week?: string,
): Promise<MyComplianceWeek | null> {
  const qs = week ? `?week=${encodeURIComponent(week)}` : "";
  try {
    const r = await api<Envelope<MyComplianceWeek>>(`/v1/compliance/me${qs}`);
    return r.data;
  } catch (e) {
    if (e instanceof HttpError && (e.status === 404 || e.status === 401)) {
      return null;
    }
    throw e;
  }
}
