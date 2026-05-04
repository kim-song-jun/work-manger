import { api, HttpError } from "@shared/api";
import type { CompanyComplianceBoard } from "../model/types";

type Envelope<T> = { data: T };

/** GET /v1/admin/compliance/52h?week=YYYY-MM-DD — admin board. */
export async function fetchCompanyCompliance(
  week?: string,
): Promise<CompanyComplianceBoard | null> {
  const qs = week ? `?week=${encodeURIComponent(week)}` : "";
  try {
    const r = await api<Envelope<CompanyComplianceBoard>>(
      `/v1/admin/compliance/52h${qs}`,
    );
    return r.data;
  } catch (e) {
    if (e instanceof HttpError && (e.status === 404 || e.status === 401)) {
      return null;
    }
    throw e;
  }
}
