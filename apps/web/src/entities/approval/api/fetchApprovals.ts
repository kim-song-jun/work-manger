import { api, HttpError } from "@shared/api";

import type { ApprovalKind, ApprovalRow, ApprovalStatus } from "../model/types";

type Envelope<T> = { data: T };

/**
 * BE canonical shape for `/v1/admin/approvals`. Status / target_type ship in
 * uppercase enum form (`PENDING`, `OVERTIME`, ...) and the requester column is
 * `requester_name`, not `employee_name`. We translate to the camel/lowercase
 * shape the FE pages already consume — keeps the rest of the entities/pages
 * stable while the BE bulk endpoint (audit GAP-B 2026-05-07) lands.
 */
type BackendApprovalRow = {
  id: string;
  target_type: "LEAVE" | "OVERTIME" | "TRIP" | "MANUAL_CLOCK_IN";
  target_id?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requester_name?: string | null;
  requester_id?: string | null;
  approver_name?: string | null;
  team?: string | null;
  summary?: string | null;
  reason?: string | null;
  created_at?: string | null;
  submitted_at?: string | null;
};

function fromBackend(b: BackendApprovalRow): ApprovalRow {
  return {
    id: b.id,
    kind: b.target_type.toLowerCase() as ApprovalKind,
    status: (b.status?.toLowerCase() ?? "pending") as ApprovalStatus,
    employee_id: b.requester_id ?? "",
    employee_name: b.requester_name ?? "",
    team: b.team ?? null,
    summary: b.summary ?? "",
    reason: b.reason ?? null,
    submitted_at: b.submitted_at ?? b.created_at ?? "",
  };
}

/** GET /v1/admin/approvals?status= */
export async function fetchApprovals(
  status: ApprovalStatus | "all" = "pending",
): Promise<ApprovalRow[]> {
  const qs = status && status !== "all" ? `?status=${status}` : "";
  try {
    const r = await api<Envelope<BackendApprovalRow[]>>(`/v1/admin/approvals${qs}`);
    return Array.isArray(r.data) ? r.data.map(fromBackend) : [];
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return [];
    throw e;
  }
}

/**
 * Sentinel class so callers can distinguish "already decided" from generic
 * errors and show the dedicated i18n key `admin.appr_already_decided`.
 */
export class AlreadyDecidedError extends Error {
  constructor() {
    super("ALREADY_DECIDED");
    this.name = "AlreadyDecidedError";
  }
}

/** PATCH /v1/admin/approvals/{id} — single approve/reject. */
export async function decideApproval(
  id: string,
  decision: "approve" | "reject",
): Promise<void> {
  try {
    await api(`/v1/admin/approvals/${id}`, {
      method: "PATCH",
      json: { decision },
    });
  } catch (e) {
    if (
      e instanceof HttpError &&
      (e.status === 409 || e.status === 422) &&
      e.body?.error?.code === "ALREADY_DECIDED"
    ) {
      throw new AlreadyDecidedError();
    }
    throw e;
  }
}
