/** entities/leave — balance / policy / requests list + create. */
import { http } from "msw";

import { ok } from "./_envelope";

export const leaveHandlers = [
  http.get("*/v1/leave/balance", () =>
    ok({ remaining: 12.5, used: 2.5, accrued: 15, expiring: 1.5 }),
  ),
  http.get("*/v1/leave/policy", () => ok({ accrual: "monthly", carryover_days: 5 })),
  http.get("*/v1/leave/requests", () =>
    ok([
      // iter13 T3: include a sample COMP row so list views render the
      // 보상휴가 chip in mocked / Storybook environments.
      {
        id: "lr-comp-1",
        start_date: "2026-05-20",
        end_date: "2026-05-20",
        kind: "FULL",
        leave_type: "COMP",
        days: 1,
        status: "PENDING",
        reason: "지난주 야근 보상",
      },
    ]),
  ),
  http.post("*/v1/leave/requests", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      leave_type?: string;
    };
    return ok({
      id: "lr-new",
      status: "PENDING",
      leave_type: body.leave_type ?? "ANNUAL",
    });
  }),
];
