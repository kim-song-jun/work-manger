/**
 * Test: entities/attendance - fetchRecords
 * Type: Unit (vitest, jsdom)
 * Why: The records list feeds web dashboard, web records, and record detail
 *      navigation. The backend pagination cursor lives under meta.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { setAccessToken } from "@shared/api";

import { fetchRecords } from "../fetchRecords";

function mockFetchOnce(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const text = body === undefined ? "" : JSON.stringify(body);
  const resp = {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    text: () => Promise.resolve(text),
  } as unknown as Response;
  return vi.spyOn(window, "fetch").mockResolvedValueOnce(resp);
}

describe("entities/attendance - fetchRecords", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setAccessToken(null);
  });

  it("unwraps records and meta.next_cursor", async () => {
    mockFetchOnce({
      data: [
        {
          id: "rec-1",
          work_date: "2026-05-05",
          clock_in_at: null,
          clock_out_at: null,
          total_minutes: 0,
          status: "OK",
        },
      ],
      meta: { next_cursor: "cursor-2" },
    });

    await expect(fetchRecords({ limit: 1 })).resolves.toMatchObject({
      items: [{ id: "rec-1" }],
      nextCursor: "cursor-2",
    });
  });

  it("normalizes backend record field names and statuses", async () => {
    mockFetchOnce({
      data: [
        {
          id: "rec-1",
          work_date: "2026-05-05",
          clock_in_at: "2026-05-05T09:00:00+09:00",
          clock_out_at: null,
          clock_in_kind: "OFFICE",
          matched_location: { label: "HQ" },
          is_late: false,
          total_work_minutes: null,
          status: "WORKING",
        },
      ],
      meta: { next_cursor: null },
    });

    await expect(fetchRecords({ limit: 1 })).resolves.toMatchObject({
      items: [
        {
          id: "rec-1",
          status: "LIVE",
          total_minutes: null,
          kind: "OFFICE",
          location_label: "HQ",
        },
      ],
    });
  });

  it("throws on 404 instead of hiding a broken records endpoint", async () => {
    mockFetchOnce(
      { error: { code: "RESOURCE_NOT_FOUND", message: "not found" } },
      { ok: false, status: 404 },
    );

    await expect(fetchRecords()).rejects.toThrow("not found");
  });
});
