import { api, HttpError } from "@shared/api";
import type { AttendanceRecord, AttendanceStatus, ClockKind } from "../model/types";

type PageEnvelope<T> = {
  data: T;
  next_cursor?: string | null;
  meta?: { next_cursor?: string | null };
};

type BackendAttendanceRecord = Partial<AttendanceRecord> & {
  clock_in_kind?: ClockKind | null;
  matched_location?: { label?: string | null } | null;
  status?: string | null;
  total_work_minutes?: number | null;
};

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

function normalizeStatus(record: BackendAttendanceRecord): AttendanceStatus {
  const status = String(record.status ?? "").toUpperCase();
  if (status === "WORKING") return "LIVE";
  if (status === "OK" || status === "LATE" || status === "OT" || status === "OFF" || status === "LIVE") {
    return status;
  }
  if (record.is_late) return "LATE";
  if (status === "COMPLETED" || status === "APPROVED") return "OK";
  return "OFF";
}

function normalizeRecord(record: BackendAttendanceRecord): AttendanceRecord {
  return {
    id: record.id ?? "",
    work_date: record.work_date ?? "",
    clock_in_at: record.clock_in_at ?? null,
    clock_out_at: record.clock_out_at ?? null,
    total_minutes: record.total_minutes ?? record.total_work_minutes ?? null,
    is_late: Boolean(record.is_late),
    status: normalizeStatus(record),
    location_label: record.location_label ?? record.matched_location?.label ?? null,
    kind: record.kind ?? record.clock_in_kind ?? null,
  };
}

export async function fetchRecords(q: RecordsQuery = {}): Promise<RecordsPage> {
  const u = new URLSearchParams();
  if (q.month) u.set("month", q.month);
  if (q.status && q.status !== "ALL") u.set("status", q.status);
  if (q.cursor) u.set("cursor", q.cursor);
  if (q.limit) u.set("limit", String(q.limit));
  const path =
    "/v1/attendance/records" + (u.toString() ? `?${u.toString()}` : "");
  const r = await api<PageEnvelope<BackendAttendanceRecord[]>>(path);
  return {
    items: (r.data ?? []).map(normalizeRecord),
    nextCursor: r.meta?.next_cursor ?? r.next_cursor ?? null,
  };
}

export async function fetchRecord(id: string): Promise<AttendanceRecord | null> {
  try {
    const r = await api<{ data: BackendAttendanceRecord }>(`/v1/attendance/records/${id}`);
    return normalizeRecord(r.data);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }
}
