/** entities/team — status grid / grouped / timeline + leave calendar. */
import { http } from "msw";

import { ok } from "./_envelope";

export const teamHandlers = [
  http.get("*/v1/team/status/grid", () =>
    // F-MANAGER-13: BE returns {data: {date, items}} not {data: TeamMember[]}
    ok({
      date: "2026-05-08",
      items: [
        { id: "u-1", name: "이수현", status: "office" },
        { id: "u-2", name: "박서연", status: "wfh" },
        { id: "u-3", name: "김민준", status: "leave" },
      ],
    }),
  ),
  http.get("*/v1/team/status/grouped", () =>
    ok({
      date: "2026-05-08",
      groups: [
        {
          team: "디자인",
          members: [{ id: "u-1", name: "이수현", status: "office" }],
        },
      ],
    }),
  ),
  http.get("*/v1/team/status/timeline", () =>
    ok({
      date: "2026-05-08",
      now_minute: 600,
      rows: [
        {
          member: { id: "u-1", name: "이수현", status: "office" },
          blocks: [{ start_minute: 540, end_minute: 720, kind: "office" }],
        },
      ],
    }),
  ),
  http.get("*/v1/team/leave/calendar", () =>
    ok({ from: "2026-05-01", to: "2026-05-31", days: [] }),
  ),
];
