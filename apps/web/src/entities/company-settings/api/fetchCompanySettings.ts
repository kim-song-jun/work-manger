import { api } from "@shared/api";

import type { CompanySettings } from "../model/types";

type Envelope<T> = { data: T };

export async function fetchCompanySettings(): Promise<CompanySettings> {
  const r = await api<Envelope<CompanySettings>>("/v1/admin/settings");
  return r.data;
}
