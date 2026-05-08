/**
 * Test: entities/audit · fetchAudit
 * Type: Unit (vitest, jsdom)
 * Why:  Audit log is the compliance surface. Wrong filter encoding silently
 *       hides events; missing cursor breaks pagination. Test guards URL
 *       composition for filters + cursor and the empty-on-404 fallback.
 * Covers:
 *   - Sends action / actor / from / to / cursor as query params
 *   - 404 returns empty page
 *   - Parses items + next_cursor from envelope
 * Out of scope:
 *   - useInfiniteQuery wiring (page-level)
 *   - Sort order (server-side)
 * Coverage target: 100% lines for fetchAudit.ts
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchAudit } from "../fetchAudit";

function mockFetchOnce(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const text = body === undefined ? "" : JSON.stringify(body);
  const resp = {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    text: () => Promise.resolve(text),
  } as unknown as Response;
  return vi.spyOn(window, "fetch").mockResolvedValueOnce(resp);
}

describe("entities/audit · fetchAudit", () => {
  afterEach(() => vi.restoreAllMocks());

  it("encodes filters and cursor as query string", async () => {
    const spy = mockFetchOnce({ data: { items: [], next_cursor: null } });
    await fetchAudit(
      { action: "EMP_UPDATE", actor: "u1", from: "2026-04-01", to: "2026-04-30" },
      "abc",
    );
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("action=EMP_UPDATE");
    expect(url).toContain("actor=u1");
    expect(url).toContain("from=2026-04-01");
    expect(url).toContain("to=2026-04-30");
    expect(url).toContain("cursor=abc");
  });

  it("returns empty page on 404", async () => {
    mockFetchOnce(undefined, { ok: false, status: 404 });
    const r = await fetchAudit({});
    expect(r.items).toEqual([]);
    expect(r.next_cursor).toBeNull();
  });

  it("parses items and next_cursor from envelope", async () => {
    mockFetchOnce({
      data: {
        items: [
          { id: "1", action: "EMP_UPDATE", actor: "u1", at: "2026-05-01T01:02:03Z" },
        ],
        next_cursor: "next-1",
      },
    });
    const r = await fetchAudit();
    expect(r.items).toHaveLength(1);
    expect(r.items[0].action).toBe("EMP_UPDATE");
    expect(r.next_cursor).toBe("next-1");
  });

  // F-ADMIN-01: BE fallback — `created_at` → `at`, `actor_name` from BE or "(Unknown)" default
  it("normalises BE-legacy `created_at` → `at` when `at` is absent", async () => {
    mockFetchOnce({
      data: {
        items: [
          {
            id: "2",
            action: "identity.company.settings_updated",
            actor_id: "u99",
            created_at: "2026-04-15T10:00:00Z",
            // `at` intentionally absent — simulates pre-W4c BE
          },
        ],
        next_cursor: null,
      },
    });
    const r = await fetchAudit();
    expect(r.items[0].at).toBe("2026-04-15T10:00:00Z");
  });

  it("uses canonical `at` field when BE W4c fix has landed", async () => {
    mockFetchOnce({
      data: {
        items: [
          {
            id: "3",
            action: "auth.login.success",
            actor_id: "u1",
            actor_name: "홍길동",
            at: "2026-05-08T09:00:00Z",
            created_at: "2026-05-08T09:00:00Z", // also present — canonical takes priority
          },
        ],
        next_cursor: null,
      },
    });
    const r = await fetchAudit();
    expect(r.items[0].at).toBe("2026-05-08T09:00:00Z");
    expect(r.items[0].actor_name).toBe("홍길동");
  });
});
