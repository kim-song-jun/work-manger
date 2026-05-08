/**
 * Test: entities/employee - fetchEmployees
 * Type: Unit (vitest, jsdom)
 * Why: Admin directory drives every other admin screen. URL composition for
 *      q + role must stay stable, and broken endpoints should surface as
 *      errors instead of rendering a misleading empty directory.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setAccessToken } from "@shared/api";

import { fetchEmployees } from "../fetchEmployees";

function mockFetchOnce(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const text = body === undefined ? "" : JSON.stringify(body);
  const resp = {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    text: () => Promise.resolve(text),
  } as unknown as Response;
  return vi.spyOn(window, "fetch").mockResolvedValueOnce(resp);
}

describe("entities/employee - fetchEmployees", () => {
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
    expect(url.endsWith("/v1/admin/employees")).toBe(true);
  });

  it("encodes q and role as query string", async () => {
    const spy = mockFetchOnce({ data: [] });
    await fetchEmployees({ q: "Lee & Kim", role: "MANAGER" });
    const url = spy.mock.calls[0][0] as string;
    const parsed = new URL(url, "http://local");
    expect(url).toContain("/v1/admin/employees?");
    expect(parsed.searchParams.get("q")).toBe("Lee & Kim");
    expect(parsed.searchParams.get("role")).toBe("MANAGER");
  });

  it("does not include role param when role is ALL", async () => {
    const spy = mockFetchOnce({ data: [] });
    await fetchEmployees({ q: "kim", role: "ALL" });
    const url = spy.mock.calls[0][0] as string;
    expect(url).not.toContain("role=");
    expect(url).toContain("q=kim");
  });

  it("throws on 404 instead of hiding a broken endpoint", async () => {
    mockFetchOnce(
      { error: { code: "RESOURCE_NOT_FOUND", message: "not found" } },
      { ok: false, status: 404 },
    );
    await expect(fetchEmployees({ q: "missing" })).rejects.toThrow("not found");
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

  it("maps backend employee field names into UI fields", async () => {
    mockFetchOnce({
      data: [
        {
          id: "u1",
          name: "Kim",
          email: "kim@x.com",
          role: "EMPLOYEE",
          department_name: "Engineering",
          hired_at: "2026-01-01",
          is_active: false,
        },
      ],
    });

    await expect(fetchEmployees()).resolves.toMatchObject([
      {
        id: "u1",
        team: "Engineering",
        department: "Engineering",
        joined_at: "2026-01-01",
        active: false,
      },
    ]);
  });
});
