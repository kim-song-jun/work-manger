/** entities/attendance — today / weekly stats + clock + break flows. */
import { http } from "msw";

import { ok } from "./_envelope";

export const attendanceHandlers = [
  http.get("*/v1/attendance/today", () =>
    ok({
      clock_in_at: "2026-05-08T09:05:00Z",
      clock_out_at: null,
      worked_minutes: 36,
      is_clocked_in: true,
      kind: "OFFICE",
    }),
  ),
  // F-EMPLOYEE-012: weekly KPI source. Default fixture mirrors the BE
  // response for a mid-week demo state so the home page renders deterministic
  // KPI values during component tests.
  http.get("*/v1/attendance/stats/weekly", () =>
    ok({
      week_start: "2026-05-04",
      week_end: "2026-05-10",
      regular_minutes: 1920, // 32h regular
      overtime_minutes: 258, // 4.3h overtime
      break_minutes: 240,
      days_worked: 4,
    }),
  ),
  http.get("*/v1/attendance/stats/today", () =>
    ok({
      clock_in_at: "2026-05-08T09:05:00Z",
      clock_out_at: null,
      work_minutes: 36,
      break_minutes: 0,
      is_clocked_in: true,
    }),
  ),
  http.post("*/v1/attendance/clock-in", () => ok({ clock_in_at: "2026-05-08T09:05:00Z" })),
  http.post("*/v1/attendance/clock-out", () => ok({ clock_out_at: "2026-05-08T18:01:00Z" })),
  http.post("*/v1/attendance/break/start", () => ok({ ok: true })),
  http.post("*/v1/attendance/break/end", () => ok({ ok: true })),
];
