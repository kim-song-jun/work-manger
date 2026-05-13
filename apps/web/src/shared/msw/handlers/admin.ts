/** admin_api — employees + approvals shared by AdminLayoutShell. */
import { HttpResponse, http } from "msw";

export const adminHandlers = [
  http.get("*/v1/admin/employees", () =>
    HttpResponse.json({
      data: [
        { id: "u-1", name: "이수현", email: "lee@molcube.com", role: "MEMBER" },
        { id: "u-2", name: "박서연", email: "park@molcube.com", role: "MANAGER" },
      ],
      next_cursor: null,
    }),
  ),
  http.get("*/v1/admin/approvals", () =>
    HttpResponse.json({
      data: [],
      counts: { pending: 0, approved: 0, rejected: 0, urgent: 0 },
      next_cursor: null,
    }),
  ),
];
