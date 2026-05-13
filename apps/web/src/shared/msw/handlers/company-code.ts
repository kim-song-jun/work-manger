/** entities/company-code — invite code list / issue / revoke (ADMIN only). */
import { http } from "msw";

import { ok } from "./_envelope";

const SAMPLE = {
  id: "code-1",
  code: "ACMEDM",
  max_uses: null as number | null,
  uses: 2,
  expires_at: null as string | null,
  revoked_at: null as string | null,
  created_at: "2026-05-01T00:00:00Z",
};

export const companyCodeHandlers = [
  http.get("*/v1/admin/company-codes", () => ok([SAMPLE])),
  http.post("*/v1/admin/company-codes", () =>
    ok({ ...SAMPLE, id: "code-new", code: "NEW123" }),
  ),
  http.post("*/v1/admin/company-codes/:id/revoke", ({ params }) =>
    ok({ ...SAMPLE, id: String(params.id), revoked_at: "2026-05-13T00:00:00Z" }),
  ),
];
