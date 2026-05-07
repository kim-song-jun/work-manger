import { api } from "@shared/api";
import type { Employee, EmployeeListQuery } from "../model/types";

type Envelope<T> = { data: T };
type BackendEmployee = Employee & {
  department_name?: string | null;
  is_active?: boolean;
  hired_at?: string | null;
};

function normalizeEmployee(row: BackendEmployee): Employee {
  return {
    ...row,
    team: row.team ?? row.department_name ?? row.department ?? null,
    department: row.department ?? row.department_name ?? null,
    joined_at: row.joined_at ?? row.hired_at ?? null,
    active: row.active ?? row.is_active,
  };
}

/**
 * GET /v1/admin/employees?q=&role=
 *
 * Returns the admin-visible employee directory.
 */
export async function fetchEmployees(
  query: EmployeeListQuery = {},
): Promise<Employee[]> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.role && query.role !== "ALL") params.set("role", query.role);
  const qs = params.toString();
  const path = `/v1/admin/employees${qs ? `?${qs}` : ""}`;
  const r = await api<Envelope<BackendEmployee[]>>(path);
  return Array.isArray(r.data) ? r.data.map(normalizeEmployee) : [];
}
