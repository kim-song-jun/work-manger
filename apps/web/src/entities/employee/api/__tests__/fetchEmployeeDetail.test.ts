/**
 * Test: entities/employee - fetchEmployeeDetail
 * Type: Unit (vitest, jsdom)
 * Why: Admin detail receives a nested backend shape and renders directly from
 *      the normalized entity. Missing role/leave fields used to blank the page.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { setAccessToken } from "@shared/api";

import { fetchEmployeeDetail } from "../fetchEmployeeDetail";

function mockFetchOnce(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const text = body === undefined ? "" : JSON.stringify(body);
  const resp = {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    text: () => Promise.resolve(text),
  } as unknown as Response;
  return vi.spyOn(window, "fetch").mockResolvedValueOnce(resp);
}

describe("entities/employee - fetchEmployeeDetail", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setAccessToken(null);
  });

  it("normalizes nested backend detail into a flat employee detail", async () => {
    mockFetchOnce({
      data: {
        employee: {
          id: "m1",
          email: "admin@example.test",
          name: "Admin",
          role: "ADMIN",
          department_name: "Engineering",
          position: "Lead",
          hired_at: "2023-01-01",
          is_active: true,
        },
        leave: {
          granted: "15.00",
          used: "2",
          remaining: "13.00",
        },
        recent_attendance: [
          {
            work_date: "2026-05-05",
            total_work_minutes: 480,
          },
        ],
      },
    });

    await expect(fetchEmployeeDetail("m1")).resolves.toMatchObject({
      id: "m1",
      role: "ADMIN",
      team: "Engineering",
      department: "Engineering",
      joined_at: "2023-01-01",
      active: true,
      leave: {
        accrued: 15,
        used: 2,
        remaining: 13,
        expiring: 0,
      },
      attendance_30d: [{ date: "2026-05-05", worked_minutes: 480 }],
    });
  });
});
