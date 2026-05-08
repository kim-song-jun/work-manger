/**
 * Tests: entities/team/api/fetchTeamStatus — F-MANAGER-13
 * Verifies that fetch functions correctly map BE envelope shape to FE types.
 * BE returns { data: { date, items|groups|rows } } — FE must extract the array.
 */
import { describe, expect, it, vi, afterEach } from "vitest";

import { setAccessToken } from "@shared/api";

function mockFetch(body: unknown) {
  const resp = {
    ok: true,
    status: 200,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
  return vi.spyOn(window, "fetch").mockResolvedValueOnce(resp);
}

afterEach(() => {
  vi.restoreAllMocks();
  setAccessToken(null);
});

describe("F-MANAGER-13 fetchTeamGrid BE shape mapping", () => {
  it("extracts items from {data: {date, items}} envelope", async () => {
    const { fetchTeamGrid } = await import("../fetchTeamStatus");
    mockFetch({
      data: {
        date: "2026-05-08",
        items: [
          { id: "u-1", name: "이수현", status: "office", team: "Design" },
        ],
      },
    });
    setAccessToken("test-token");
    const result = await fetchTeamGrid();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("이수현");
  });

  it("returns [] on 401 (not yet authenticated)", async () => {
    const { fetchTeamGrid } = await import("../fetchTeamStatus");
    vi.spyOn(window, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: () => Promise.resolve(JSON.stringify({ detail: "not auth" })),
    } as unknown as Response);
    setAccessToken(null);
    const result = await fetchTeamGrid();
    expect(result).toEqual([]);
  });
});

describe("F-MANAGER-13 fetchTeamGrouped BE shape mapping", () => {
  it("extracts groups from {data: {date, groups}} envelope", async () => {
    const { fetchTeamGrouped } = await import("../fetchTeamStatus");
    mockFetch({
      data: {
        date: "2026-05-08",
        groups: [
          {
            team: "Engineering",
            members: [{ id: "u-2", name: "박서연", status: "wfh" }],
          },
        ],
      },
    });
    setAccessToken("test-token");
    const result = await fetchTeamGrouped();
    expect(result).toHaveLength(1);
    expect(result[0].team).toBe("Engineering");
    expect(result[0].members[0].name).toBe("박서연");
  });
});

describe("F-MANAGER-13 fetchTeamTimeline BE shape mapping", () => {
  it("extracts rows and now_minute from {data: {date, rows, now_minute}} envelope", async () => {
    const { fetchTeamTimeline } = await import("../fetchTeamStatus");
    mockFetch({
      data: {
        date: "2026-05-08",
        now_minute: 600,
        rows: [
          {
            member: { id: "u-1", name: "이수현", status: "office" },
            blocks: [{ start_minute: 540, end_minute: 720, kind: "office" }],
          },
        ],
      },
    });
    setAccessToken("test-token");
    const result = await fetchTeamTimeline();
    expect(result.now_minute).toBe(600);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].member.name).toBe("이수현");
  });

  it("falls back to events key if rows key absent", async () => {
    const { fetchTeamTimeline } = await import("../fetchTeamStatus");
    mockFetch({
      data: {
        date: "2026-05-08",
        now_minute: 540,
        events: [
          {
            member: { id: "u-2", name: "박서연", status: "wfh" },
            blocks: [],
          },
        ],
      },
    });
    setAccessToken("test-token");
    const result = await fetchTeamTimeline();
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].member.name).toBe("박서연");
  });
});
