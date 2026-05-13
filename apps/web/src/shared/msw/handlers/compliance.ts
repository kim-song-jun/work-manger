/** entities/compliance — 52h weekly board (me + team + admin company-wide). */
import { http } from "msw";

import { ok } from "./_envelope";

export const complianceHandlers = [
  http.get("*/v1/compliance/me", () =>
    ok({
      week_start: "2026-05-11",
      worked_minutes: 1800, // 30h
      limit_minutes: 3120, // 52h
      remaining_minutes: 1320,
      blocked: false,
    }),
  ),
  http.get("*/v1/compliance/team", () => ok({ week_start: "2026-05-11", members: [] })),
  http.get("*/v1/admin/compliance/52h", () =>
    ok({
      week_start: "2026-05-11",
      rows: [
        {
          membership_id: "m-1",
          name: "이수현",
          department: "Engineering",
          worked_minutes: 960,
          limit_minutes: 3120,
          status: "ok",
        },
      ],
    }),
  ),
];
