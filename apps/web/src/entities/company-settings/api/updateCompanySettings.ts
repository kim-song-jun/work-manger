import { api } from "@shared/api";

import type { CompanySettings, CompanySettingsPatch } from "../model/types";

type Envelope<T> = { data: T };

export async function updateCompanySettings(
  patch: CompanySettingsPatch,
): Promise<CompanySettings> {
  const r = await api<Envelope<CompanySettings>>("/v1/admin/settings/update", {
    method: "PATCH",
    json: patch,
  });
  return r.data;
}
