import { api, HttpError } from "@shared/api";
import type { EmployeeDetail } from "../model/types";

type Envelope<T> = { data: T };

/** GET /v1/admin/employees/{id} — detail with leave + 30d attendance. */
export async function fetchEmployeeDetail(
  id: string,
): Promise<EmployeeDetail | null> {
  try {
    const r = await api<Envelope<EmployeeDetail>>(`/v1/admin/employees/${id}`);
    return r.data;
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }
}
