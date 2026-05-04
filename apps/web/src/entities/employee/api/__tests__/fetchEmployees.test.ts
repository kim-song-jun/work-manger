/**
 * Test: entities/employee · fetchEmployees
 * Type: Unit (vitest, jsdom)
 * Why:  Admin directory drives every other admin screen. URL composition for
 *       q + role and the empty-on-404 fallback are load-bearing — a wrong
 *       query string drops the search input or filters the wrong column.
 * Covers:
 *   - GET /v1/admin/employees with no params
 *   - URL encodes q and role as query string
 *   - "ALL" sentinel does not emit role param
 *   - 404 returns [] instead of throwing
 *   - Parses Envelope<Employee[]> shape
 * Out of scope:
 *   - React-query caching (covered by RTL page tests)
 *   - Auth header (covered by shared/api · client tests)
 * Coverage target: 100% lines for fetchEmployees.ts
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchEmployees } from "../fetchEmployees";
import { setAccessToken } from "@shared/api";

function mockFetchOnce(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const text = body === undefined ? "" : JSON.stringify(body);
  const resp = {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    text: () => Promise.resolve(text),
  } as unknown as Response;
  return vi.spyOn(window, "fetch").mockResolvedValueOnce(resp);
}

describe("entities/employee · fetchEmployees", () => {
  beforeEach(() => {
    setAccessToken(null);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("GET /v1/admin/employees with no query params", async () => {
    const spy = mockFetchOnce({ data: [] });
    await fetchEmployees();
    const url = spy.mock.calls[0][0] as string;
    // VITE_API_URL may prefix the base; assert path suffix only.
    expect(url.endsWith("/v1/admin/employees")).toBe(true);
  });

  it("encodes q and role as query string", async () => {
    const spy = mockFetchOnce({ data: [] });
    await fetchEmployees({ q: "이도현", role: "MANAGER" });
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("/v1/admin/employees?");
    expect(url).toContain("q=");
    expect(url).toContain(encodeURIComponent("이도현"));
    expect(url).toContain("role=MANAGER");
  });

  it("does not include role param when role is ALL", async () => {
    const spy = mockFetchOnce({ data: [] });
    await fetchEmployees({ q: "kim", role: "ALL" });
    const url = spy.mock.calls[0][0] as string;
    expect(url).not.toContain("role=");
    expect(url).toContain("q=kim");
  });

  it("returns [] on 404 instead of throwing", async () => {
    mockFetchOnce(undefined, { ok: false, status: 404 });
    const r = await fetchEmployees({ q: "missing" });
    expect(r).toEqual([]);
  });

  it("parses Envelope<Employee[]> and returns data array", async () => {
    mockFetchOnce({
      data: [
        { id: "u1", name: "Kim", email: "kim@x.com", role: "EMPLOYEE", active: true },
        { id: "u2", name: "Lee", email: "lee@x.com", role: "ADMIN", active: true },
      ],
    });
    const r = await fetchEmployees();
    expect(r).toHaveLength(2);
    expect(r[0].id).toBe("u1");
    expect(r[1].role).toBe("ADMIN");
  });
});
