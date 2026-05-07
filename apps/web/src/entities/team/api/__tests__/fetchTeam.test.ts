/**
 * Test: entities/team - fetchTeam
 * Type: Unit (vitest, jsdom)
 * Why: The web dashboard consumes /v1/team/status as an array, while the
 *      backend returns a dated object with items.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { setAccessToken } from "@shared/api";
import { fetchTeam } from "../fetchTeam";

function mockFetchOnce(body: unknown) {
  const resp = {
    ok: true,
    status: 200,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
  return vi.spyOn(window, "fetch").mockResolvedValueOnce(resp);
}

describe("entities/team - fetchTeam", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setAccessToken(null);
  });

  it("normalizes backend status object items into TeamMember rows", async () => {
    mockFetchOnce({
      data: {
        date: "2026-05-05",
        items: [
          {
            membership_id: "mem-1",
            name: "Kim",
            department: "Engineering",
            status: "office",
          },
        ],
      },
    });

    await expect(fetchTeam()).resolves.toEqual([
      {
        id: "mem-1",
        name: "Kim",
        team: "Engineering",
        status: "office",
      },
    ]);
  });
});
