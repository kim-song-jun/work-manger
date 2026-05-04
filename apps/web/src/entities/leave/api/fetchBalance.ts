import { api, HttpError } from "@shared/api";
import type { paths } from "@shared/api/openapi-types";
import type { LeaveBalance } from "../model/types";

// Smoke proof: codegen output is consumed. The backend has not yet declared
// response schemas in drf-spectacular, so the generated `200.content` is empty;
// once backend annotates `@extend_schema(responses=LeaveBalanceSerializer)` the
// envelope below can switch to the generated shape.
export type LeaveBalanceOp = paths["/v1/leave/balance"]["get"];
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
