import { api, HttpError } from "@shared/api";
import type { AdminMonthlyReport } from "../model/types";

type Envelope<T> = { data: T };

/** GET /v1/admin/reports/monthly?ym=YYYY-MM */
export async function fetchMonthlyReport(
  ym: string,
): Promise<AdminMonthlyReport | null> {
  try {
    const r = await api<Envelope<AdminMonthlyReport>>(
      `/v1/admin/reports/monthly?ym=${encodeURIComponent(ym)}`,
    );
    return r.data;
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }
}
