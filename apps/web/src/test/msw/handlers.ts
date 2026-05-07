/**
 * MSW handlers (central registry).
 *
 * Why: replace ad-hoc `vi.spyOn(window, 'fetch')` with a single source of truth
 * for mocked HTTP responses. Each handler returns the realistic `{ data, ... }`
 * envelope shape documented in docs/api/api-spec.md so component tests match
 * production payloads. Per-test overrides should call `server.use(...)` with
 * a focused handler (see src/test/msw/server.ts).
 *
 * Conventions:
 *   - Handlers are grouped per FSD slice for greppability.
 *   - All paths use `*` prefix so they match both absolute and `BASE` + path.
 *   - Mutations return success envelopes; tests asserting failures should
 *     override.
 */
import { HttpResponse, http } from "msw";

const ok = <T>(data: T, extra: Record<string, unknown> = {}) =>
  HttpResponse.json({ data, ...extra });

// --- entities/user ----------------------------------------------------------
const userHandlers = [
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

// --- features/auth ----------------------------------------------------------
const authHandlers = [
  http.post("*/v1/auth/login", async () =>
    ok({
      access: "test-access-token",
      refresh: "test-refresh-token",
      user: { id: "u-self", email: "self@molcube.com", name: "이수현" },
    }),
  ),
  http.post("*/v1/auth/logout", () => ok({ ok: true })),
  http.post("*/v1/auth/refresh", () => ok({ access: "rotated-access" })),
];

// --- entities/leave ---------------------------------------------------------
const leaveHandlers = [
  http.get("*/v1/leave/balance", () =>
    ok({ remaining: 12.5, used: 2.5, accrued: 15, expiring: 1.5 }),
  ),
  http.get("*/v1/leave/policy", () => ok({ accrual: "monthly", carryover_days: 5 })),
  http.get("*/v1/leave/requests", () => ok([])),
  http.post("*/v1/leave/requests", () =>
    ok({ id: "lr-new", status: "PENDING" }),
  ),
];

// --- entities/overtime ------------------------------------------------------
const overtimeHandlers = [
  http.get("*/v1/overtime/requests", () => ok([])),
  http.post("*/v1/overtime/requests", () =>
    ok({
      id: "ot-new",
      work_date: "2026-05-05",
      requested_minutes: 60,
      reason: "Release support",
      status: "PENDING",
    }),
  ),
  http.get("*/v1/overtime/history", () =>
    ok({ months: [{ ym: "2026-05", approved_minutes: 120, approved_count: 2 }] }),
  ),
  http.get("*/v1/overtime/settings", () =>
    ok({
      auto_request_enabled: true,
      trigger_after_minutes: 10,
      max_weekly_minutes: 720,
    }),
  ),
  http.patch("*/v1/overtime/settings", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return ok(body);
  }),
];

// --- entities/inbox ---------------------------------------------------------
const inboxHandlers = [
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

// --- entities/team ----------------------------------------------------------
const teamHandlers = [
  http.get("*/v1/team/status/grid", () =>
    ok({
      members: [
        { id: "u-1", name: "이수현", status: "OFFICE" },
        { id: "u-2", name: "박서연", status: "WFH" },
        { id: "u-3", name: "김민준", status: "LEAVE" },
      ],
    }),
  ),
  http.get("*/v1/team/leave/calendar", () =>
    ok({ from: "2026-05-01", to: "2026-05-31", days: [] }),
  ),
];

// --- entities/notification --------------------------------------------------
const notificationHandlers = [
  http.get("*/v1/notifications", () =>
    HttpResponse.json({
      data: [
        {
          id: "n-1",
          kind: "LEAVE_APPROVED",
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
];

// --- admin ------------------------------------------------------------------
const adminHandlers = [
  http.get("*/v1/admin/employees", () =>
    HttpResponse.json({
      data: [
        { id: "u-1", name: "이수현", email: "lee@molcube.com", role: "MEMBER" },
        { id: "u-2", name: "박서연", email: "park@molcube.com", role: "MANAGER" },
      ],
      next_cursor: null,
    }),
  ),
  http.get("*/v1/admin/approvals", () =>
    HttpResponse.json({ data: [], counts: { pending: 0, approved: 0, rejected: 0, urgent: 0 }, next_cursor: null }),
  ),
];

export const handlers = [
  ...userHandlers,
  ...authHandlers,
  ...leaveHandlers,
  ...overtimeHandlers,
  ...inboxHandlers,
  ...teamHandlers,
  ...notificationHandlers,
  ...adminHandlers,
];
