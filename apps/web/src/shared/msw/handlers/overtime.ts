/** entities/overtime — requests / history / settings. */
import { http } from "msw";

import { ok } from "./_envelope";

export const overtimeHandlers = [
  http.get("*/v1/overtime/requests", () => ok([])),
  http.post("*/v1/overtime/requests", () =>
    ok({
      id: "ot-new",
      work_date: "2026-05-05",
      requested_minutes: 60,
      reason: "Release support",
      status: "PENDING",
    }),
  ),
  http.get("*/v1/overtime/history", () =>
    ok({ months: [{ ym: "2026-05", approved_minutes: 120, approved_count: 2 }] }),
  ),
  http.get("*/v1/overtime/settings", () =>
    ok({
      auto_request_enabled: true,
      trigger_after_minutes: 10,
      max_weekly_minutes: 720,
    }),
  ),
  http.patch("*/v1/overtime/settings", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return ok(body);
  }),
];
