/** entities/inbox — unified approval inbox + decide actions. */
import { HttpResponse, http } from "msw";

import { ok } from "./_envelope";

export const inboxHandlers = [
  http.get("*/v1/inbox", () =>
    HttpResponse.json({
      data: [
        {
          id: "rq-1",
          kind: "LEAVE",
          status: "PENDING",
          role: "approve",
          requester: { id: "u-2", name: "박서연", team: "디자인" },
          title: "5월 2일 연차",
          reason: "가족 여행",
          requested_at: "2026-04-22T11:18:00Z",
        },
      ],
      counts: { pending: 1, approved: 0, rejected: 0, urgent: 0 },
      next_cursor: null,
    }),
  ),
  http.post("*/v1/inbox/:id/approve", () => ok({ ok: true })),
  http.post("*/v1/inbox/:id/reject", () => ok({ ok: true })),
];
