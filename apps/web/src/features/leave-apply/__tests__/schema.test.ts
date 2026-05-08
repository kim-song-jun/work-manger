/**
 * Tests: leave-apply schema — F-EMPLOYEE-007
 * Verifies that invalid date format returns the i18n key, not raw "YYYY-MM-DD".
 */
import { describe, expect, it } from "vitest";
import { leaveApplySchema } from "../model/schema";

describe("F-EMPLOYEE-007 leaveApplySchema error messages", () => {
  it("start_date regex failure returns i18n key not raw format hint", () => {
    const result = leaveApplySchema.safeParse({
      start_date: "not-a-date",
      end_date: "2026-05-08",
      kind: "FULL",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues[0]?.message;
      expect(msg).toBe("leave_apply.invalid_dates");
      expect(msg).not.toBe("YYYY-MM-DD");
    }
  });

  it("end_date < start_date returns leave_apply.invalid_dates", () => {
    const result = leaveApplySchema.safeParse({
      start_date: "2026-05-10",
      end_date: "2026-05-08",
      kind: "FULL",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues[0]?.message;
      expect(msg).toBe("leave_apply.invalid_dates");
    }
  });

  it("valid inputs pass validation", () => {
    const result = leaveApplySchema.safeParse({
      start_date: "2026-05-08",
      end_date: "2026-05-09",
      kind: "AM_HALF",
    });
    expect(result.success).toBe(true);
  });
});
