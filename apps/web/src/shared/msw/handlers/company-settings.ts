/** entities/company-settings — read + OWNER-only update. */
import { http } from "msw";

import { ok } from "./_envelope";

const SAMPLE = {
  name: "Acme",
  code: "ACMEDM",
  fiscal_year_start: "2026-01-01",
  default_locale: "ko",
  timezone: "Asia/Seoul",
  brand_color: "#5B6CFF",
  logo_url: "",
  compliance_block_when_over: false,
  leave_promotion_enabled: false,
};

export const companySettingsHandlers = [
  http.get("*/v1/admin/settings", () => ok(SAMPLE)),
  http.post("*/v1/admin/settings/update", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Partial<typeof SAMPLE>;
    return ok({ ...SAMPLE, ...body });
  }),
];
