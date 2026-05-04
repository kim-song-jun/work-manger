import { decideApproval } from "@entities/approval";

export type BatchOutcome = {
  total: number;
  succeeded: number;
  failed: number;
  failedIds: string[];
};

/**
 * Calls per-id approve/reject in parallel using Promise.allSettled.
 *
 * TODO: replace with a single bulk endpoint once backend exposes
 * POST /v1/admin/approvals/bulk.
 */
export async function batchDecide(
  ids: string[],
  decision: "approve" | "reject",
): Promise<BatchOutcome> {
  if (!ids.length) return { total: 0, succeeded: 0, failed: 0, failedIds: [] };
  const results = await Promise.allSettled(
    ids.map((id) => decideApproval(id, decision)),
  );
  const failedIds: string[] = [];
  let succeeded = 0;
  results.forEach((r, i) => {
    if (r.status === "fulfilled") succeeded += 1;
    else failedIds.push(ids[i]);
  });
  return {
    total: ids.length,
    succeeded,
    failed: failedIds.length,
    failedIds,
  };
}
