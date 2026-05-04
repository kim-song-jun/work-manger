import { api, HttpError } from "@shared/api";
import type { AdminDashboard } from "../model/types";

type Envelope<T> = { data: T };

/** GET /v1/admin/dashboard — today KPIs. */
export async function fetchAdminDashboard(): Promise<AdminDashboard | null> {
  try {
    const r = await api<Envelope<AdminDashboard>>("/v1/admin/dashboard");
    return r.data;
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }
}
