/** entities/notification — inbox + bulk read + device-token register. */
import { HttpResponse, http } from "msw";

import { ok } from "./_envelope";

export const notificationHandlers = [
  http.get("*/v1/notifications", () =>
    HttpResponse.json({
      data: [
        {
          id: "n-1",
          kind: "leave",
          title: "연차가 승인되었습니다",
          body: "5월 2일 연차",
          created_at: "2026-04-22T12:00:00Z",
          read_at: null,
        },
      ],
      next_cursor: null,
    }),
  ),
  http.post("*/v1/notifications/:id/read", () => ok({ ok: true })),
  // F-EMPLOYEE-009: bulk read-all endpoint
  http.post("*/v1/notifications/read-all", () => ok({ ok: true })),
  http.get("*/v1/notifications/vapid-public-key", () =>
    ok({ public_key: "BIfn-test-vapid-public-key" }),
  ),
  http.post("*/v1/notifications/devices", () =>
    ok({ id: "dev-new", platform: "WEB", token: "test-device-token" }),
  ),
  http.delete("*/v1/notifications/devices/:id", () => ok({ ok: true })),
];
