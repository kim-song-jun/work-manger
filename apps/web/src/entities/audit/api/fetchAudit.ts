import { api, HttpError } from "@shared/api";

import type { AuditEntry, AuditFilters, AuditPage } from "../model/types";

type Envelope<T> = { data: T };

/**
 * Raw shape BE currently emits (iter11 HEAD).
 * BE sends `created_at` and `actor_id`; the FE type expects `at` and `actor_name`.
 * W4c will add the canonical fields server-side; until then we map defensively.
 */
type RawAuditEntry = {
  id: string;
  action: string;
  actor?: string;
  actor_id?: string | null;
  actor_name?: string | null;
  target?: string | null;
  target_id?: string | null;
  at?: string | null;
  created_at?: string | null;
  metadata?: Record<string, unknown>;
};

function normaliseEntry(raw: RawAuditEntry): AuditEntry {
  return {
    id: raw.id,
    action: raw.action,
    // BE W4c fix will supply `actor_name`; fallback to "(Unknown)" until merged.
    actor: raw.actor ?? raw.actor_id ?? "",
    actor_name: raw.actor_name ?? undefined,
    target: raw.target ?? undefined,
    target_id: raw.target_id ?? undefined,
    // BE W4c fix will supply `at`; fallback to `created_at` until merged.
    at: raw.at ?? raw.created_at ?? "",
    metadata: raw.metadata,
  };
}

/**
 * GET /v1/admin/audit — cursor-paginated audit log.
 * Returns empty page on 404 so consumers can render "no entries" without
 * special-casing the network layer.
 */
export async function fetchAudit(
  filters: AuditFilters = {},
  cursor: string | null = null,
): Promise<AuditPage> {
  const params = new URLSearchParams();
  if (filters.action) params.set("action", filters.action);
  if (filters.actor) params.set("actor", filters.actor);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (cursor) params.set("cursor", cursor);
  const qs = params.toString();
  const path = `/v1/admin/audit${qs ? `?${qs}` : ""}`;
  try {
    const r = await api<Envelope<{ items: RawAuditEntry[]; next_cursor: string | null }>>(path);
    return {
      items: Array.isArray(r.data?.items) ? r.data.items.map(normaliseEntry) : [],
      next_cursor: r.data?.next_cursor ?? null,
    };
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      return { items: [], next_cursor: null };
    }
    throw e;
  }
}
