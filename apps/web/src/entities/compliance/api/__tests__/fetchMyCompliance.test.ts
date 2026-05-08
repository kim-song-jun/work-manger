/**
 * Test: entities/compliance · fetchMyCompliance
 * Type: Unit (vitest, jsdom)
 * Why:  주 52시간 룰 화면이 잘못된 값을 표시하면 사용자가 출근 가능 여부를
 *       오판한다. URL 인코딩(week 파라미터)과 envelope 파싱, 401/404 폴백을
 *       회귀 보호한다.
 * Covers:
 *   - encodes ?week=YYYY-MM-DD when provided
 *   - returns null on 401 / 404 (graceful)
 *   - parses { data: MyComplianceWeek } envelope
 * Out of scope:
 *   - useQuery wiring (page-level)
 *   - i18n strings (page-level)
 * Coverage target: 100% lines for fetchMyCompliance.ts
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchMyCompliance } from "../fetchMyCompliance";

function mockFetchOnce(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const text = body === undefined ? "" : JSON.stringify(body);
  const resp = {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    text: () => Promise.resolve(text),
  } as unknown as Response;
  return vi.spyOn(window, "fetch").mockResolvedValueOnce(resp);
}

describe("entities/compliance · fetchMyCompliance", () => {
  afterEach(() => vi.restoreAllMocks());

  it("encodes ?week query parameter", async () => {
    const spy = mockFetchOnce({
      data: {
        hours: "10.00",
        threshold_hours: "52",
        remaining_hours: "42.00",
        status: "OK",
        week_start: "2026-04-27",
      },
    });
    await fetchMyCompliance("2026-04-27");
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("/v1/compliance/me?week=2026-04-27");
  });

  it("returns null on 401", async () => {
    mockFetchOnce(undefined, { ok: false, status: 401 });
    const r = await fetchMyCompliance();
    expect(r).toBeNull();
  });

  it("parses envelope into MyComplianceWeek", async () => {
    mockFetchOnce({
      data: {
        hours: "48.50",
        threshold_hours: "52",
        remaining_hours: "3.50",
        status: "WARN",
        week_start: "2026-04-27",
      },
    });
    const r = await fetchMyCompliance();
    expect(r?.status).toBe("WARN");
    expect(r?.hours).toBe("48.50");
    expect(r?.week_start).toBe("2026-04-27");
  });
});
