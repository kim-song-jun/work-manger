/** entities/audit — cursor-paginated audit log + revoke history. */
import { http } from "msw";

import { ok } from "./_envelope";

export const auditHandlers = [
  http.get("*/v1/audit/logs", () =>
    ok({
      items: [
        {
          id: "audit-1",
          actor: "admin@acme.demo",
          action: "company_settings.update",
          target_type: "Company",
          target_id: "c-1",
          payload_json: { brand_color: "#5B6CFF" },
          created_at: "2026-05-13T08:00:00Z",
        },
      ],
      next_cursor: null,
    }),
  ),
  http.get("*/v1/audit/logs/:id", ({ params }) =>
    ok({
      id: String(params.id),
      actor: "admin@acme.demo",
      action: "company_settings.update",
      target_type: "Company",
      target_id: "c-1",
      payload_json: {},
      created_at: "2026-05-13T08:00:00Z",
    }),
  ),
];
