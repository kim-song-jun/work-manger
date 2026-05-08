import { z } from "zod";

const dateRe = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Leave application schema. Field names match the BE
 * (`apps/leave/serializers.LeaveRequestCreateSerializer`) so the form
 * submits the body shape the API expects without an alias layer.
 */
export const leaveApplySchema = z
  .object({
    // F-EMPLOYEE-007: use i18n key instead of raw format hint so UI renders translated error
    start_date: z.string().regex(dateRe, "leave_apply.invalid_dates"),
    end_date: z.string().regex(dateRe, "leave_apply.invalid_dates"),
    kind: z.enum(["FULL", "AM_HALF", "PM_HALF"]),
    // iter13 T3: COMP / ANNUAL etc. — optional so legacy callers default to ANNUAL on BE
    leave_type: z.enum(["ANNUAL", "COMP", "SICK", "PERSONAL"]).optional(),
    reason: z.string().max(500).optional(),
  })
  .refine((v) => v.end_date >= v.start_date, {
    message: "leave_apply.invalid_dates",
    path: ["end_date"],
  });

export type LeaveApplyValues = z.infer<typeof leaveApplySchema>;
