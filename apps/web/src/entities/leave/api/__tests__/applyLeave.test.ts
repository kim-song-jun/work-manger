/**
 * Test: entities/leave - applyLeave
 * Type: Unit (vitest, jsdom)
 * Why: Leave submission must call the real backend endpoint and surface 4xx
 *      failures instead of manufacturing a fake success.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { setAccessToken } from "@shared/api";
import { applyLeave } from "../applyLeave";

function mockFetchOnce(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const text = body === undefined ? "" : JSON.stringify(body);
  const resp = {
    ok: init.ok ?? true,
    status: init.status ?? 201,
    text: () => Promise.resolve(text),
  } as unknown as Response;
  return vi.spyOn(window, "fetch").mockResolvedValueOnce(resp);
}

describe("entities/leave - applyLeave", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setAccessToken(null);
  });

  it("posts start_date/end_date to /v1/leave/requests", async () => {
    const spy = mockFetchOnce({
      data: {
        id: "leave-1",
        start_date: "2026-05-11",
        end_date: "2026-05-12",
        kind: "FULL",
        days: "2.00",
        reason: "rest",
        status: "PENDING",
      },
    });

    const result = await applyLeave({
      start_date: "2026-05-11",
      end_date: "2026-05-12",
      kind: "FULL",
      reason: "rest",
    });

    expect(result.id).toBe("leave-1");
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/v1/leave/requests");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      start_date: "2026-05-11",
      end_date: "2026-05-12",
      kind: "FULL",
      reason: "rest",
    });
  });

  it("throws on 404 instead of returning a stub request", async () => {
    mockFetchOnce(
      { error: { code: "RESOURCE_NOT_FOUND", message: "not found" } },
      { ok: false, status: 404 },
    );

    await expect(
      applyLeave({
        start_date: "2026-05-11",
        end_date: "2026-05-12",
        kind: "FULL",
      }),
    ).rejects.toThrow("not found");
  });
});
