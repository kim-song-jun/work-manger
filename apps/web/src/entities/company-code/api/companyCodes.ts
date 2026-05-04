import { api, HttpError } from "@shared/api";
import type { CompanyCode } from "../model/types";

type Envelope<T> = { data: T };

/** GET /v1/admin/company-codes */
export async function fetchCompanyCodes(): Promise<CompanyCode[]> {
  try {
    const r = await api<Envelope<CompanyCode[]>>("/v1/admin/company-codes");
    return Array.isArray(r.data) ? r.data : [];
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return [];
    throw e;
  }
}

/** POST /v1/admin/company-codes */
export async function createCompanyCode(input: {
  expires_at?: string | null;
  max_uses?: number | null;
}): Promise<CompanyCode> {
  const r = await api<Envelope<CompanyCode>>("/v1/admin/company-codes", {
    method: "POST",
    json: input,
  });
  return r.data;
}

/** DELETE /v1/admin/company-codes/{id} */
export async function revokeCompanyCode(id: string): Promise<void> {
  await api(`/v1/admin/company-codes/${id}`, { method: "DELETE" });
}
