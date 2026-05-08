import { api } from "@shared/api";

import type { EmployeeDetail, EmployeeUpdatePatch } from "../model/types";

type Envelope<T> = { data: T };

/** PATCH /v1/admin/employees/{id}/update */
export async function updateEmployee(
  id: string,
  patch: EmployeeUpdatePatch,
): Promise<EmployeeDetail> {
  const r = await api<Envelope<EmployeeDetail>>(
    `/v1/admin/employees/${id}/update`,
    { method: "PATCH", json: patch },
  );
  return r.data;
}

/** POST /v1/admin/employees/{id}/deactivate */
export async function deactivateEmployee(id: string): Promise<void> {
  await api(`/v1/admin/employees/${id}/deactivate`, { method: "POST" });
}
