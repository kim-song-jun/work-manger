import { api, HttpError } from "@shared/api";
import type { InboxItem, InboxList, InboxStatus } from "../model/types";

type Envelope<T> = { data: T; counts?: InboxList["counts"]; next_cursor?: string | null };

export type InboxQuery = {
  scope?: "me" | "company";   // company → /v1/admin/approvals
  status?: InboxStatus | "ALL";
  cursor?: string | null;
  limit?: number;
};

export async function fetchInbox(q: InboxQuery = {}): Promise<InboxList> {
  const u = new URLSearchParams();
  if (q.status && q.status !== "ALL") u.set("status", q.status);
  if (q.cursor) u.set("cursor", q.cursor);
  if (q.limit) u.set("limit", String(q.limit));
  const base = q.scope === "company" ? "/v1/admin/approvals" : "/v1/inbox";
  const path = base + (u.toString() ? `?${u.toString()}` : "");
  try {
    const r = await api<Envelope<InboxItem[]>>(path);
    return {
      items: r.data ?? [],
      counts: r.counts,
      next_cursor: r.next_cursor ?? null,
    };
  } catch (e) {
    if (e instanceof HttpError && (e.status === 404 || e.status === 401)) {
      return { items: [], next_cursor: null };
    }
    throw e;
  }
}
