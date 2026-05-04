import { z } from "zod";

const dateRe = /^\d{4}-\d{2}-\d{2}$/;

export const tripRequestSchema = z
  .object({
    kind: z.enum(["BUSINESS_TRIP", "FIELD_WORK"]),
    start_date: z.string().regex(dateRe, "YYYY-MM-DD"),
    end_date: z.string().regex(dateRe, "YYYY-MM-DD"),
    location_label: z.string().min(1, "trip.errors.location_required").max(200),
    purpose: z.string().max(4000).optional(),
  })
  .refine((v) => v.end_date >= v.start_date, {
    message: "trip.errors.invalid_range",
    path: ["end_date"],
  });

export type TripRequestValues = z.infer<typeof tripRequestSchema>;
