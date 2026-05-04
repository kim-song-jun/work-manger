import { z } from "zod";

const dateRe = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Leave application schema. Field names match the BE
 * (`apps/leave/serializers.LeaveRequestCreateSerializer`) so the form
 * submits the body shape the API expects without an alias layer.
 */
export const leaveApplySchema = z
  .object({
    start_date: z.string().regex(dateRe, "YYYY-MM-DD"),
    end_date: z.string().regex(dateRe, "YYYY-MM-DD"),
    kind: z.enum(["FULL", "AM_HALF", "PM_HALF"]),
    reason: z.string().max(500).optional(),
  })
  .refine((v) => v.end_date >= v.start_date, {
    message: "leave_apply.invalid_dates",
    path: ["end_date"],
  });

export type LeaveApplyValues = z.infer<typeof leaveApplySchema>;
