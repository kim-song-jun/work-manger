/** entities/approval — admin-side approvals list + decide. */
import { http } from "msw";

import { ok } from "./_envelope";

export const approvalHandlers = [
  http.get("*/v1/admin/approvals", () =>
    ok([
      {
        id: "ap-1",
        target_type: "LEAVE",
        target_id: "lr-1",
        requester: { id: "u-1", name: "Alice", team: "Engineering" },
        status: "PENDING",
        created_at: "2026-05-12T00:00:00Z",
      },
    ]),
  ),
  http.post("*/v1/admin/approvals/:id", () => ok({ ok: true })),
  http.post("*/v1/admin/approvals/bulk", () => ok({ ok: true, processed: 0 })),
];
