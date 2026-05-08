import { api, HttpError } from "@shared/api";
import type { ClockInBody } from "@entities/attendance";

/** Thrown when the API returns 422 OVER_HOURS_LIMIT (compliance block). */
export class OverHoursLimitError extends Error {
  constructor() {
    super("OVER_HOURS_LIMIT");
    this.name = "OverHoursLimitError";
  }
}

function isOverHoursLimit(e: unknown): boolean {
  if (!(e instanceof HttpError) || e.status !== 422) return false;
  const code = (e.body as { error?: { code?: string } } | undefined)?.error?.code;
  return code === "OVER_HOURS_LIMIT";
}

/**
 * POST /v1/attendance/clock-out
 *
 * Returns the finalized AttendanceRecord on success so callers can use the
 * server-authoritative clock_out_at timestamp.
 */
export async function clockOut(): Promise<{ clock_out_at?: string | null }> {
  try {
    const r = await api<{ data: { clock_out_at?: string | null } }>(
      "/v1/attendance/clock-out",
      { method: "POST" },
    );
    return r.data ?? {};
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      // endpoint stub — treat as success
      return {};
    }
    throw e;
  }
}

/**
 * POST /v1/attendance/clock-in
 *
 * Treats backend 404 as success while the endpoint is being stubbed.
 * Detects 422 OVER_HOURS_LIMIT (compliance §7.6) and redirects the user
 * to the block screen via window.location so any caller surfaces the
 * intended UX without re-implementing the routing.
 */
export async function clockIn(body: ClockInBody): Promise<{ clock_in_at?: string | null }> {
  try {
    const r = await api<{ data: { clock_in_at?: string | null } }>(
      "/v1/attendance/clock-in",
      { method: "POST", json: body },
    );
    return r.data ?? {};
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      // backend not ready yet — treat as success for the UI
      return {};
    }
    if (isOverHoursLimit(e)) {
      if (typeof window !== "undefined" && window.location) {
        window.location.assign("/m/compliance/block");
      }
      throw new OverHoursLimitError();
    }
    throw e;
  }
}
