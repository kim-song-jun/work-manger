/** entities/employee — detail / update / bulk admin operations. */
import { http } from "msw";

import { ok } from "./_envelope";

const SAMPLE = {
  id: "u-1",
  name: "Alice Acme",
  email: "alice-imxmm6@acme.demo",
  role: "EMPLOYEE",
  team: "Engineering",
  position: "",
  employee_no: "",
  status: "active",
  hired_at: "2025-01-15",
};

export const employeeHandlers = [
  http.get("*/v1/admin/employees/:id", ({ params }) =>
    ok({ ...SAMPLE, id: String(params.id) }),
  ),
  http.post("*/v1/admin/employees/:id/update", async ({ request, params }) => {
    const body = (await request.json().catch(() => ({}))) as Partial<typeof SAMPLE>;
    return ok({ ...SAMPLE, id: String(params.id), ...body });
  }),
  http.post("*/v1/admin/employees/:id/deactivate", ({ params }) =>
    ok({ ...SAMPLE, id: String(params.id), status: "inactive" }),
  ),
  http.post("*/v1/admin/employees/bulk", () => ok({ ok: true, created: 0 })),
  http.get("*/v1/admin/leave/expiring", () => ok([])),
];
