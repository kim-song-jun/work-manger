/**
 * MSW handler registry (per-entity, FSD-aligned).
 *
 * B-CODE-07: prior to this refactor handlers lived under
 * `apps/web/src/test/msw/handlers.ts` in a single ~280-line file. This
 * directory now keeps **one file per `entities/<slice>`** so additions land
 * next to the entity they mock and Storybook can compose them à la carte.
 *
 * Re-exporters:
 *   - `handlers` — flat array of every handler (default for vitest / Storybook
 *     decorators that want full fidelity).
 *   - Per-entity arrays (e.g. `leaveHandlers`) — opt-in subsets for focused
 *     play stories or per-test `server.use(...)` overrides.
 *
 * Conventions:
 *   - URL patterns use `*` prefix so they match both absolute and BASE+path.
 *   - Success bodies use `{ data, ... }` envelope per docs/api/api-spec.md.
 *   - Mutations return success envelopes; tests asserting failures should
 *     override via `server.use(...)`.
 */
import { adminHandlers } from "./admin";
import { adminDashboardHandlers } from "./admin-dashboard";
import { adminReportHandlers } from "./admin-report";
import { approvalHandlers } from "./approval";
import { attendanceHandlers } from "./attendance";
import { auditHandlers } from "./audit";
import { authHandlers } from "./auth";
import { billingHandlers } from "./billing";
import { companyCodeHandlers } from "./company-code";
import { companySettingsHandlers } from "./company-settings";
import { complianceHandlers } from "./compliance";
import { employeeHandlers } from "./employee";
import { inboxHandlers } from "./inbox";
import { leaveHandlers } from "./leave";
import { noticeHandlers } from "./notice";
import { notificationHandlers } from "./notification";
import { overtimeHandlers } from "./overtime";
import { teamHandlers } from "./team";
import { tripHandlers } from "./trip";
import { userHandlers } from "./user";

export {
  adminHandlers,
  adminDashboardHandlers,
  adminReportHandlers,
  approvalHandlers,
  attendanceHandlers,
  auditHandlers,
  authHandlers,
  billingHandlers,
  companyCodeHandlers,
  companySettingsHandlers,
  complianceHandlers,
  employeeHandlers,
  inboxHandlers,
  leaveHandlers,
  noticeHandlers,
  notificationHandlers,
  overtimeHandlers,
  teamHandlers,
  tripHandlers,
  userHandlers,
};

export const handlers = [
  ...userHandlers,
  ...authHandlers,
  ...leaveHandlers,
  ...overtimeHandlers,
  ...inboxHandlers,
  ...teamHandlers,
  ...notificationHandlers,
  ...attendanceHandlers,
  ...adminHandlers,
  ...adminDashboardHandlers,
  ...adminReportHandlers,
  ...approvalHandlers,
  ...auditHandlers,
  ...billingHandlers,
  ...companyCodeHandlers,
  ...companySettingsHandlers,
  ...complianceHandlers,
  ...employeeHandlers,
  ...noticeHandlers,
  ...tripHandlers,
];

export { ok } from "./_envelope";
