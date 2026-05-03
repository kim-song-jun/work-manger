import { api, HttpError } from "@shared/api";
import type { ClockInBody } from "@entities/attendance";

/**
 * POST /v1/attendance/clock-in
 *
 * Treats backend 404 as success while the endpoint is being stubbed,
 * matching the original behavior in HomePage.
 */
export async function clockIn(body: ClockInBody): Promise<void> {
  try {
    await api("/v1/attendance/clock-in", { method: "POST", json: body });
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      // backend not ready yet — treat as success for the UI
      return;
    }
    throw e;
  }
}
