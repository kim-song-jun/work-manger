/**
 * Test: entities/leave - fetchBalance
 * Type: Unit (vitest, jsdom)
 * Why: The backend exposes granted_total and expiring_soon, while the UI
 *      consumes accrued and expiring. This adapter keeps every leave page on
 *      the real API shape.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { setAccessToken } from "@shared/api";
import { fetchBalance } from "../fetchBalance";

function mockFetchOnce(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const text = body === undefined ? "" : JSON.stringify(body);
  const resp = {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    text: () => Promise.resolve(text),
  } as unknown as Response;
  return vi.spyOn(window, "fetch").mockResolvedValueOnce(resp);
}

describe("entities/leave - fetchBalance", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setAccessToken(null);
  });

  it("maps backend balance fields to the UI model", async () => {
    mockFetchOnce({
      data: {
        granted_total: "15.00",
        used: "2.50",
        remaining: "12.50",
        expiring_soon: [{ days: "1.00" }, { days: "0.50" }],
      },
    });

    await expect(fetchBalance()).resolves.toEqual({
      accrued: 15,
      used: 2.5,
      remaining: 12.5,
      expiring: 1.5,
    });
  });

  it("passes employee_id for admin per-employee balance checks", async () => {
    const spy = mockFetchOnce({
      data: { granted_total: "7", used: "0", remaining: "7", expiring_soon: [] },
    });

    await fetchBalance({ employeeId: "member-1" });

    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("/v1/leave/balance?");
    expect(new URL(url, "http://local").searchParams.get("employee_id")).toBe(
      "member-1",
    );
  });
});
