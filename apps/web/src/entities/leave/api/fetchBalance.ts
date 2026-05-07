import { api } from "@shared/api";
import type { paths } from "@shared/api/openapi-types";
import type { LeaveBalance } from "../model/types";

// Smoke proof: codegen output is consumed. The backend has not yet declared
// response schemas in drf-spectacular, so the generated `200.content` is empty;
// once backend annotates `@extend_schema(responses=LeaveBalanceSerializer)` the
// envelope below can switch to the generated shape.
export type LeaveBalanceOp = paths["/v1/leave/balance"]["get"];
type Envelope<T> = { data: T };
type BackendLeaveBalance = {
  granted_total?: string | number;
  used?: string | number;
  remaining?: string | number;
  accrued?: string | number;
  expiring?: string | number;
  expiring_soon?: Array<{ days: string | number }>;
};

export type FetchBalanceOptions = {
  employeeId?: string;
};

function toNumber(v: string | number | undefined): number {
  if (v === undefined || v === null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fromBackendBalance(data: BackendLeaveBalance): LeaveBalance {
  return {
    remaining: toNumber(data.remaining),
    used: toNumber(data.used),
    accrued: toNumber(data.accrued ?? data.granted_total),
    expiring:
      data.expiring !== undefined
        ? toNumber(data.expiring)
        : (data.expiring_soon ?? []).reduce((sum, row) => sum + toNumber(row.days), 0),
  };
}

export async function fetchBalance(
  options: FetchBalanceOptions = {},
): Promise<LeaveBalance> {
  const qs = options.employeeId
    ? `?employee_id=${encodeURIComponent(options.employeeId)}`
    : "";
  const r = await api<Envelope<BackendLeaveBalance>>(`/v1/leave/balance${qs}`);
  return fromBackendBalance(r.data);
}
