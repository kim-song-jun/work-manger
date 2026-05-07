/**
 * Test: entities/overtime API
 * Type: Unit (vitest, jsdom)
 * Why: Overtime flows must use the real backend contract. A stale fallback
 *      hides broken endpoints and turns failed submissions into fake success.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { setAccessToken } from "@shared/api";
import {
  fetchOvertimeHistory,
  fetchOvertimeSettings,
  postOvertimeRequest,
  updateOvertimeSettings,
} from "../overtime";

function mockFetchOnce(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const text = body === undefined ? "" : JSON.stringify(body);
  const resp = {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    text: () => Promise.resolve(text),
  } as unknown as Response;
  return vi.spyOn(window, "fetch").mockResolvedValueOnce(resp);
}

describe("entities/overtime API", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setAccessToken(null);
  });

  it("posts overtime requests to /v1/overtime/requests", async () => {
    const spy = mockFetchOnce(
      {
        data: {
          id: "ot-1",
          work_date: "2026-05-05",
          requested_minutes: 90,
          reason: "release",
          status: "PENDING",
        },
      },
      { status: 201 },
    );

    const result = await postOvertimeRequest({
      work_date: "2026-05-05",
      requested_minutes: 90,
      reason: "release",
    });

    expect(result.id).toBe("ot-1");
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/v1/overtime/requests");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toMatchObject({
      work_date: "2026-05-05",
      requested_minutes: 90,
    });
  });

  it("throws on 404 instead of returning a stub overtime request", async () => {
    mockFetchOnce(
      { error: { code: "RESOURCE_NOT_FOUND", message: "not found" } },
      { ok: false, status: 404 },
    );

    await expect(
      postOvertimeRequest({
        work_date: "2026-05-05",
        requested_minutes: 90,
        reason: "release",
      }),
    ).rejects.toThrow("not found");
  });

  it("unwraps monthly overtime history", async () => {
    mockFetchOnce({
      data: {
        months: [{ ym: "2026-05", approved_minutes: 120, approved_count: 2 }],
      },
    });

    await expect(fetchOvertimeHistory()).resolves.toEqual([
      { ym: "2026-05", approved_minutes: 120, approved_count: 2 },
    ]);
  });

  it("maps backend overtime settings into the UI model", async () => {
    mockFetchOnce({
      data: {
        auto_request_enabled: true,
        trigger_after_minutes: 10,
        max_weekly_minutes: 720,
      },
    });

    await expect(fetchOvertimeSettings()).resolves.toEqual({
      auto_enabled: true,
      auto_threshold_minutes: 10,
    });
  });

  it("updates settings with PATCH using backend field names", async () => {
    const spy = mockFetchOnce({
      data: {
        auto_request_enabled: false,
        trigger_after_minutes: 45,
      },
    });

    const result = await updateOvertimeSettings({
      auto_enabled: false,
      auto_threshold_minutes: 45,
    });

    expect(result).toEqual({ auto_enabled: false, auto_threshold_minutes: 45 });
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/v1/overtime/settings");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({
      auto_request_enabled: false,
      trigger_after_minutes: 45,
    });
  });
});
