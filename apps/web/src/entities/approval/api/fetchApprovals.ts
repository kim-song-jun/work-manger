import { api, HttpError } from "@shared/api";
import type { ApprovalRow, ApprovalStatus } from "../model/types";

type Envelope<T> = { data: T };

/** GET /v1/admin/approvals?status= */
export async function fetchApprovals(
  status: ApprovalStatus | "all" = "pending",
): Promise<ApprovalRow[]> {
  const qs = status && status !== "all" ? `?status=${status}` : "";
  try {
    const r = await api<Envelope<ApprovalRow[]>>(`/v1/admin/approvals${qs}`);
    return Array.isArray(r.data) ? r.data : [];
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return [];
    throw e;
  }
}

/** PATCH /v1/admin/approvals/{id} — single approve/reject. */
export async function decideApproval(
  id: string,
  decision: "approve" | "reject",
): Promise<void> {
  await api(`/v1/admin/approvals/${id}`, {
    method: "PATCH",
    json: { decision },
  });
}
