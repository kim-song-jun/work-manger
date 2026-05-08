import { api, HttpError } from "@shared/api";

import type { NotificationItem, NotificationList } from "../model/types";

type Envelope<T> = { data: T; next_cursor?: string | null };

export async function fetchNotifications(): Promise<NotificationList> {
  try {
    const r = await api<Envelope<NotificationItem[]>>("/v1/notifications");
    return { items: r.data ?? [], next_cursor: r.next_cursor ?? null };
  } catch (e) {
    if (e instanceof HttpError && (e.status === 404 || e.status === 401)) {
      return { items: [], next_cursor: null };
    }
    throw e;
  }
}

export async function markRead(id: string): Promise<void> {
  try {
    await api(`/v1/notifications/${id}/read`, { method: "POST" });
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return;
    throw e;
  }
}

export async function markAllRead(): Promise<void> {
  try {
    await api(`/v1/notifications/read-all`, { method: "POST" });
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return;
    throw e;
  }
}
