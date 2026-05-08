import { api, HttpError } from "@shared/api";

import type { AuditFilters, AuditPage } from "../model/types";

type Envelope<T> = { data: T };

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
    const r = await api<Envelope<AuditPage>>(path);
    return {
      items: Array.isArray(r.data?.items) ? r.data.items : [],
      next_cursor: r.data?.next_cursor ?? null,
    };
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      return { items: [], next_cursor: null };
    }
    throw e;
  }
}
