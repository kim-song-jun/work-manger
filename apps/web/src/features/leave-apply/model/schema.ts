import { z } from "zod";

const dateRe = /^\d{4}-\d{2}-\d{2}$/;

export const leaveApplySchema = z
  .object({
    starts_on: z.string().regex(dateRe, "YYYY-MM-DD"),
    ends_on: z.string().regex(dateRe, "YYYY-MM-DD"),
    kind: z.enum(["FULL", "AM_HALF", "PM_HALF"]),
    reason: z.string().max(500).optional(),
  })
  .refine((v) => v.ends_on >= v.starts_on, {
    message: "leave_apply.invalid_dates",
    path: ["ends_on"],
  });

export type LeaveApplyValues = z.infer<typeof leaveApplySchema>;
