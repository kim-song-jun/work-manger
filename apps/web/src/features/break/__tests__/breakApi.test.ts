/**
 * Tests: features/break — F-EMPLOYEE-004
 * Verifies that startBreak/endBreak call the correct BE endpoints.
 */
import { describe, expect, it, vi, afterEach } from "vitest";

import { setAccessToken } from "@shared/api";

function mockFetch(body: unknown, status = 200) {
  const resp = {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
  return vi.spyOn(window, "fetch").mockResolvedValueOnce(resp);
}

afterEach(() => {
  vi.restoreAllMocks();
  setAccessToken(null);
});

describe("F-EMPLOYEE-004 break API", () => {
  it("startBreak calls POST /v1/attendance/break/start", async () => {
    const { startBreak } = await import("../api/breakApi");
    const spy = mockFetch({ data: { ok: true } });
    setAccessToken("test-token");
    await startBreak();
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("/v1/attendance/break/start"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("endBreak calls POST /v1/attendance/break/end", async () => {
    const { endBreak } = await import("../api/breakApi");
    const spy = mockFetch({ data: { ok: true } });
    setAccessToken("test-token");
    await endBreak();
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("/v1/attendance/break/end"),
      expect.objectContaining({ method: "POST" }),
    );
  });
});
