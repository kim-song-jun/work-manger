import { api } from "@shared/api";
import type { LeaveApplyBody, LeaveRequest } from "../model/types";

type Envelope<T> = { data: T };

export async function applyLeave(body: LeaveApplyBody): Promise<LeaveRequest> {
  const r = await api<Envelope<LeaveRequest>>("/v1/leave/requests", {
    method: "POST",
    json: body,
  });
  return r.data;
}

export function leaveDays(body: Pick<LeaveApplyBody, "kind" | "start_date" | "end_date">): number {
  if (body.kind !== "FULL") return 0.5;
  const a = new Date(body.start_date);
  const b = new Date(body.end_date);
  const ms = b.getTime() - a.getTime();
  if (Number.isNaN(ms) || ms < 0) return 0;
  return Math.floor(ms / 86_400_000) + 1;
}
