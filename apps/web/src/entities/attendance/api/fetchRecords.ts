import { api, HttpError } from "@shared/api";
import type { AttendanceRecord } from "../model/types";

type Envelope<T> = { data: T; next_cursor?: string | null };

export type RecordsQuery = {
  month?: string;            // YYYY-MM
  status?: "ALL" | "OK" | "LATE" | "OT" | "OFF";
  cursor?: string | null;
  limit?: number;
};

export type RecordsPage = {
  items: AttendanceRecord[];
  nextCursor: string | null;
};

export async function fetchRecords(q: RecordsQuery = {}): Promise<RecordsPage> {
  const u = new URLSearchParams();
  if (q.month) u.set("month", q.month);
  if (q.status && q.status !== "ALL") u.set("status", q.status);
  if (q.cursor) u.set("cursor", q.cursor);
  if (q.limit) u.set("limit", String(q.limit));
  const path =
    "/v1/attendance/records" + (u.toString() ? `?${u.toString()}` : "");
  try {
    const r = await api<Envelope<AttendanceRecord[]>>(path);
    return { items: r.data ?? [], nextCursor: r.next_cursor ?? null };
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      return { items: [], nextCursor: null };
    }
    throw e;
  }
}

export async function fetchRecord(id: string): Promise<AttendanceRecord | null> {
  try {
    const r = await api<{ data: AttendanceRecord }>(`/v1/attendance/records/${id}`);
    return r.data;
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }
}
