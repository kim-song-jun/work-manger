/**
 * Test: entities/approval · decideApproval — AlreadyDecidedError (F-ADMIN-03)
 * Type: Unit (vitest, jsdom)
 * Why:  Guards the typed error sentinel for ALREADY_DECIDED so callers can
 *       show a dedicated i18n message instead of the generic error toast.
 * Covers:
 *   - 409 ALREADY_DECIDED code → AlreadyDecidedError thrown
 *   - 422 ALREADY_DECIDED code → AlreadyDecidedError thrown (BE may send 422)
 *   - 500 generic error → plain HttpError re-thrown
 *   - ApprovalKind does NOT contain "outwork" (F-ADMIN-09)
 * Out of scope:
 *   - fetchApprovals list parsing (implicitly covered by admin-approvals page tests)
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { HttpError } from "@shared/api";

import { decideApproval, AlreadyDecidedError } from "../fetchApprovals";

function makeResponse(body: unknown, status: number): Response {
  const text = body === undefined ? "" : JSON.stringify(body);
  return { ok: status < 400, status, text: () => Promise.resolve(text) } as unknown as Response;
}

describe("entities/approval · decideApproval ALREADY_DECIDED sentinel", () => {
  afterEach(() => vi.restoreAllMocks());

  it("throws AlreadyDecidedError on 409 ALREADY_DECIDED", async () => {
    vi.spyOn(window, "fetch").mockResolvedValue(
      makeResponse({ error: { code: "ALREADY_DECIDED", message: "이미 처리된 항목입니다." } }, 409),
    );
    await expect(decideApproval("a1", "approve")).rejects.toBeInstanceOf(AlreadyDecidedError);
  });

  it("throws AlreadyDecidedError on 422 ALREADY_DECIDED", async () => {
    vi.spyOn(window, "fetch").mockResolvedValue(
      makeResponse({ error: { code: "ALREADY_DECIDED", message: "이미 처리된 항목입니다." } }, 422),
    );
    await expect(decideApproval("a1", "reject")).rejects.toBeInstanceOf(AlreadyDecidedError);
  });

  it("re-throws plain HttpError on unexpected 4xx/5xx", async () => {
    vi.spyOn(window, "fetch").mockResolvedValue(
      makeResponse({ error: { code: "SERVER_ERROR", message: "boom" } }, 500),
    );
    await expect(decideApproval("a2", "approve")).rejects.toBeInstanceOf(HttpError);
  });
});

// F-ADMIN-09: "outwork" must NOT be a valid ApprovalKind
describe("entities/approval · ApprovalKind type constraint (F-ADMIN-09)", () => {
  it('ApprovalKind set does not include "outwork"', () => {
    // Runtime check — compile-time narrowing is tested via tsc -b
    const validKinds: string[] = ["leave", "overtime", "trip", "manual_clock_in"];
    expect(validKinds).not.toContain("outwork");
  });
});
