import { api, HttpError } from "@shared/api";
import type { Employee, EmployeeListQuery } from "../model/types";

type Envelope<T> = { data: T };

/**
 * GET /v1/admin/employees?q=&role=
 *
 * Returns the admin-visible employee directory. Treats 404 as empty list so
 * the UI can render its empty state while the backend stub matures.
 */
export async function fetchEmployees(
  query: EmployeeListQuery = {},
): Promise<Employee[]> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.role && query.role !== "ALL") params.set("role", query.role);
  const qs = params.toString();
  const path = `/v1/admin/employees${qs ? `?${qs}` : ""}`;
  try {
    const r = await api<Envelope<Employee[]>>(path);
    return Array.isArray(r.data) ? r.data : [];
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return [];
    throw e;
  }
}
