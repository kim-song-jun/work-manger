/**
 * MSW handlers for the billing module (iter13 T6 SKELETON).
 *
 * Returns seed-equivalent data for the OwnerBillingPage tests:
 *   - 1 active TRIAL CompanySubscription on the "Standard" plan
 *   - 0 invoices (skeleton — Stripe webhook lands invoices in iter14)
 *
 * Override per-test via `server.use(...)` if you need a CANCELED status
 * or a populated invoice list.
 */
import { HttpResponse, http } from "msw";

const ok = <T>(data: T, extra: Record<string, unknown> = {}) =>
  HttpResponse.json({ data, ...extra });

const SEED_PLAN = {
  id: "plan-standard",
  name: "Standard",
  price_monthly_krw: 50000,
  max_employees: 50,
  features_jsonb: {
    attendance: true,
    leave: true,
    compliance_52h: true,
    audit_log: true,
  },
  is_active: true,
};

const SEED_SUBSCRIPTION = {
  id: "sub-demo",
  plan: SEED_PLAN,
  status: "TRIAL" as const,
  started_at: "2026-05-01T00:00:00Z",
  current_period_end: "2026-05-15T00:00:00Z",
  canceled_at: null,
};

export const billingHandlers = [
  http.get("*/v1/billing/subscription", () => ok(SEED_SUBSCRIPTION)),
  http.get("*/v1/billing/invoices", () => ok([])),
];
