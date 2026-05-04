import { api } from "@shared/api";
import type { FetchNoticesQuery, Notice } from "../model/types";

type Envelope<T> = { data: T };

export async function fetchNotices(
  query: FetchNoticesQuery = {},
): Promise<Notice[]> {
  const search = new URLSearchParams();
  if (query.pinned) search.set("pinned", "true");
  if (query.category) search.set("category", query.category);
  if (query.q) search.set("q", query.q);
  const qs = search.toString();
  const path = qs ? `/v1/notices?${qs}` : "/v1/notices";
  const r = await api<Envelope<Notice[]>>(path);
  return r.data;
}
