/** features/auth — login / logout / refresh stubs. */
import { http } from "msw";

import { ok } from "./_envelope";

export const authHandlers = [
  http.post("*/v1/auth/login", () =>
    ok({
      access: "test-access-token",
      refresh: "test-refresh-token",
      user: { id: "u-self", email: "self@molcube.com", name: "이수현" },
    }),
  ),
  http.post("*/v1/auth/logout", () => ok({ ok: true })),
  http.post("*/v1/auth/refresh", () => ok({ access: "rotated-access" })),
];
