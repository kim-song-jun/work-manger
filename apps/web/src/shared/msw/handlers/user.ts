/** entities/user — currently fetched via `GET /v1/me`. */
import { http } from "msw";

import { ok } from "./_envelope";

export const userHandlers = [
  http.get("*/v1/me", () =>
    ok({
      id: "u-self",
      email: "self@molcube.com",
      name: "이수현",
      locale: "ko",
      is_email_verified: true,
      memberships: [
        {
          id: "m-self",
          company: { id: "c-1", name: "Molcube" },
          role: "EMPLOYEE",
        },
      ],
    }),
  ),
];
