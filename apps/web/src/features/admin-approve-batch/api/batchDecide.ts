import { api } from "@shared/api";

export type BatchOutcome = {
  total: number;
  succeeded: number;
  failed: number;
  failedIds: string[];
};

type Envelope<T> = { data: T };
type BackendBulkResult = {
  total: number;
  succeeded: number;
  failed: number;
  failed_ids: string[];
};

/** POST /v1/admin/approvals/bulk — single round-trip batch decide. */
export async function batchDecide(
  ids: string[],
  decision: "approve" | "reject",
): Promise<BatchOutcome> {
  if (!ids.length) return { total: 0, succeeded: 0, failed: 0, failedIds: [] };
  const r = await api<Envelope<BackendBulkResult>>("/v1/admin/approvals/bulk", {
    method: "POST",
    json: { ids, decision },
  });
  return {
    total: r.data.total,
    succeeded: r.data.succeeded,
    failed: r.data.failed,
    failedIds: r.data.failed_ids ?? [],
  };
}
