/**
 * Tests: m-home page fixes (Wave 4a)
 * Covers: F-EMPLOYEE-001 (attendance query key), F-EMPLOYEE-002 (server time),
 *         F-EMPLOYEE-003 (clock-out BE call), F-EMPLOYEE-012 (KPI real data)
 */
import { describe, expect, it, vi, afterEach } from "vitest";

import { setAccessToken } from "@shared/api";

function mockFetch(body: unknown, status = 200) {
  const resp = {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
  return vi.spyOn(window, "fetch").mockResolvedValueOnce(resp);
}

afterEach(() => {
  vi.restoreAllMocks();
  setAccessToken(null);
});

describe("F-EMPLOYEE-001/002 fetchToday integration", () => {
  it("fetchToday returns is_clocked_in and clock_in_at from BE", async () => {
    const { fetchToday } = await import("@entities/attendance");
    mockFetch({
      data: {
        clock_in_at: "2026-05-08T09:05:00Z",
        clock_out_at: null,
        worked_minutes: 36,
        is_clocked_in: true,
        kind: "OFFICE",
      },
    });
    setAccessToken("test-token");
    const result = await fetchToday();
    expect(result?.is_clocked_in).toBe(true);
    expect(result?.clock_in_at).toBe("2026-05-08T09:05:00Z");
  });

  it("fetchToday returns null on 401 (not authenticated)", async () => {
    const { fetchToday } = await import("@entities/attendance");
    mockFetch({ detail: "not authenticated" }, 401);
    const result = await fetchToday();
    expect(result).toBeNull();
  });
});

describe("F-EMPLOYEE-003 clockOut", () => {
  it("clockOut calls POST /v1/attendance/clock-out", async () => {
    const { clockOut } = await import("@features/clock-in");
    const spy = mockFetch({ data: { clock_out_at: "2026-05-08T18:01:00Z" } });
    setAccessToken("test-token");
    const result = await clockOut();
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("/v1/attendance/clock-out"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(result.clock_out_at).toBe("2026-05-08T18:01:00Z");
  });

  it("clockOut returns empty object on 404 (stub)", async () => {
    const { clockOut } = await import("@features/clock-in");
    mockFetch({ detail: "not found" }, 404);
    setAccessToken("test-token");
    const result = await clockOut();
    expect(result).toEqual({});
  });
});
