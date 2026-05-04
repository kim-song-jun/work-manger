import { z } from "zod";

export const overtimeSchema = z.object({
  work_date: z.string().min(1, "date_required"),
  requested_minutes: z
    .number({ invalid_type_error: "minutes_required" })
    .int()
    .min(1, "minutes_min")
    .max(720, "minutes_max"),
  reason: z.string().min(1, "reason_required").max(500),
});

export type OvertimeFormValues = z.infer<typeof overtimeSchema>;
