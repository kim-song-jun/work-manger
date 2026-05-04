import { api } from "@shared/api";
import type { Notice } from "../model/types";

type Envelope<T> = { data: T };

export async function fetchNotice(id: string): Promise<Notice> {
  const r = await api<Envelope<Notice>>(`/v1/notices/${id}`);
  return r.data;
}
