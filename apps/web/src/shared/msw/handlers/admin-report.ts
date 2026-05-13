/** entities/admin-report — monthly report + team performance. */
import { http } from "msw";

import { ok } from "./_envelope";

export const adminReportHandlers = [
  http.get("*/v1/admin/reports/monthly", () =>
    ok({
      month: "2026-05",
      kpi: {
        on_time_rate: 95.2,
        avg_weekly_hours: 41.6,
        total_overtime_hours: 32.5,
        leave_usage_rate: 18.4,
      },
      teams: [
        {
          team: "Engineering",
          on_time_rate: 96.0,
          avg_weekly_hours: 42.1,
          avg_overtime_hours: 5.6,
        },
      ],
    }),
  ),
  http.post("*/v1/admin/reports/export", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { format?: string };
    return ok({ export_url: `https://example.test/exports/2026-05.${body.format ?? "csv"}` });
  }),
];
