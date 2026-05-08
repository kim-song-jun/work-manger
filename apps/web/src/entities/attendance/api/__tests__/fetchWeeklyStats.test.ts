/**
 * Test: entities/attendance - fetchWeeklyStats (F-EMPLOYEE-012)
 * Type: Unit (vitest, jsdom)
 * Why: The home page reads regular + overtime minutes from this fetcher
 *      to drive the "이번 주" / "초과 누적" KPI tiles. We verify it
 *      unwraps the ``data`` envelope and falls back to ``null`` on the
 *      auth states the home page tolerates (401, 404).
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { setAccessToken } from "@shared/api";

import { fetchWeeklyStats } from "../fetchWeeklyStats";

function mockFetchOnce(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const text = body === undefined ? "" : JSON.stringify(body);
  const resp = {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    text: () => Promise.resolve(text),
  } as unknown as Response;
  return vi.spyOn(window, "fetch").mockResolvedValueOnce(resp);
}

describe("entities/attendance - fetchWeeklyStats", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setAccessToken(null);
  });

  it("unwraps the data envelope into a typed WeeklyStats object", async () => {
    mockFetchOnce({
      data: {
        week_start: "2026-05-04",
        week_end: "2026-05-10",
        regular_minutes: 1920,
        overtime_minutes: 258,
        break_minutes: 240,
        days_worked: 4,
      },
    });

    await expect(fetchWeeklyStats()).resolves.toMatchObject({
      week_start: "2026-05-04",
      week_end: "2026-05-10",
      regular_minutes: 1920,
      overtime_minutes: 258,
      break_minutes: 240,
      days_worked: 4,
    });
  });

  it("returns null on 401 (not authenticated) so home page can render dash", async () => {
    mockFetchOnce(
      { error: { code: "AUTH", message: "401" } },
      { ok: false, status: 401 },
    );
    await expect(fetchWeeklyStats()).resolves.toBeNull();
  });

  it("returns null on 404 (BE feature flagged off)", async () => {
    mockFetchOnce(
      { error: { code: "RESOURCE_NOT_FOUND", message: "404" } },
      { ok: false, status: 404 },
    );
    await expect(fetchWeeklyStats()).resolves.toBeNull();
  });

  it("propagates non-401/404 errors", async () => {
    mockFetchOnce(
      { error: { code: "SERVER", message: "boom" } },
      { ok: false, status: 500 },
    );
    await expect(fetchWeeklyStats()).rejects.toThrow("boom");
  });
});
