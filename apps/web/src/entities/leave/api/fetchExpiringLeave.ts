import { api } from "@shared/api";

type Envelope<T> = { data: T };
type BackendExpiringRow = {
  membership_id: string;
  name: string;
  department?: string | null;
  remaining: string | number;
  used: string | number;
  accrued: string | number;
  expiring: string | number;
};

export type ExpiringLeaveRow = {
  membershipId: string;
  name: string;
  department: string | null;
  remaining: number;
  used: number;
  accrued: number;
  expiring: number;
};

function toNumber(v: string | number | undefined): number {
  if (v === undefined || v === null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function fetchExpiringLeave(): Promise<ExpiringLeaveRow[]> {
  const r = await api<Envelope<BackendExpiringRow[]>>("/v1/admin/leave/expiring");
  return Array.isArray(r.data)
    ? r.data.map((row) => ({
        membershipId: row.membership_id,
        name: row.name,
        department: row.department ?? null,
        remaining: toNumber(row.remaining),
        used: toNumber(row.used),
        accrued: toNumber(row.accrued),
        expiring: toNumber(row.expiring),
      }))
    : [];
}
