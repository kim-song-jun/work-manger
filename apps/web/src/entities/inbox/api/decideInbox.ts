import { api } from "@shared/api";

export type DecisionBody = { reason?: string };

export async function approveInbox(id: string, body: DecisionBody = {}): Promise<void> {
  await api(`/v1/inbox/${id}/approve`, { method: "POST", json: body });
}

export async function rejectInbox(id: string, body: DecisionBody = {}): Promise<void> {
  await api(`/v1/inbox/${id}/reject`, { method: "POST", json: body });
}
