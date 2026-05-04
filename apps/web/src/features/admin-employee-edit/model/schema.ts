import { z } from "zod";

export const ROLES = ["EMPLOYEE", "MANAGER", "ADMIN", "OWNER"] as const;
export type RoleValue = (typeof ROLES)[number];

/**
 * Zod schema for the admin employee edit form.
 *
 * Position / department are kept as nullable strings; empty strings are
 * normalized to null in the submit handler so the form input type matches
 * the resolver output type (avoids RHF Resolver generic mismatch).
 */
export const employeeEditSchema = z.object({
  role: z.enum(ROLES, { required_error: "emp_role_required" }),
  position: z.string().max(50, "emp_position_too_long").nullable(),
  department: z.string().max(50, "emp_department_too_long").nullable(),
  active: z.boolean(),
});

export type EmployeeEditValues = z.infer<typeof employeeEditSchema>;
export type EmployeeEditOutput = EmployeeEditValues;

/** Normalize "" → null for nullable text fields prior to submit. */
export function normalizeEmployeeEdit(
  v: EmployeeEditValues,
): EmployeeEditOutput {
  return {
    role: v.role,
    position: v.position && v.position.length > 0 ? v.position : null,
    department: v.department && v.department.length > 0 ? v.department : null,
    active: v.active,
  };
}
