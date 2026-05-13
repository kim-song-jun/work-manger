/** entities/admin-dashboard — KPI tiles + recent activity. */
import { http } from "msw";

import { ok } from "./_envelope";

export const adminDashboardHandlers = [
  http.get("*/v1/admin/dashboard", () =>
    ok({
      date: "2026-05-13",
      kpi: {
        attendance_rate: 92.3,
        not_clocked_in: 2,
        pending_approvals: 9,
        ongoing_overtime: 0,
      },
      pending_quick: [],
    }),
  ),
];
