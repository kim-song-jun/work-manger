import { api, HttpError } from "@shared/api";
import type { LeaveBalance } from "../model/types";

type Envelope<T> = { data: T };

export async function fetchBalance(): Promise<LeaveBalance | null> {
  try {
    const r = await api<Envelope<LeaveBalance>>("/v1/leave/balance");
    return r.data;
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }
}
