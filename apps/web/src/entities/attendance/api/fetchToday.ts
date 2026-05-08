import { api, HttpError } from "@shared/api";

import type { AttendanceToday } from "../model/types";

type Envelope<T> = { data: T };

export async function fetchToday(): Promise<AttendanceToday | null> {
  try {
    const r = await api<Envelope<AttendanceToday>>("/v1/attendance/today");
    return r.data;
  } catch (e) {
    if (e instanceof HttpError && (e.status === 404 || e.status === 401)) {
      return null;
    }
    throw e;
  }
}
